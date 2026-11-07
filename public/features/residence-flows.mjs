import { config } from '../config.js';
import { activeResidence, setupComplete, needsStudentCheck, createResidenceLookup } from '../lib/residence.mjs';
import { currentPosition } from '../lib/nearby-map.mjs';
import { escape, icon } from '../lib/ui.mjs';

export function createResidenceFlows({ state, render, showModal, closeModal, modalError, toast, onResidenceChanged, onSkip }) {
  const $ = selector => document.querySelector(selector);
  const lookup = createResidenceLookup({ baseUrl: config.geocoderUrl });
  let session = 0, request = 0, controller, cancel;
  function invalidate() {
    session++; request++; controller?.abort(); controller = null;
    const notify = cancel; cancel = null; notify?.(false);
  }
  function resetIdentity() { invalidate(); lookup.clear(); }
  function start(onDone) {
    invalidate();
    const generation = session, repo = state.repo;
    cancel = onDone;
    const alive = () => session === generation && repo === state.repo;
    const finish = () => {
      if (!alive()) return;
      cancel = null;
      closeModal();
      onDone?.(true);
    };
    return { repo, alive, finish };
  }
  const attribution = '<p class="fine-print">Address lookup by Photon · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>. Searches and location lookups are sent to this service. Only your confirmed building is saved on this device.</p>';

  function openSetup({ onDone, required = false, updateCurrent = false } = {}) {
    if (!state.repo?.data || state.storageError) { toast('Community storage is still opening or unavailable. Retry it in Settings.'); onDone?.(false); return; }
    const flow = start(onDone);
    const current = updateCurrent ? activeResidence(flow.repo.data) : null;
    let student = { ...flow.repo.data.student }, candidate = null, query = '', results = [];
    const skip = () => {
      const button = $('#residence-skip');
      if (button) button.onclick = async () => {
        try {
          await flow.repo.run('skipSetup');
          if (!flow.alive()) return;
          closeModal(); if (required) onSkip?.(); render();
        } catch (error) { if (flow.alive()) modalError(error.message); }
      };
    };
    const footer = () => `<p class="fine-print">Residence membership is self-confirmed. Neighbors and exchanges are simulated.</p><button class="text-button centered" id="residence-skip">${required ? 'Back to my kitchen' : 'Set up later'}</button>`;
    function studentStep() {
      showModal('Find your people', `<p class="eyebrow">YOUR COMMUNITY · 1 OF 2</p><h2>Are you a student?</h2><p class="muted">A few details help you find the right community.</p><form id="student-form"><fieldset><legend class="sr-only">Student status</legend><div class="residence-choices"><label><input type="radio" name="student" value="yes" ${student.isStudent === true ? 'checked' : ''} required> Yes, I’m a student</label><label><input type="radio" name="student" value="no" ${student.isStudent === false ? 'checked' : ''} required> No, I’m not a student</label></div></fieldset><label class="form-label" id="school-label" ${student.isStudent === true ? '' : 'hidden'}>School or university<input name="school" maxlength="120" value="${escape(student.school || '')}" ${student.isStudent === true ? 'required' : ''} autocomplete="organization" placeholder="Your school’s name"></label><p class="sample-note">Students can browse first. Before exchanging, you’ll try a sample student ID check using a fake card.</p><button class="button primary full">Continue ${icon('arrow')}</button></form>${footer()}`);
      $('#student-form').onchange = event => {
        if (event.target.name !== 'student') return;
        const yes = event.target.value === 'yes';
        $('#school-label').hidden = !yes; $('#student-form').elements.school.required = yes;
      };
      $('#student-form').onsubmit = async event => {
        event.preventDefault();
        const form = new FormData(event.target);
        student = { isStudent: form.get('student') === 'yes', school: form.get('school') || '' };
        try {
          await flow.repo.run('student', student);
          if (flow.alive()) { render(); searchStep(); }
        } catch (error) { if (flow.alive()) modalError(error.message); }
      };
      skip();
    }
    function searchStep(message = '', busy = false) {
      const residences = current ? [] : flow.repo.data.residences || [];
      showModal('Where do you live?', `<p class="eyebrow">YOUR COMMUNITY · 2 OF 2</p><h2>A little closer to home.</h2><p class="muted">Find your apartment building or dorm. You’ll confirm it before joining.</p><button id="residence-locate" class="button outline full" ${busy ? 'disabled' : ''}>${icon('pin')} ${busy ? 'Finding buildings…' : 'Use my current location'}</button><span class="residence-or">or enter an address or building name</span><form id="residence-search-form"><label class="form-label">Address or building<input name="query" value="${escape(query)}" minlength="3" maxlength="240" required placeholder="Building name, street, city" autocomplete="street-address"></label><button class="button primary full" ${busy ? 'disabled' : ''}>${icon('search')} Search buildings</button></form>${message ? `<p class="residence-notice" role="status">${escape(message)}</p>` : ''}<div class="residence-results">${results.map((r, i) => `<button class="residence-result" data-residence-result="${i}"><span>${icon('pin')}</span><span><strong>${escape(r.name)}</strong><small>${escape(r.address)}</small><small>${r.building ? 'Suggested building · confirm your residence' : 'Area only · add your building details'}</small></span>${icon('arrow')}</button>`).join('')}</div><button id="residence-manual" class="text-button">Can’t find it? Enter building manually</button>${residences.length ? `<h3 class="block-title">Your saved residences</h3><div class="residence-results">${residences.map((r, i) => `<button class="residence-result" data-saved-residence="${i}">${icon('pin')}<span><strong>${escape(r.name)}</strong><small>${escape(r.address)}</small></span>${icon('arrow')}</button>`).join('')}</div>` : ''}<button class="text-button" id="residence-back-student">Back to student status</button>${attribution}${footer()}`);
      $('#residence-search-form').onsubmit = event => { event.preventDefault(); query = new FormData(event.target).get('query'); performLookup(false); };
      $('#residence-locate').onclick = () => { query = $('#residence-search-form').elements.query.value; performLookup(true); };
      $('#residence-manual').onclick = () => { controller?.abort(); request++; candidate = null; confirmStep(); };
      $('#residence-back-student').onclick = () => { controller?.abort(); request++; studentStep(); };
      document.querySelectorAll('[data-residence-result]').forEach(button => button.onclick = () => {
        controller?.abort(); request++;
        candidate = results[Number(button.dataset.residenceResult)];
        if (!candidate.building) candidate = { ...candidate, id: null, name: current?.name || '', address: current?.address || candidate.address, kind: current?.kind || candidate.kind, approximate: true };
        confirmStep();
      });
      document.querySelectorAll('[data-saved-residence]').forEach(button => button.onclick = () => { controller?.abort(); request++; candidate = residences[Number(button.dataset.savedResidence)]; confirmStep(); });
      skip();
    }
    async function performLookup(useLocation) {
      controller?.abort(); controller = new AbortController();
      const signal = controller.signal, ticket = ++request;
      searchStep('', true);
      try {
        const matches = useLocation ? await lookup.reverse(await currentPosition(), signal) : await lookup.search(query, signal);
        if (!flow.alive() || ticket !== request) return;
        results = matches;
        searchStep(results.length ? 'Choose a suggestion, then confirm your building.' : 'No buildings found. Try adding the city or enter your building manually.');
      } catch (error) {
        if (!flow.alive() || ticket !== request) return;
        const message = error.name === 'TimeoutError' ? 'Address search timed out. Try again or enter your building manually.' : useLocation && (error.code === 1 || /denied|location|position/i.test(error.message)) ? 'Location is unavailable or permission was denied. Search your address or enter your building manually.' : error.message;
        searchStep(message || 'Address search is unavailable. Try again or enter your building manually.');
      }
    }
    function confirmStep() {
      const chosen = candidate || {};
      showModal('Confirm your building', `<p class="eyebrow">YOUR HOME COMMUNITY</p><h2>Is this your residence?</h2><form id="residence-confirm-form"><label class="form-label">Building name<input name="name" maxlength="120" value="${escape(chosen.name || '')}" placeholder="Your apartment building or dorm" required></label><label class="form-label">Building address<input name="address" maxlength="240" value="${escape(chosen.address || '')}" placeholder="Street address, city, region" required></label><label class="form-label">Residence type<select name="kind">${[['apartment', 'Apartment building'], ['dorm', 'College dorm'], ['other', 'Other residence']].map(([value, label]) => `<option value="${value}" ${chosen.kind === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><p class="sample-note">${chosen.center ? chosen.approximate ? 'Approximate map location · your building details are self-declared.' : 'The map will center on this building, even when you’re away.' : 'No map location yet. Your building’s list works now; add a map location later for maps and Neighborhood.'}</p>${chosen.center ? '<label class="check-row"><input type="checkbox" name="keepCenter" checked> Keep this map location</label>' : ''}<label class="check-row"><input name="confirmed" type="checkbox" required> I live in this building. I haven’t entered a room or unit number.</label><button class="button primary full" id="residence-confirm-submit">Join my building ${icon('arrow')}</button></form><button class="text-button" id="residence-back-search">Back to search</button>${footer()}`);
      $('#residence-back-search').onclick = () => searchStep();
      $('#residence-confirm-form').onsubmit = async event => {
        event.preventDefault();
        const form = new FormData(event.target), button = $('#residence-confirm-submit'); button.disabled = true;
        try {
          const edited = chosen.name !== form.get('name') || chosen.address !== form.get('address');
          await flow.repo.run('residence', { ...chosen, id: edited ? null : chosen.id, updateResidenceId: current?.id, name: form.get('name'), address: form.get('address'), kind: form.get('kind'), center: form.get('keepCenter') ? chosen.center : null, approximate: Boolean(chosen.approximate || edited) });
          if (!flow.alive()) return;
          onResidenceChanged(); render(); flow.finish(); toast('Your building community is ready. Neighbors are simulated.');
        } catch (error) { if (flow.alive()) { button.disabled = false; modalError(error.message); } }
      };
      skip();
    }
    studentStep();
  }

  function openCheck(onDone) {
    const flow = start(onDone);
    const school = flow.repo.data.student.school;
    showModal('Sample student ID check', `<p class="eyebrow">DEMO ONLY</p><h2>Try the student ID step.</h2><p class="muted">Use this fake sample card. No real student documents or ID numbers are collected.</p><div class="sample-student-id"><span class="mode-badge">FAKE SAMPLE · NOT VALID</span><strong>Sample University</strong><div class="sample-id-person">${icon('user')}<span>Alex Sample<small>Demo student</small></span></div><span>Sample card for the demo only</span></div><p class="fine-print">Your selected school: ${escape(school)}. This demo does not contact the school or verify identity or residence.</p><button id="submit-sample-id" class="button primary full">Use sample ID & submit</button>`);
    $('#submit-sample-id').onclick = () => {
      showModal('Sample review pending', `<div class="verification-result">${icon('receipt')}<h2>Sample ID submitted.</h2><p>This is a simulated review. Real student verification would need a trusted review process.</p><button id="simulate-id-review" class="button primary full">Simulate successful review</button></div>`);
      $('#simulate-id-review').onclick = async () => {
        const button = $('#simulate-id-review'); button.disabled = true;
        try {
          await flow.repo.run('checkStudent');
          if (!flow.alive()) return;
          render();
          showModal('Demo check completed', `<div class="verification-result">${icon('check')}<h2>Demo check completed</h2><p>You can try posting, requesting, messaging, and meal swaps.</p><p class="sample-note">This is a simulated result, not verification of student status, identity, or residence.</p><button id="finish-id-check" class="button primary full">Continue</button></div>`);
          $('#finish-id-check').onclick = flow.finish;
        } catch (error) { if (flow.alive()) { button.disabled = false; modalError(error.message); } }
      };
    };
  }
  async function ensureReady(exchange = false) {
    const repo = state.repo;
    if (!setupComplete(repo?.data)) {
      const completed = await new Promise(resolve => openSetup({ onDone: resolve, required: true }));
      if (!completed || state.repo !== repo) return false;
    }
    if (exchange && needsStudentCheck(repo.data)) return new Promise(resolve => openCheck(resolve));
    return true;
  }
  return { openSetup, openCheck, ensureReady, onClose: invalidate, resetIdentity };
}
