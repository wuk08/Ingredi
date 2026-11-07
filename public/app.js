import { getSession, api, signIn, signUp, signOut, loadKitchen, scanReceipt } from './lib/api.mjs';
import { SAMPLE_SCAN, DEMO_RECIPES, validateItems, validateImage, MAX_IMAGE_BYTES, matchRecipes, daysUntil, localDate } from './lib/domain.mjs';
import { isNativeApp, captureNativeReceipt } from './lib/capture.mjs';

document.documentElement.classList.toggle('native-app',isNativeApp());

const $ = (selector,root=document) => root.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
 leaf:'<path d="M12 21v-9M12 16C4 17 3 10 4 6c8-1 11 4 8 10ZM12 12c0-7 5-9 10-8 0 6-3 10-10 8Z"/>',
 fridge:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M5 10h14M9 6v1M9 14v3"/>',
 chef:'<path d="M6 14a5 5 0 0 1-2-9 5 5 0 0 1 8-2 5 5 0 0 1 8 2 5 5 0 0 1-2 9v7H6v-7ZM6 17h12"/>',
 scan:'<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10"/><path d="M8 7h8v10H8z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', arrow:'<path d="m9 5 7 7-7 7"/>', back:'<path d="m15 5-7 7 7 7"/>',
 check:'<path d="m5 12 4 4L19 6"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>', camera:'<path d="M8 5 6 8H3v13h18V8h-3l-2-3Z"/><circle cx="12" cy="14" r="4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', receipt:'<path d="m5 3 2 1 2-1 3 1 3-1 2 1 2-1v19l-3-2-4 2-4-2-3 2V3ZM9 8h6M9 12h6M9 16h3"/>',
 refresh:'<path d="M20 8a9 9 0 1 0 1 8M20 3v6h-6"/>', spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>', trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
};
const icon = (name,cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.leaf}</svg>`;
let localPantry;
try { localPantry = JSON.parse(localStorage.getItem('ingredi.local-pantry') || '[]'); } catch { localPantry=[]; }
if (!Array.isArray(localPantry)) localPantry=[];
const state = { pantry:getSession()?[]:localPantry, recipes:DEMO_RECIPES, scans:[], page:'fridge', filter:'all', search:'', loading:false, error:'', modal:null, scan:null, review:[], result:null, busy:false, file:null, preview:null, live:null, authMode:'signin' };
function persistLocal() { localStorage.setItem('ingredi.local-pantry',JSON.stringify(state.pantry)); }
let toastTimer;
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500); }
function foodIcon(name) {
  const n=name.toLowerCase();
  if (/egg/.test(n)) return '🥚'; if (/milk/.test(n)) return '🥛'; if (/chicken/.test(n)) return '🍗'; if (/spinach|onion|lettuce|green/.test(n)) return '🥬'; if (/tomato/.test(n)) return '🍅'; if (/cheese/.test(n)) return '🧀'; if (/rice/.test(n)) return '🍚'; if (/carrot/.test(n)) return '🥕'; if (/bread/.test(n)) return '🍞'; return '🧺';
}
function expiryLabel(item) {
  const days=daysUntil(item.expires_on);
  return days===null?'No date set':days<0?`${Math.abs(days)}d past date`:days===0?'Today':`${days} days left`;
}
function greeting() { const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; }
function render() {
  const signed=Boolean(getSession());
  const soon=state.pantry.filter(i=>daysUntil(i.expires_on)!==null && daysUntil(i.expires_on)<=3);
  $('#app').innerHTML=`
  <aside class="sidebar">
    <a href="#" class="brand" aria-label="Ingredi home">${icon('leaf')}<span>ingredi<span class="brand-dot">.</span></span></a>
    <p class="brand-note">Good food. More possibility.</p>
    <div class="nav-label">YOUR KITCHEN</div>
    <nav aria-label="Main navigation">
      <button data-page="fridge" class="nav-item ${state.page==='fridge'?'active':''}">${icon('fridge')}<span>My fridge</span><span class="nav-count">${state.pantry.length}</span></button>
      <button data-page="recipes" class="nav-item ${state.page==='recipes'?'active':''}">${icon('chef')}<span>Let’s cook</span></button>
    </nav>
    <div class="sidebar-bottom"><div class="little-leaf">${icon('leaf')}</div><strong>Small kitchen.<br>Big difference.</strong><p>Every ingredient used<br>is a little less wasted.</p><div class="sidebar-line"></div><span>Cook what you have.<br>Share what you don’t need.</span></div>
  </aside>
  <div class="workspace">
    <header class="topbar"><div class="breadcrumb">Your kitchen <span>/</span> <strong>${state.page==='fridge'?'My fridge':'Let’s cook'}</strong></div><div class="topbar-right"><span class="connection ${signed?'online':''}"><i></i>${signed?'Supabase connected':'Local sample mode'}</span><button class="account-button" aria-label="${signed?'My account':'Sign in'}" data-action="${signed?'account':'auth'}">${icon('user')}<span>${signed?'My account':'Sign in'}</span></button></div></header>
    <main>
      <div class="page-heading"><div><p class="eyebrow">A LITTLE LESS WASTE, EVERY DAY</p><h1>${state.page==='fridge'?'Your fridge, full of possibility.':'Something good is already here.'}</h1><p class="heading-note">${state.page==='fridge'?`${greeting()}. Let’s make the most of what you have.`:'A few ideas, inspired by the ingredients in your fridge.'}</p></div><span class="heading-mark">${icon(state.page==='fridge'?'fridge':'chef')}</span></div>
      ${state.error?`<div class="error-banner" role="alert">${icon('info')}<span>${escape(state.error)}</span><button data-action="refresh">Retry</button></div>`:''}
      ${!signed?`<div class="sample-banner">${icon('info')}<span><strong>Try it with a sample receipt.</strong> This local preview saves on this device. Sign in to store your fridge in Supabase.</span><button data-action="auth">Connect my kitchen ${icon('arrow')}</button></div>`:''}
      ${state.page==='fridge'?fridgePage(soon):recipesPage()}
      <footer class="page-footer">${icon('leaf')} A little care for your food goes a long way.<span>INGREDI · HACKATHON MVP</span></footer>
    </main>
  </div>
  <nav class="mobile-nav" aria-label="Mobile navigation"><button data-page="fridge" class="${state.page==='fridge'?'active':''}">${icon('fridge')}My fridge</button><button data-action="scan" class="mobile-scan">${icon('scan')}Scan receipt</button><button data-page="recipes" class="${state.page==='recipes'?'active':''}">${icon('chef')}Let’s cook</button></nav>`;
  bindMain();
}
function fridgePage(soon) {
  const filtered=state.pantry.filter(i=>(state.filter!=='soon'||(daysUntil(i.expires_on)!==null&&daysUntil(i.expires_on)<=3))&&i.name.toLowerCase().includes(state.search.toLowerCase()));
  return `<section class="hero"><div class="hero-copy"><span class="hero-tag">${icon('spark')} FROM RECEIPT TO READY-TO-COOK</span><h2>A fresh start for<br>your groceries.</h2><p>One quick scan. All your ingredients.<br>A fridge that helps you waste less.</p><button class="button primary" data-action="scan">${icon('scan')} Scan a receipt ${icon('arrow')}</button><span class="hero-footnote">Review every item before it goes in.</span></div><div class="hero-art" aria-hidden="true"><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="receipt-paper"><span class="receipt-sprout">${icon('leaf')}</span><strong>THE GOOD STUFF</strong><small>fresh finds for your fridge</small><div class="receipt-dash"></div><span>Milk <b>1 gal</b></span><span>Eggs <b>12 ct</b></span><span>Baby spinach <b>5 oz</b></span><div class="receipt-dash"></div><span class="receipt-total">Possibilities <b>plenty.</b></span><div class="barcode"></div></div><div class="art-sticker sticker-green">${icon('check')} A little less waste</div><div class="art-sticker sticker-white">🥬&nbsp; Fresh ideas inside</div><span class="art-spark spark-one">✧</span><span class="art-spark spark-two">✳</span></div></section>
  <div class="kitchen-layout"><section class="pantry-section" aria-label="Fridge ingredients"><div class="section-heading"><div><h2>Inside your fridge <span class="count-pill">${state.pantry.length}</span></h2><p>${state.pantry.length?'Good things, waiting to become something delicious.':'Your next good meal starts here.'}</p></div><button class="button outline small" data-action="manual">${icon('plus')} Add item</button></div>
    <div class="fridge-tools"><div class="tabs" role="group" aria-label="Fridge filter"><button data-filter="all" class="${state.filter==='all'?'selected':''}">All ingredients</button><button data-filter="soon" class="${state.filter==='soon'?'selected':''}">Use soon <span>${soon.length}</span></button></div><label class="search-box">${icon('search')}<input id="pantry-search" type="search" placeholder="Find an ingredient" aria-label="Find an ingredient" value="${escape(state.search)}"></label></div>
    <div id="pantry-grid" class="pantry-grid">${state.loading?'<div class="empty-state"><span class="spinner"></span><h3>Opening your fridge…</h3></div>':filtered.length?filtered.map(foodCard).join(''):`<div class="empty-state"><div class="empty-icon">${icon('fridge')}</div><h3>${state.pantry.length?'No ingredients here just yet.':'A little empty. A lot of potential.'}</h3><p>${state.pantry.length?'Try a different search or filter.':'Scan a receipt or add your first ingredient.<br>We’ll keep the good stuff in view.'}</p>${state.pantry.length?'':`<button class="text-button" data-action="sample">Try the sample receipt ${icon('arrow')}</button>`}</div>`}</div>
    ${getSession()&&state.scans.some(s=>s.status==='processed')?`<div class="recent-scans"><h3>Ready to review</h3>${state.scans.filter(s=>s.status==='processed').map(s=>`<button data-resume="${s.id}">${icon('receipt')}<span>${s.metadata?.mode==='sample'?'Sample receipt':'Receipt'} · ${s.extracted_items.length} items</span>Review ${icon('arrow')}</button>`).join('')}</div>`:''}
  </section><aside class="kitchen-aside"><div class="tip-card"><span class="eyebrow">A GENTLE NUDGE</span><div class="tip-illustration">${icon('leaf')}</div><h3>${soon.length?'A little love, a little sooner.':'Fresh today.<br>Remembered tomorrow.'}</h3><p>${soon.length?`${soon.length} ingredient${soon.length===1?' is':'s are'} near or past your chosen date. Take a look and plan a meal.`:'Add a best-before date to keep the ingredients you want to use first in view.'}</p><div class="tip-divider"></div><span>${icon('info')} Dates are chosen by you, not guessed from a receipt.</span></div>
  <div class="recipe-teaser"><span class="eyebrow">WHAT’S FOR DINNER?</span><h3>Let your fridge<br>pick the menu.</h3><p>Simple recipes, matched to what you already have.</p><button class="text-button" data-page="recipes">Find something to cook ${icon('arrow')}</button></div></aside></div>`;
}
function foodCard(item) { const days=daysUntil(item.expires_on); return `<article class="food-card"><div class="food-card-top"><span class="food-emoji" aria-hidden="true">${foodIcon(item.name)}</span><button class="icon-button delete-item" data-delete="${item.id}" aria-label="Remove ${escape(item.name)}">${icon('trash')}</button></div><h3>${escape(item.name)}</h3><p>${escape(item.quantity)} ${escape(item.unit)}</p><div class="food-card-bottom"><button data-date="${item.id}" class="expiry ${days!==null&&days<=3?'soon':''}" title="Edit best-before date">${icon('clock')}${expiryLabel(item)}</button><span class="source-tag" title="${item.source==='receipt'?'From a receipt':'Added manually'}">${icon(item.source==='receipt'?'receipt':'plus')}</span></div></article>`; }
function recipesPage() { const recipes=matchRecipes(state.recipes,state.pantry); return `<div class="recipes-intro">${icon('chef')}<span>Matched to your fridge · ${state.pantry.length} ingredients</span><span>Demo recipe collection</span></div><div class="recipe-grid">${recipes.map((recipe,i)=>`<article class="recipe-card"><div class="recipe-art recipe-art-${i%3}"><span>${i%3===0?'🍳':i%3===1?'🥘':'🍚'}</span><span class="recipe-time">${icon('clock')}${recipe.cook_minutes} min</span></div><div class="recipe-content"><span class="match-label">${recipe.missing.length?`${recipe.have} of ${recipe.total} ingredients`:'Everything’s in your fridge'}</span><h2>${escape(recipe.name)}</h2><p>${escape(recipe.description?.replace('Demo recipe · ',''))}</p><div class="ingredient-tags">${recipe.ingredients.map(item=>`<span class="${recipe.missing.includes(typeof item==='string'?item:item.name)?'missing':'have'}">${escape(typeof item==='string'?item:item.name)}</span>`).join('')}</div><button class="button outline" data-recipe="${recipe.id}">Let’s make it ${icon('arrow')}</button></div></article>`).join('')}</div><p class="recipe-note">Ingredient matches compare names. Check quantities and freshness before cooking. Seasoning and cooking oil are assumed pantry basics.</p>`; }
function bindMain() {
  document.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>{state.page=button.dataset.page;render();window.scrollTo(0,0);});
  document.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>act(button.dataset.action));
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{state.filter=button.dataset.filter;render();});
  $('#pantry-search')?.addEventListener('input',e=>{const pos=e.target.selectionStart;state.search=e.target.value;render();$('#pantry-search').focus();try{$('#pantry-search').setSelectionRange(pos,pos);}catch{}});
  document.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>removeItem(button.dataset.delete));
  document.querySelectorAll('[data-date]').forEach(button=>button.onclick=()=>editDate(button.dataset.date));
  document.querySelectorAll('[data-resume]').forEach(button=>button.onclick=()=>openReview(state.scans.find(s=>s.id===button.dataset.resume)));
  document.querySelectorAll('[data-recipe]').forEach(button=>button.onclick=()=>openRecipe(button.dataset.recipe));
}
async function refresh() {
  if (!getSession()) {state.pantry=localPantry;render();return;}
  state.loading=true;state.error='';render();
  try { Object.assign(state,await loadKitchen()); }
  catch(error) { state.error=getSession()?error.message:'Your session expired. Sign in again to open your kitchen.'; }
  finally { state.loading=false;render(); }
}
function act(action) {
  if(action==='scan'){openScan();} if(action==='sample'){startSample();} if(action==='auth'){state.authMode='signin';openAuth();} if(action==='manual'){openManual();} if(action==='refresh'){refresh();}
  if(action==='account'){showModal('Your kitchen',`<div class="account-info">${icon('user')}<h3>Signed in to Supabase</h3><p>${escape(getSession().user.email)}</p><p>Your fridge is private to your account.</p></div><button id="signout" class="button outline full">Sign out</button>`);$('#signout').onclick=async()=>{await signOut().catch(()=>{});state.pantry=localPantry;state.recipes=DEMO_RECIPES;state.scans=[];closeModal();render();};}
}
let modalReturnFocus;
function showModal(title,content,wide=false) {
  if(!state.modal) modalReturnFocus=document.activeElement;
  state.modal=true;
  $('#overlay-root').innerHTML=`<div class="modal-backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><header class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-button" id="close-modal" aria-label="Close">${icon('close')}</button></header><div class="modal-body">${content}</div></section></div>`;
  document.body.classList.add('modal-open');
  $('#app').inert=true;
  $('#close-modal').onclick=()=>{if(state.busy)return;closeModal();};
  $('.modal').focus();
}
function closeModal() { if(state.busy)return;$('#overlay-root').innerHTML='';document.body.classList.remove('modal-open');$('#app').inert=false;state.modal=null;if(state.preview)URL.revokeObjectURL(state.preview);state.preview=null;state.file=null;modalReturnFocus?.focus(); }
document.addEventListener('keydown',e=>{if(!state.modal)return;if(e.key==='Escape'){closeModal();return;}if(e.key==='Tab'){const items=[...$('.modal').querySelectorAll('button,input,select,a,[tabindex="0"]')].filter(i=>!i.disabled&&i.offsetParent!==null);const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.modal'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
function modalError(message) { let el=$('#modal-error');if(!el){el=document.createElement('div');el.id='modal-error';el.className='form-error';el.setAttribute('role','alert');$('.modal-body').prepend(el);}el.textContent=message;el.scrollIntoView({block:'nearest'}); }
function openScan() {
  state.file=null;
  state.live=null;
  showModal('Fill up your fridge',`<div class="flow-steps"><span class="current">1 Upload</span><i></i><span>2 Review</span><i></i><span>3 In your fridge</span></div><p class="modal-lead">Your groceries, all in one place.</p><p class="muted">Upload a clear photo of the whole receipt. We’ll find the food items for you to check.</p><label class="upload-zone" id="drop-zone"><input type="file" id="receipt-file" accept="image/jpeg,image/png,image/webp"><span class="upload-icon">${icon('scan')}</span><strong>Choose a receipt photo</strong><span>or drop it here</span><small>JPEG, PNG or WebP · up to 6 MB</small></label><div id="file-preview"></div><label class="consent"><input type="checkbox" id="ai-consent"><span>I agree to send this receipt image to OpenAI for ingredient extraction. Receipts may include personal details; crop those out first.</span></label><button id="scan-live" class="button primary full" disabled>${icon('spark')} Read my receipt</button><div class="or-divider"><span>OR TRY IT OUT</span></div><button id="scan-sample" class="button outline full">${icon('receipt')} Use the sample receipt</button><p class="sample-note">Preset food items, clearly labeled. ${getSession()?'Saved to your Supabase fridge.':'No account needed; saved on this device.'}</p>${!getSession()?'<button id="scan-signin" class="text-button centered">Sign in to scan your own receipt →</button>':''}`);
  const status=document.createElement('p');status.id='live-scan-status';status.className='sample-note';
  status.textContent=getSession()?'Checking live scanning…':'Sign in to scan your own receipt.';
  $('#scan-live').after(status);
  const fixture=document.createElement('a');fixture.href='/sample-receipt.png';fixture.download='ingredi-sample-receipt.png';fixture.className='sample-download';fixture.textContent='Download a synthetic receipt for testing';
  $('#scan-sample').after(fixture);
  if(getSession())api('/functions/v1/scan-receipt').then(result=>{
    if($('#live-scan-status')!==status)return;
    state.live=result.live_ai_configured;
    status.textContent=state.live?'Live scanner is configured.':'Live scanning is not configured yet. You can use the sample receipt.';
    updateScanReady();
  }).catch(()=>{if($('#live-scan-status')===status){state.live=false;status.textContent='Live scanning is unavailable. Reopen this screen to retry, or use the sample.';updateScanReady();}});
  $('#scan-sample').onclick=startSample;
  if(isNativeApp()) {
    $('#drop-zone').hidden=true;
    const controls=document.createElement('div');controls.className='native-picker-actions';
    controls.innerHTML=`<button type="button" class="button outline" data-capture="camera">${icon('camera')} Take photo</button><button type="button" class="button outline" data-capture="photos">${icon('upload')} Choose Photos</button>`;
    $('#drop-zone').before(controls);
    controls.querySelectorAll('[data-capture]').forEach(button=>button.onclick=async()=>{
      if(state.busy)return;state.busy=true;controls.querySelectorAll('button').forEach(b=>b.disabled=true);
      try{const file=await captureNativeReceipt(button.dataset.capture);if(file)await chooseFile(file);}
      catch(error){modalError(error.message);}
      finally{state.busy=false;controls.querySelectorAll('button').forEach(b=>b.disabled=false);updateScanReady();}
    });
    fixture.replaceWith(Object.assign(document.createElement('button'),{type:'button',className:'text-button centered',textContent:'Load demo photo for live AI',onclick:async()=>{
      try{const response=await fetch('/sample-receipt.png');if(!response.ok)throw new Error();await chooseFile(new File([await response.blob()],'demo-receipt.png',{type:'image/png'}));}
      catch{modalError('The demo photo could not be loaded. Try the sample receipt instead.');}
    }}));
  }
  $('#scan-signin')?.addEventListener('click',()=>{state.authMode='signin';openAuth();});
  $('#receipt-file').onchange=e=>chooseFile(e.target.files[0]);
  $('#ai-consent').onchange=updateScanReady;
  const zone=$('#drop-zone');zone.ondragover=e=>{e.preventDefault();zone.classList.add('dragover');};zone.ondragleave=()=>zone.classList.remove('dragover');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('dragover');chooseFile(e.dataTransfer.files[0]);};
  $('#scan-live').onclick=()=>startScan('live');
}
function updateScanReady(){const button=$('#scan-live');if(button)button.disabled=!state.file||!$('#ai-consent')?.checked||!getSession()||state.live!==true;}
async function chooseFile(file) {
  if(!file)return;
  const target=$('#file-preview');
  try {
    if(file.size>MAX_IMAGE_BYTES)throw new Error('Choose a receipt photo under 6 MB.');
    validateImage(new Uint8Array(await file.arrayBuffer()),file.type);
    const bitmap=await createImageBitmap(file);bitmap.close();
    if($('#file-preview')!==target)return;
    state.file=file;if(state.preview)URL.revokeObjectURL(state.preview);state.preview=URL.createObjectURL(file);
    $('#file-preview').innerHTML=`<div class="file-preview"><img src="${state.preview}" alt="Your receipt preview"><div><strong>${escape(file.name)}</strong><span>${(file.size/1024).toFixed(0)} KB · ready to scan</span></div>${icon('check')}</div>`;
    updateScanReady();$('#modal-error')?.remove();
  }catch(error){state.file=null;$('#scan-live').disabled=true;$('#file-preview').innerHTML='';modalError(error.message);}
}
async function startSample() {
  if(getSession()){await startScan('sample');return;}
  const scan={id:crypto.randomUUID(),status:'processed',extracted_items:structuredClone(SAMPLE_SCAN.items),metadata:{mode:'sample',merchant:SAMPLE_SCAN.merchant,skipped_non_food:SAMPLE_SCAN.skipped_non_food,warnings:SAMPLE_SCAN.warnings},local:true};
  openReview(scan);
}
async function startScan(mode) {
  if(state.busy)return;
  const file=state.file;
  if(mode==='live'&&(!file||!$('#ai-consent')?.checked))return;
  state.busy=true;
  showModal('Reading your receipt',`<div class="processing"><div class="scan-animation">${icon('receipt')}</div><h3>${mode==='sample'?'Opening the sample receipt…':'Finding the good stuff…'}</h3><p>${mode==='sample'?'Preset food items · saved through your real backend.':'Your image is being read by OpenAI. This can take up to a minute.'}</p><span class="spinner"></span></div>`);
  $('#close-modal').disabled=true;
  try { const scan=await scanReceipt({id:crypto.randomUUID(),file,mode});state.busy=false;openReview(scan); }
  catch(error){state.busy=false;openScan();modalError(error.name==='TimeoutError'?'This is taking longer than expected. Refresh your fridge to check for a finished scan before retrying.':error.message);}
}
function openReview(scan) {
  state.scan=scan;
  state.review=scan.extracted_items.map(item=>({...item,selected:item.confidence!=='low',expires_on:null}));
  renderReview();
}
function renderReview() {
  const scan=state.scan; const selected=state.review.filter(i=>i.selected).length;
  showModal('Review your ingredients',`<div class="flow-steps"><span>1 Upload</span><i></i><span class="current">2 Review</span><i></i><span>3 In your fridge</span></div><div class="scan-summary">${icon('receipt')}<div><strong>We found ${state.review.length} food items</strong><p>${escape(scan.metadata?.merchant || 'Your receipt')} · ${scan.metadata?.skipped_non_food || 0} non-food items skipped</p></div></div><div class="mode-badge ${scan.metadata?.mode==='sample'?'sample':''}">${icon(scan.metadata?.mode==='sample'?'info':'spark')}${scan.metadata?.mode==='sample'?'Sample receipt · preset extraction':'Live AI extraction · check every item'}${scan.local?' · saved on this device':''}</div>${scan.metadata?.warnings?.length?`<div class="review-warning">${icon('info')}<div>${scan.metadata.warnings.map(w=>`<p>${escape(w)}</p>`).join('')}</div></div>`:''}<p class="review-note">Edit names and amounts, skip anything you don’t need, and set dates if you know them. Dates are optional.</p><div class="review-heading"><strong>Ingredients <span id="selected-count">${selected} selected</span></strong><button class="text-button" id="toggle-all">${selected===state.review.length?'Deselect all':'Select all'}</button></div><form id="review-form"><div class="review-items">${state.review.map((item,i)=>`<div class="review-item ${item.confidence==='low'?'uncertain':''}"><div class="review-item-main"><label class="item-checkbox"><input type="checkbox" data-select="${i}" ${item.selected?'checked':''} aria-label="Include ${escape(item.name)}"></label><div class="review-fields"><label class="sr-only" for="name-${i}">Ingredient name ${i+1}</label><input id="name-${i}" data-field="name" data-index="${i}" class="name-input" value="${escape(item.name)}" maxlength="100" required><span class="raw-line">${item.confidence!=='high'?'<b>Check this item</b> · ':''}${escape(item.raw_line || '')}</span></div><span class="review-emoji" aria-hidden="true">${foodIcon(item.name)}</span></div><div class="item-detail-fields"><label>Amount<input data-field="quantity" data-index="${i}" type="number" min="0.01" max="10000" step="0.01" value="${item.quantity}" required></label><label>Unit<input data-field="unit" data-index="${i}" value="${escape(item.unit)}" maxlength="30" required></label><label class="date-field">Best before<input data-field="expires_on" data-index="${i}" type="date" value="${item.expires_on || ''}"></label></div></div>`).join('')}</div><div class="modal-footer"><button type="button" id="rescan" class="text-button">${icon('back')} Start over</button><button type="submit" id="confirm-items" class="button primary" ${!selected?'disabled':''}>Add ${selected} item${selected===1?'':'s'} to fridge ${icon('arrow')}</button></div></form>`,true);
  document.querySelectorAll('[data-select]').forEach(input=>input.onchange=()=>{state.review[Number(input.dataset.select)].selected=input.checked;updateReviewCount();});
  document.querySelectorAll('[data-field]').forEach(input=>input.oninput=()=>{const item=state.review[Number(input.dataset.index)];item[input.dataset.field]=input.dataset.field==='quantity'?Number(input.value):input.value;});
  $('#toggle-all').onclick=()=>{const all=state.review.every(i=>i.selected);state.review.forEach(i=>i.selected=!all);renderReview();};
  $('#rescan').onclick=openScan;
  $('#review-form').noValidate=true;
  $('#review-form').onsubmit=e=>{e.preventDefault();confirmItems();};
}
function updateReviewCount() { const count=state.review.filter(i=>i.selected).length;$('#selected-count').textContent=`${count} selected`;$('#confirm-items').innerHTML=`Add ${count} item${count===1?'':'s'} to fridge ${icon('arrow')}`;$('#confirm-items').disabled=!count;$('#toggle-all').textContent=count===state.review.length?'Deselect all':'Select all'; }
async function confirmItems() {
  if(state.busy)return;
  let items;try{items=validateItems(state.review.filter(i=>i.selected));}catch(error){modalError(error.message);return;}
  state.busy=true;$('#confirm-items').disabled=true;$('#confirm-items').textContent='Adding to your fridge…';$('#close-modal').disabled=true;
  try {
    let count;
    if(state.scan.local) {
      // Stable scan + line IDs make local retries idempotent too.
      const existing=state.pantry.filter(i=>i.receipt_scan_id===state.scan.id);
      if(!existing.length){state.pantry=[...items.map((item,i)=>({...item,id:`${state.scan.id}-${i}`,source:'receipt',receipt_scan_id:state.scan.id})),...state.pantry];persistLocal();localPantry=state.pantry;}
      count=existing.length||items.length;
    } else {
      const result=await api('/rest/v1/rpc/confirm_receipt',{method:'POST',body:{p_scan_id:state.scan.id,p_items:items}});count=result.count;
      // Refresh separately: a fetch failure must never turn a successful save into a failed save.
      try { Object.assign(state,await loadKitchen());state.error=''; } catch { state.error='Your items were saved. Refresh to load your updated fridge.'; }
    }
    state.busy=false;state.page='fridge';state.filter='all';state.search='';render();showSuccess(count,items);
  } catch(error){state.busy=false;$('#close-modal').disabled=false;updateReviewCount();modalError(error.message);}
}
function showSuccess(count,items) {
  showModal('All tucked away',`<div class="success-state"><div class="success-check">${icon('check')}</div><span class="eyebrow">A LITTLE MORE POSSIBILITY</span><h3>${count} ingredient${count===1?'':'s'},<br>ready for what’s next.</h3><p>${escape(items.map(i=>i.name).join(', '))}</p><div class="saved-status">${icon('check')} ${getSession()?'Saved to your private Supabase fridge':'Sample items saved on this device'}</div><div class="success-actions"><button id="done" class="button primary full">Open my fridge ${icon('arrow')}</button><button id="another" class="text-button centered">Scan another receipt</button></div></div>`);
  $('#done').onclick=closeModal;$('#another').onclick=openScan;
}
function openAuth() {
  const create=state.authMode==='signup';
  showModal(create?'Make room for good things':'Welcome to your kitchen',`<div class="auth-symbol">${icon('leaf')}</div><p class="modal-lead">${create?'A fresh start. Less food waste.':'Good to have you back.'}</p><p class="muted">Sign in to save your ingredients securely in Supabase and find them here next time.</p><form id="auth-form"><label class="form-label">Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label><label class="form-label">Password<input name="password" type="password" autocomplete="${create?'new-password':'current-password'}" minlength="8" required placeholder="At least 8 characters"></label><button id="auth-submit" class="button primary full" type="submit">${create?'Create my kitchen':'Sign in'} ${icon('arrow')}</button></form><button class="text-button centered" id="auth-switch">${create?'Already have an account? Sign in':'New here? Create an account'}</button><p class="sample-note">Local sample ingredients stay separate from your signed-in fridge.</p>`);
  $('#auth-switch').onclick=()=>{state.authMode=create?'signin':'signup';openAuth();};
  $('#auth-form').onsubmit=async e=>{e.preventDefault();const form=new FormData(e.target);const button=$('#auth-submit');button.disabled=true;state.busy=true;$('#close-modal').disabled=true;try{
    const result=await(create?signUp(form.get('email'),form.get('password')):signIn(form.get('email'),form.get('password')));
    state.busy=false;
    if(create&&!result.access_token){showModal('Check your inbox',`<div class="account-info">${icon('check')}<h3>One last step.</h3><p>Open the confirmation email from Supabase, then return here and sign in.</p></div><button id="back-signin" class="button primary full">Back to sign in</button>`);$('#back-signin').onclick=()=>{state.authMode='signin';openAuth();};return;}
    state.pantry=[];state.scans=[];closeModal();await refresh();toast('Your kitchen is connected.');
  }catch(error){state.busy=false;button.disabled=false;$('#close-modal').disabled=false;modalError(error.message);}};
}
function openManual() {
  showModal('Add a little something',`<p class="muted">One ingredient is one more possibility.</p><form id="manual-form"><label class="form-label">Ingredient<input name="name" maxlength="100" placeholder="e.g. Baby spinach" required></label><div class="form-row"><label class="form-label">Amount<input name="quantity" type="number" min="0.01" max="10000" step="0.01" value="1" required></label><label class="form-label">Unit<input name="unit" maxlength="30" value="item" required></label></div><label class="form-label">Best before <span class="optional">optional</span><input name="expires_on" type="date"></label><button class="button primary full" id="manual-save">Add to my fridge ${icon('plus')}</button></form>`);
  $('#manual-form').onsubmit=async e=>{e.preventDefault();if(state.busy)return;const form=new FormData(e.target);try{const [item]=validateItems([{name:form.get('name'),quantity:Number(form.get('quantity')),unit:form.get('unit'),expires_on:form.get('expires_on')}]);state.busy=true;$('#manual-save').disabled=true;
    if(getSession()){await api('/rest/v1/pantry_items',{method:'POST',body:{...item,user_id:getSession().user.id,source:'manual'}});state.busy=false;closeModal();await refresh();}
    else{state.pantry.unshift({...item,id:crypto.randomUUID(),source:'manual'});persistLocal();localPantry=state.pantry;state.busy=false;closeModal();render();}toast('One more good thing in your fridge.');
  }catch(error){state.busy=false;$('#manual-save').disabled=false;modalError(error.message);}};
}
async function removeItem(id) {
  const item=state.pantry.find(i=>i.id===id);if(!item)return;
  showModal('Remove from your fridge?',`<p class="muted">${escape(item.name)} will be removed from your fridge.</p><div class="form-row"><button class="button outline" id="keep-item">Keep it</button><button class="button primary" id="remove-item">Remove item</button></div>`);
  $('#keep-item').onclick=closeModal;$('#remove-item').onclick=async()=>{if(state.busy)return;state.busy=true;$('#remove-item').disabled=true;try{if(getSession())await api(`/rest/v1/pantry_items?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});state.pantry=state.pantry.filter(i=>i.id!==id);if(!getSession()){persistLocal();localPantry=state.pantry;}state.busy=false;closeModal();render();toast('Item removed.');}catch(error){state.busy=false;$('#remove-item').disabled=false;modalError(error.message);}};
}
function editDate(id) {
  const item=state.pantry.find(i=>i.id===id);
  showModal('A date to keep in mind',`<p class="modal-lead">${escape(item.name)}</p><p class="muted">Use a date from the packaging, or leave it blank. A chosen date is a reminder, not a freshness guarantee.</p><form id="date-form"><label class="form-label">Best before<input name="date" type="date" value="${escape(item.expires_on||'')}"></label><div class="date-shortcuts"><button type="button" data-days="3">In 3 days</button><button type="button" data-days="7">In 1 week</button><button type="button" data-days="14">In 2 weeks</button></div><button id="date-save" class="button primary full">Save date</button></form>`);
  document.querySelectorAll('[data-days]').forEach(button=>button.onclick=()=>{$('[name="date"]').value=localDate(Number(button.dataset.days));});
  $('#date-form').onsubmit=async e=>{e.preventDefault();if(state.busy)return;const date=new FormData(e.target).get('date')||null;state.busy=true;$('#date-save').disabled=true;try{if(getSession())await api(`/rest/v1/pantry_items?id=eq.${id}`,{method:'PATCH',body:{expires_on:date}});item.expires_on=date;if(!getSession()){persistLocal();localPantry=state.pantry;}state.busy=false;closeModal();render();}catch(error){state.busy=false;$('#date-save').disabled=false;modalError(error.message);}};
}
function openRecipe(id) {
  const recipe=matchRecipes(state.recipes,state.pantry).find(r=>r.id===id);
  showModal('A good idea for dinner',`<span class="mode-badge">${icon('clock')}${recipe.cook_minutes} minutes · demo recipe</span><h3 class="recipe-modal-title">${escape(recipe.name)}</h3><p class="muted">${recipe.missing.length?`Still needed: ${escape(recipe.missing.join(', '))}`:'You have all the ingredient types in your fridge.'}</p><h4>Ingredients</h4><div class="ingredient-tags">${recipe.ingredients.map(i=>`<span>${escape(typeof i==='string'?i:i.name)}</span>`).join('')}</div><h4>Let’s get cooking</h4><ol class="recipe-steps">${recipe.instructions.map(step=>`<li>${escape(step)}</li>`).join('')}</ol><p class="sample-note">Check amounts and freshness. Cooking oil and seasoning are assumed basics.</p>`);
}
render();if(getSession())refresh();
