const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  leaf: '<path d="M12 21v-9M12 16C4 17 3 10 4 6c8-1 11 4 8 10ZM12 12c0-7 5-9 10-8 0 6-3 10-10 8Z"/>',
  chef: '<path d="M6 14a5 5 0 0 1-2-9 5 5 0 0 1 8-2 5 5 0 0 1 8 2 5 5 0 0 1-2 9v7H6v-7ZM6 17h12"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  message: '<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.2-5A9 9 0 1 1 21 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  fridge: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M5 10h14M9 6v1M9 14v3"/>',
  scan: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 8h8v8H8Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  camera: '<path d="M8 5 6 8H3v13h18V8h-3l-2-3Z"/><circle cx="12" cy="14" r="4"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  receipt: '<path d="m5 3 2 1 2-1 3 1 3-1 2 1 2-1v19l-3-2-4 2-4-2-3 2V3ZM9 8h6M9 12h6M9 16h3"/>',
  refresh: '<path d="M20 8a9 9 0 1 0 1 8M20 3v6h-6"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3-7-7-3 7-3Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  gift: '<path d="M3 8h18v5H3ZM5 13v8h14v-8M12 8v13"/><path d="M12 8C3 9 5 0 9 3l3 5c9 1 7-8 3-5Z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  send: '<path d="m3 3 19 9-19 9 4-9-4-9ZM7 12h15"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>'
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
const avatar = (name, cls = "") => `<span class="avatar ${cls}" aria-hidden="true">${escape(name.split(/\s+/).map((n) => n[0]).slice(0, 2).join(""))}</span>`;
const badge = (text) => `<span class="badge">${escape(text)}</span>`;
const empty = (title, note = "Try another filter, or start something good.") => `<div class="empty-state">${icon("leaf")}<h3>${escape(title)}</h3><p>${escape(note)}</p></div>`;
function sectionTitle(title, action = "", attrs = "") {
  return `<div class="section-heading"><h2>${escape(title)}</h2>${action ? `<button class="text-button" ${attrs}>${escape(action)} ${icon("arrow")}</button>` : ""}</div>`;
}
function art(name, cls = "") {
  const n = String(name).toLowerCase();
  let contents;
  if (/avocado/.test(n)) contents = '<ellipse cx="136" cy="113" rx="47" ry="67" transform="rotate(-25 136 113)" fill="#64835b"/><ellipse cx="136" cy="113" rx="39" ry="58" transform="rotate(-25 136 113)" fill="#e4e9a4"/><circle cx="141" cy="133" r="24" fill="#a56b43"/><ellipse cx="229" cy="115" rx="39" ry="60" transform="rotate(24 229 115)" fill="#385d43"/><path d="m219 51 6-13" stroke="#6e724b" stroke-width="7"/>';
  else if (/milk/.test(n)) contents = '<path d="m141 57 25-25h53l22 25v131H141Z" fill="#fafbf4" stroke="#b8cbb5" stroke-width="3"/><path d="M141 57h100l-22-25h-53Z" fill="#9bb89b"/><path d="M157 99h67v56h-67Z" fill="#d4e4ce"/><path d="M183 112c-25 15-18 31 8 31 24 0 27-16 5-31" fill="#86a681"/>';
  else if (/egg|omelette/.test(n) && !/rice|bibimbap/.test(n)) contents = '<ellipse cx="190" cy="123" rx="103" ry="65" fill="#f9faf4" stroke="#d5decb" stroke-width="4"/><path d="M108 127c15-70 145-72 165 0-8 64-150 67-165 0Z" fill="#edc86b"/><path d="M110 127c40 12 108 13 160-1" stroke="#dfaf46" stroke-width="5"/><path d="m143 102 19-10m53 13 24 9m-62 36 20-10m-67-7 13 10m76-48 13-3" stroke="#527448" stroke-width="8" stroke-linecap="round"/>';
  else if (/tomato/.test(n)) contents = '<circle cx="146" cy="126" r="47" fill="#d77757"/><circle cx="226" cy="118" r="53" fill="#bf6245"/><path d="m123 75 23 12 21-15-10 21 19 12-29-4-20 13 7-22Zm80-18 23 13 20-14-9 23 21 14-31-6-23 14 9-25Z" fill="#557651"/>';
  else if (/spinach|onion|carrot|basil|vegetable/.test(n)) contents = '<path d="M190 183C99 178 88 91 123 61c66 2 86 62 67 122Z" fill="#6c8f63"/><path d="M187 181c-15-85 24-129 82-126 31 72-11 119-82 126Z" fill="#436b48"/><path d="m190 191-45-98m45 98 50-103" stroke="#b3c69b" stroke-width="5" stroke-linecap="round"/>';
  else {
    const stew = /stew|jjigae|curry/.test(n), rice = /rice|bibimbap/.test(n);
    contents = `<ellipse cx="190" cy="151" rx="112" ry="44" fill="#244b3c" opacity=".12"/><path d="M78 105h224c-7 72-48 91-112 91S86 177 78 105Z" fill="#fbfaf2"/><ellipse cx="190" cy="105" rx="112" ry="62" fill="#e3e4ce"/><ellipse cx="190" cy="105" rx="101" ry="53" fill="${stew ? "#c57a4b" : rice ? "#d4b67b" : "#c2c694"}"/><path d="m118 102 37-23 16 20-37 22Zm95-34 29 13-9 22-33-15Zm21 63 29-13 12 22-32 12Z" fill="${stew ? "#f2dfb6" : "#d78958"}"/><path d="m111 130 27 11m18-81 7 20m76 37 28-10m-80 38 5-20" stroke="#587c48" stroke-width="13" stroke-linecap="round"/>${rice ? '<path d="M161 96c-18-30 42-45 60-13 37 22 3 57-26 42-24 15-52-5-34-29Z" fill="#fff9e7"/><circle cx="191" cy="99" r="18" fill="#eab951"/>' : ""}<path d="m289 29-51 148m68-141-49 148" stroke="#8b6647" stroke-width="5" stroke-linecap="round"/>`;
  }
  return `<svg class="food-art ${cls}" viewBox="0 0 380 230" role="img" aria-label="${escape(name)} illustration"><ellipse cx="190" cy="128" rx="146" ry="91" fill="currentColor" opacity=".08"/>${contents}<path d="m65 51 6 9m-26 63 10 2m254 54 9-6" stroke="currentColor" opacity=".3" stroke-width="3" stroke-linecap="round"/></svg>`;
}
export {
  art,
  avatar,
  badge,
  empty,
  escape,
  icon,
  sectionTitle
};
