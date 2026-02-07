
// Common helpers: hashing, id gen, UI
async function sha256(message){
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function qs(sel, ctx=document){ return ctx.querySelector(sel); }
function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }
function setText(el, text){ if(el) el.textContent = text; }
function serializeForm(form){ const o={}; new FormData(form).forEach((v,k)=>{ o[k]=v; }); return o; }
function toast(msg){ alert(msg); }
