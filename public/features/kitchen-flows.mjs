import { getSession, api, signIn, signUp, loadKitchen, scanReceipt } from "../lib/api.mjs";
import { SAMPLE_SCAN, validateItems, validateImage, MAX_IMAGE_BYTES, matchRecipes, daysUntil, localDate } from "../lib/domain.mjs";
import { isNativeApp, captureNativeReceipt } from "../lib/capture.mjs";
import { catalog } from "../lib/recipes.mjs";
import { icon, escape, art } from "../lib/ui.mjs";
import * as kitchen from "../lib/kitchen.mjs";
const $ = (selector) => document.querySelector(selector);
function createKitchenFlows({ state, render, toast, showModal, closeModal, modalError, onSessionChanged, onKitchenSaved, openRecipe }) {
  const persistLocal = () => kitchen.persistLocal(state.pantry);
  // Never reuse a signed-in pantry for a local save after Auth expires.
  function ensureIdentity() {
    if (state.signed === Boolean(getSession())) return true;
    closeModal();
    onSessionChanged().then(() => toast("Your session changed. Please try again.")).catch(error => toast(error.message));
    return false;
  }
  function openScan() {
    state.file = null;
    state.live = null;
    showModal("Fill up your fridge", `<div class="flow-steps"><span class="current">1 Upload</span><i></i><span>2 Review</span><i></i><span>3 In your fridge</span></div><p class="modal-lead">Your groceries, all in one place.</p><p class="muted">Upload a clear photo of the whole receipt. We’ll find the food items for you to check.</p><label class="upload-zone" id="drop-zone"><input type="file" id="receipt-file" accept="image/jpeg,image/png,image/webp"><span class="upload-icon">${icon("scan")}</span><strong>Choose a receipt photo</strong><span>or drop it here</span><small>JPEG, PNG or WebP · up to 6 MB</small></label><div id="file-preview"></div><label class="consent"><input type="checkbox" id="ai-consent"><span>I agree to send this receipt image to OpenAI for ingredient extraction. Receipts may include personal details; crop those out first.</span></label><button id="scan-live" class="button primary full" disabled>${icon("spark")} Read my receipt</button><div class="or-divider"><span>OR TRY IT OUT</span></div><button id="scan-sample" class="button outline full">${icon("receipt")} Use the sample receipt</button><p class="sample-note">Preset food items, clearly labeled. ${getSession() ? "Saved to your private fridge." : "No account needed; saved on this device."}</p>${!getSession() ? '<button id="scan-signin" class="text-button centered">Sign in to scan your own receipt →</button>' : ""}`);
    const status = document.createElement("p");
    status.id = "live-scan-status";
    status.className = "sample-note";
    status.textContent = getSession() ? "Checking live scanning…" : "Sign in to scan your own receipt.";
    $("#scan-live").after(status);
    const fixture = document.createElement("a");
    fixture.href = "/sample-receipt.png";
    fixture.download = "ingredi-sample-receipt.png";
    fixture.className = "sample-download";
    fixture.textContent = "Download a synthetic receipt for testing";
    $("#scan-sample").after(fixture);
    if (getSession()) api("/functions/v1/scan-receipt").then((result) => {
      if ($("#live-scan-status") !== status) return;
      state.live = result.live_ai_configured;
      status.textContent = state.live ? "Live scanner is configured." : "Live scanning is not configured yet. You can use the sample receipt.";
      updateScanReady();
    }).catch(() => {
      if ($("#live-scan-status") === status) {
        state.live = false;
        status.textContent = "Live scanning is unavailable. Reopen this screen to retry, or use the sample.";
        updateScanReady();
      }
    });
    $("#scan-sample").onclick = startSample;
    if (isNativeApp()) {
      $("#drop-zone").hidden = true;
      const controls = document.createElement("div");
      controls.className = "native-picker-actions";
      controls.innerHTML = `<button type="button" class="button outline" data-capture="camera">${icon("camera")} Take photo</button><button type="button" class="button outline" data-capture="photos">${icon("upload")} Choose Photos</button>`;
      $("#drop-zone").before(controls);
      controls.querySelectorAll("[data-capture]").forEach((button) => button.onclick = async () => {
        if (state.busy) return;
        state.busy = true;
        controls.querySelectorAll("button").forEach((b) => b.disabled = true);
        try {
          const file = await captureNativeReceipt(button.dataset.capture);
          if (file) await chooseFile(file);
        } catch (error) {
          modalError(error.message);
        } finally {
          state.busy = false;
          controls.querySelectorAll("button").forEach((b) => b.disabled = false);
          updateScanReady();
        }
      });
      fixture.replaceWith(Object.assign(document.createElement("button"), { type: "button", className: "text-button centered", textContent: "Load demo photo for live AI", onclick: async () => {
        try {
          const response = await fetch("/sample-receipt.png");
          if (!response.ok) throw new Error();
          await chooseFile(new File([await response.blob()], "demo-receipt.png", { type: "image/png" }));
        } catch {
          modalError("The demo photo could not be loaded. Try the sample receipt instead.");
        }
      } }));
    }
    $("#scan-signin")?.addEventListener("click", () => {
      state.authMode = "signin";
      openAuth();
    });
    $("#receipt-file").onchange = (e) => chooseFile(e.target.files[0]);
    $("#ai-consent").onchange = updateScanReady;
    const zone = $("#drop-zone");
    zone.ondragover = (e) => {
      e.preventDefault();
      zone.classList.add("dragover");
    };
    zone.ondragleave = () => zone.classList.remove("dragover");
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      chooseFile(e.dataTransfer.files[0]);
    };
    $("#scan-live").onclick = () => startScan("live");
  }
  function updateScanReady() {
    const button = $("#scan-live");
    if (button) button.disabled = !state.file || !$("#ai-consent")?.checked || !getSession() || state.live !== true;
  }
  async function chooseFile(file) {
    if (!file) return;
    const target = $("#file-preview");
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Choose a receipt photo under 6 MB.");
      validateImage(new Uint8Array(await file.arrayBuffer()), file.type);
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      if ($("#file-preview") !== target) return;
      state.file = file;
      if (state.preview) URL.revokeObjectURL(state.preview);
      state.preview = URL.createObjectURL(file);
      $("#file-preview").innerHTML = `<div class="file-preview"><img src="${state.preview}" alt="Your receipt preview"><div><strong>${escape(file.name)}</strong><span>${(file.size / 1024).toFixed(0)} KB · ready to scan</span></div>${icon("check")}</div>`;
      updateScanReady();
      $("#modal-error")?.remove();
    } catch (error) {
      state.file = null;
      $("#scan-live").disabled = true;
      $("#file-preview").innerHTML = "";
      modalError(error.message);
    }
  }
  async function startSample() {
    if (!ensureIdentity()) return;
    if (getSession()) {
      await startScan("sample");
      return;
    }
    const scan = { id: crypto.randomUUID(), status: "processed", extracted_items: structuredClone(SAMPLE_SCAN.items), metadata: { mode: "sample", merchant: SAMPLE_SCAN.merchant, skipped_non_food: SAMPLE_SCAN.skipped_non_food, warnings: SAMPLE_SCAN.warnings }, local: true };
    openReview(scan);
  }
  async function startScan(mode) {
    if (state.busy) return;
    const file = state.file;
    if (mode === "live" && (!file || !$("#ai-consent")?.checked)) return;
    state.busy = true;
    showModal("Reading your receipt", `<div class="processing"><div class="scan-animation">${icon("receipt")}</div><h3>${mode === "sample" ? "Opening the sample receipt…" : "Finding the good stuff…"}</h3><p>${mode === "sample" ? "Preset food items · saved through your real backend." : "Your image is being read by OpenAI. This can take up to a minute."}</p><span class="spinner"></span></div>`);
    $("#close-modal").disabled = true;
    try {
      const scan = await scanReceipt({ id: crypto.randomUUID(), file, mode });
      state.busy = false;
      openReview(scan);
    } catch (error) {
      state.busy = false;
      openScan();
      modalError(error.name === "TimeoutError" ? "This is taking longer than expected. Refresh your fridge to check for a finished scan before retrying." : error.message);
    }
  }
  function openReview(scan) {
    state.scan = scan;
    state.review = scan.extracted_items.map((item) => ({ ...item, selected: item.confidence !== "low", expires_on: null }));
    renderReview();
  }
  function renderReview() {
    const scan = state.scan;
    const selected = state.review.filter((i) => i.selected).length;
    showModal("Review your ingredients", `<div class="flow-steps"><span>1 Upload</span><i></i><span class="current">2 Review</span><i></i><span>3 In your fridge</span></div><div class="scan-summary">${icon("receipt")}<div><strong>We found ${state.review.length} food items</strong><p>${escape(scan.metadata?.merchant || "Your receipt")} · ${scan.metadata?.skipped_non_food || 0} non-food items skipped</p></div></div><div class="mode-badge ${scan.metadata?.mode === "sample" ? "sample" : ""}">${icon(scan.metadata?.mode === "sample" ? "info" : "spark")}${scan.metadata?.mode === "sample" ? "Sample receipt · preset extraction" : "Live AI extraction · check every item"}${scan.local ? " · saved on this device" : ""}</div>${scan.metadata?.warnings?.length ? `<div class="review-warning">${icon("info")}<div>${scan.metadata.warnings.map((w) => `<p>${escape(w)}</p>`).join("")}</div></div>` : ""}<p class="review-note">Edit names and amounts, skip anything you don’t need, and set dates if you know them. Dates are optional.</p><div class="review-heading"><strong>Ingredients <span id="selected-count">${selected} selected</span></strong><button class="text-button" id="toggle-all">${selected === state.review.length ? "Deselect all" : "Select all"}</button></div><form id="review-form"><div class="review-items">${state.review.map((item, i) => `<div class="review-item ${item.confidence === "low" ? "uncertain" : ""}"><div class="review-item-main"><label class="item-checkbox"><input type="checkbox" data-select="${i}" ${item.selected ? "checked" : ""} aria-label="Include ${escape(item.name)}"></label><div class="review-fields"><label class="sr-only" for="name-${i}">Ingredient name ${i + 1}</label><input id="name-${i}" data-field="name" data-index="${i}" class="name-input" value="${escape(item.name)}" maxlength="100" required><span class="raw-line">${item.confidence !== "high" ? "<b>Check this item</b> · " : ""}${escape(item.raw_line || "")}</span></div><span class="review-emoji" aria-hidden="true">${art(item.name)}</span></div><div class="item-detail-fields"><label>Amount<input data-field="quantity" data-index="${i}" type="number" min="0.01" max="10000" step="0.01" value="${item.quantity}" required></label><label>Unit<input data-field="unit" data-index="${i}" value="${escape(item.unit)}" maxlength="30" required></label><label class="date-field">Best before<input data-field="expires_on" data-index="${i}" type="date" value="${item.expires_on || ""}"></label></div></div>`).join("")}</div><div class="modal-footer"><button type="button" id="rescan" class="text-button">${icon("back")} Start over</button><button type="submit" id="confirm-items" class="button primary" ${!selected ? "disabled" : ""}>Add ${selected} item${selected === 1 ? "" : "s"} to fridge ${icon("arrow")}</button></div></form>`, true);
    document.querySelectorAll("[data-select]").forEach((input) => input.onchange = () => {
      state.review[Number(input.dataset.select)].selected = input.checked;
      updateReviewCount();
    });
    document.querySelectorAll("[data-field]").forEach((input) => input.oninput = () => {
      const item = state.review[Number(input.dataset.index)];
      item[input.dataset.field] = input.dataset.field === "quantity" ? Number(input.value) : input.value;
    });
    $("#toggle-all").onclick = () => {
      const all = state.review.every((i) => i.selected);
      state.review.forEach((i) => i.selected = !all);
      renderReview();
    };
    $("#rescan").onclick = openScan;
    $("#review-form").noValidate = true;
    $("#review-form").onsubmit = (e) => {
      e.preventDefault();
      confirmItems();
    };
  }
  function updateReviewCount() {
    const count = state.review.filter((i) => i.selected).length;
    $("#selected-count").textContent = `${count} selected`;
    $("#confirm-items").innerHTML = `Add ${count} item${count === 1 ? "" : "s"} to fridge ${icon("arrow")}`;
    $("#confirm-items").disabled = !count;
    $("#toggle-all").textContent = count === state.review.length ? "Deselect all" : "Select all";
  }
  async function confirmItems() {
    if (!ensureIdentity()) return;
    if (state.busy) return;
    let items;
    try {
      items = validateItems(state.review.filter((i) => i.selected));
    } catch (error) {
      modalError(error.message);
      return;
    }
    state.busy = true;
    $("#confirm-items").disabled = true;
    $("#confirm-items").textContent = "Adding to your fridge…";
    $("#close-modal").disabled = true;
    try {
      let count;
      if (state.scan.local) {
        const existing = state.pantry.filter((i) => i.receipt_scan_id === state.scan.id);
        if (!existing.length) {
          state.pantry = [...items.map((item, i) => ({ ...item, id: `${state.scan.id}-${i}`, source: "receipt", receipt_scan_id: state.scan.id })), ...state.pantry];
          persistLocal();
        }
        count = existing.length || items.length;
      } else {
        const result = await api("/rest/v1/rpc/confirm_receipt", { method: "POST", body: { p_scan_id: state.scan.id, p_items: items } });
        count = result.count;
        try {
          Object.assign(state, await loadKitchen());
          state.error = "";
        } catch {
          state.error = "Your items were saved. Refresh to load your updated fridge.";
        }
      }
      state.busy = false;
      onKitchenSaved();
      render();
      showSuccess(count, items);
    } catch (error) {
      state.busy = false;
      $("#close-modal").disabled = false;
      updateReviewCount();
      modalError(error.message);
    }
  }
  function openAuth() {
    const create = state.authMode === "signup";
    showModal(create ? "Make room for good things" : "Welcome to your kitchen", `<div class="auth-symbol">${icon("leaf")}</div><p class="modal-lead">${create ? "A fresh start. Less food waste." : "Good to have you back."}</p><p class="muted">Sign in to keep your private fridge with you.</p><form id="auth-form"><label class="form-label">Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label><label class="form-label">Password<input name="password" type="password" autocomplete="${create ? "new-password" : "current-password"}" minlength="8" required placeholder="At least 8 characters"></label><button id="auth-submit" class="button primary full" type="submit">${create ? "Create my kitchen" : "Sign in"} ${icon("arrow")}</button></form><button class="text-button centered" id="auth-switch">${create ? "Already have an account? Sign in" : "New here? Create an account"}</button><p class="sample-note">Local sample ingredients stay separate from your signed-in fridge.</p>`);
    $("#auth-switch").onclick = () => {
      state.authMode = create ? "signin" : "signup";
      openAuth();
    };
    $("#auth-form").onsubmit = async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const button = $("#auth-submit");
      button.disabled = true;
      state.busy = true;
      $("#close-modal").disabled = true;
      try {
        const result = await (create ? signUp(form.get("email"), form.get("password")) : signIn(form.get("email"), form.get("password")));
        state.busy = false;
        if (create && !result.access_token) {
          showModal("Check your inbox", `<div class="account-info">${icon("check")}<h3>One last step.</h3><p>Open the confirmation email from Supabase, then return here and sign in.</p></div><button id="back-signin" class="button primary full">Back to sign in</button>`);
          $("#back-signin").onclick = () => {
            state.authMode = "signin";
            openAuth();
          };
          return;
        }
        state.pantry = [];
        state.scans = [];
        closeModal();
        await onSessionChanged();
        toast("Your kitchen is connected.");
      } catch (error) {
        state.busy = false;
        button.disabled = false;
        $("#close-modal").disabled = false;
        modalError(error.message);
      }
    };
  }
  function showSuccess(count, items) {
    const soon = items.filter((i) => daysUntil(i.expires_on) !== null && daysUntil(i.expires_on) <= 3);
    const recipes = matchRecipes(catalog(state.recipes), state.pantry).slice(0, 2);
    showModal("All added", `<div class="success-state"><div class="success-check">${icon("check")}</div><h2>${count} item${count === 1 ? "" : "s"} added to your fridge</h2><p>${escape(items.map((i) => i.name).join(", "))}</p><span class="mode-badge">${getSession() ? "Saved to your account" : "Sample items · saved on this device"}</span></div>${soon.length ? `<h3 class="block-title">Use these soon</h3><div class="chip-row">${soon.map((i) => `<span class="chip">${escape(i.name)} · ${daysUntil(i.expires_on)} days</span>`).join("")}</div>` : ""}<h3 class="block-title">You can cook now</h3>${recipes.map((r) => `<button class="result-recipe" data-success-recipe="${escape(r.id)}">${art(r.name)}<span><strong>${escape(r.name)}</strong><small>${r.cook_minutes} min · Have ${r.have}/${r.total} ingredients</small></span>${icon("arrow")}</button>`).join("")}<div class="modal-footer"><button id="another" class="button outline">Scan another</button><button id="done" class="button primary">Done</button></div>`);
    $("#done").onclick = closeModal;
    $("#another").onclick = openScan;
    document.querySelectorAll("[data-success-recipe]").forEach((b) => b.onclick = () => {
      closeModal();
      openRecipe(b.dataset.successRecipe);
    });
  }
  function openManual() {
    state.staged ||= [];
    const staged = state.staged;
    showModal("Fill up fridge", `<form id="quick-add-form" class="inline-form"><label class="sr-only" for="ingredient-name">Ingredient name</label><input id="ingredient-name" name="name" placeholder="Type an ingredient" maxlength="100" required><button class="button primary">Add</button></form><button class="button outline full" id="manual-scan">${icon("camera")} Scan a receipt</button><h3 class="block-title">Quick add</h3><div class="chip-row">${["Milk", "Eggs", "Onion", "Garlic", "Chicken", "Tomato", "Carrot", "Cheese", "Bread", "Green onion"].map((n) => `<button class="chip ${staged.some((i) => i.name === n) ? "selected" : ""}" data-quick="${n}">${icon(staged.some((i) => i.name === n) ? "check" : "plus")}${n}</button>`).join("")}</div><h3 class="block-title">Adding (${staged.length})</h3><p class="muted">Set amounts and dates if you know them.</p><div class="staged-items">${staged.map((i, n) => `<div class="staged-row"><div class="staged-name"><strong>${escape(i.name)}</strong><button class="icon-button" data-unstage="${n}" aria-label="Remove ${escape(i.name)}">${icon("close")}</button></div><div class="form-row"><label>Amount<input data-stage="${n}" data-field="quantity" type="number" min=".01" max="10000" step=".01" value="${i.quantity}"></label><label>Unit<input data-stage="${n}" data-field="unit" value="${escape(i.unit)}" maxlength="30"></label><label>Best before<input data-stage="${n}" data-field="expires_on" type="date" value="${i.expires_on || ""}"></label></div></div>`).join("") || '<p class="muted">Choose a quick add, or type your own ingredient.</p>'}</div><div class="modal-footer"><button class="button primary full" id="save-staged" ${staged.length ? "" : "disabled"}>Add ${staged.length} item${staged.length === 1 ? "" : "s"} to fridge</button></div>`);
    const stage = (name) => {
      if (staged.length >= 50) {
        modalError("Add up to 50 ingredients at a time.");
        return;
      }
      staged.push({ name: name.trim(), quantity: 1, unit: "item", expires_on: null });
      openManual();
    };
    $("#quick-add-form").onsubmit = (e) => {
      e.preventDefault();
      const name = new FormData(e.target).get("name");
      if (name.trim()) stage(name);
    };
    $("#manual-scan").onclick = openScan;
    document.querySelectorAll("[data-quick]").forEach((b) => b.onclick = () => {
      const index = staged.findIndex((i) => i.name === b.dataset.quick);
      if (index >= 0) {
        staged.splice(index, 1);
        openManual();
      } else stage(b.dataset.quick);
    });
    document.querySelectorAll("[data-unstage]").forEach((b) => b.onclick = () => {
      staged.splice(Number(b.dataset.unstage), 1);
      openManual();
    });
    document.querySelectorAll("[data-stage]").forEach((input) => input.oninput = () => {
      staged[Number(input.dataset.stage)][input.dataset.field] = input.dataset.field === "quantity" ? Number(input.value) : input.value;
    });
    $("#save-staged").onclick = async () => {
      if (!ensureIdentity()) return;
      if (state.busy) return;
      try {
        validateItems(staged);
        state.busy = true;
        $("#save-staged").disabled = true;
        state.pantry = await kitchen.add(state.pantry, staged);
        const items = structuredClone(staged);
        state.staged = [];
        state.busy = false;
        onKitchenSaved();
        render();
        showSuccess(items.length, items);
      } catch (error) {
        state.busy = false;
        if ($("#save-staged")) $("#save-staged").disabled = false;
        modalError(error.message);
      }
    };
  }
  function editDate(id) {
    const item = state.pantry.find((i) => i.id === id);
    if (!item) return;
    showModal("A date to keep in mind", `<h2>${escape(item.name)}</h2><p class="muted">Use a date from the packaging, or leave it blank.</p><form id="date-form"><label class="form-label">Best before<input name="date" type="date" value="${escape(item.expires_on || "")}"></label><div class="chip-row">${[[3, "In 3 days"], [7, "In 1 week"], [14, "In 2 weeks"]].map(([d, t]) => `<button type="button" class="chip" data-days="${d}">${t}</button>`).join("")}</div><button class="button primary full" id="date-save">Save date</button></form>`);
    document.querySelectorAll("[data-days]").forEach((b) => b.onclick = () => {
      $('[name="date"]').value = localDate(Number(b.dataset.days));
    });
    $("#date-form").onsubmit = async (e) => {
      e.preventDefault();
      if (!ensureIdentity()) return;
      if (state.busy) return;
      state.busy = true;
      $("#date-save").disabled = true;
      try {
        state.pantry = await kitchen.setDate(state.pantry, id, new FormData(e.target).get("date") || null);
        state.busy = false;
        closeModal();
        render();
      } catch (error) {
        state.busy = false;
        $("#date-save").disabled = false;
        modalError(error.message);
      }
    };
  }
  function removeItem(id) {
    const item = state.pantry.find((i) => i.id === id);
    if (!item) return;
    showModal("Remove ingredient?", `<p>Remove ${escape(item.name)} from your fridge?</p><div class="modal-footer"><button class="button outline" id="keep-item">Keep it</button><button class="button primary" id="remove-item">Remove</button></div>`);
    $("#keep-item").onclick = closeModal;
    $("#remove-item").onclick = async () => {
      if (!ensureIdentity()) return;
      if (state.busy) return;
      state.busy = true;
      $("#remove-item").disabled = true;
      try {
        state.pantry = await kitchen.remove(state.pantry, id);
        state.busy = false;
        closeModal();
        render();
        toast("Ingredient removed.");
      } catch (error) {
        state.busy = false;
        $("#remove-item").disabled = false;
        modalError(error.message);
      }
    };
  }
  return { openScan, startSample, openReview, openAuth, openManual, editDate, removeItem };
}
export {
  createKitchenFlows
};
