(() => {
  const DEFAULT_CONFIG = {
    profileName: 'Ayush Mishra', displayName: 'AYUSH OP',
    heroTitle: 'AYUSH OP', heroSubtitle: 'Creator · Gamer · Developer · Problem Solver',
    heroText: 'Welcome to my personal space. Explore my work, connect with me, and ask for help whenever you need it.',
    aboutText: 'I’m passionate about technology, gaming, web development, creativity, and helping people solve problems. I enjoy building projects, learning new tools, and turning ideas into interactive experiences.',
    phone: '9754478008', instagram: 'https://www.instagram.com/yk._4yushhh/', instagramLabel: '@yk._4yushhh',
    telegram: 'https://t.me/maybe_4yush', telegramLabel: '@maybe_4yush', discord: '@pandit.vidhyak', discordLink: '',
    youtube: '', youtubeLabel: 'COMING SOON', twitter: '', twitterLabel: 'COMING SOON',
    project1: ['Future Web','A modern experimental website with motion, glow effects and interactive UI.'],
    project2: ['Gaming Hub','A creator-focused gaming interface for videos, community and updates.'],
    project3: ['Help Center','A simple place where visitors can submit questions and request support.']
  };
  const cfg = JSON.parse(localStorage.getItem('ayushSiteConfig') || 'null') || DEFAULT_CONFIG;
  const saveCfg = (next) => localStorage.setItem('ayushSiteConfig', JSON.stringify(next));
  const $ = id => document.getElementById(id);
  Object.entries(cfg).forEach(([key,val]) => { const el = $(key); if (el) el.value = Array.isArray(val) ? val.join('|') : val; });

  const DB_NAME='ayush-op-media', STORE='photos';
  function openDB(){ return new Promise((res,rej)=>{ const r=indexedDB.open(DB_NAME,1); r.onupgradeneeded=()=>r.result.createObjectStore(STORE); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async function putPhoto(slot, blob){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(blob, slot); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
  async function getPhoto(slot){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readonly'); const r=tx.objectStore(STORE).get(slot); r.onsuccess=()=>res(r.result||null); r.onerror=()=>rej(r.error); }); }
  async function clearPhoto(slot){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(slot); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
  async function preview(slot, img, src){ try{ const b=await getPhoto(slot); if(b){ img.src=URL.createObjectURL(b); img.dataset.custom='1'; return; } img.src=src; }catch{img.src=src;} }

  document.querySelectorAll('[data-save]').forEach(btn=>btn.addEventListener('click',()=>{
    const next={...cfg}; document.querySelectorAll('[data-key]').forEach(el=>next[el.dataset.key]=el.value);
    saveCfg(next); Object.assign(cfg,next); const s=$('saveStatus'); s.textContent='Saved successfully ✓'; s.classList.add('show'); setTimeout(()=>s.classList.remove('show'),1800);
  }));
  document.querySelectorAll('[data-photo-slot]').forEach(async card=>{
    const slot=card.dataset.photoSlot, input=card.querySelector('input[type=file]'), img=card.querySelector('img'), reset=card.querySelector('[data-reset]');
    await preview(slot,img,img.dataset.default);
    input.addEventListener('change',async()=>{const f=input.files[0]; if(!f)return; await putPhoto(slot,f); await preview(slot,img,img.dataset.default);});
    reset.addEventListener('click',async()=>{await clearPhoto(slot); await preview(slot,img,img.dataset.default);});
  });

  function renderRequests(){ const box=$('requests'); const items=JSON.parse(localStorage.getItem('ayushHelpRequests')||'[]'); box.innerHTML=items.length?items.map((x,i)=>`<article class="request"><div><b>${escapeHtml(x.name||'Anonymous')}</b><span>${escapeHtml(x.category||'General Help')} · ${escapeHtml(x.time||'')}</span></div><p>${escapeHtml(x.problem||'')}</p><small>${escapeHtml(x.email||'No email')}</small><button data-del="${i}">Delete</button></article>`).join(''):'<div class="empty">No help requests saved in this browser yet.</div>'; box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const a=JSON.parse(localStorage.getItem('ayushHelpRequests')||'[]');a.splice(+b.dataset.del,1);localStorage.setItem('ayushHelpRequests',JSON.stringify(a));renderRequests();}); }
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  $('clearRequests').onclick=()=>{localStorage.removeItem('ayushHelpRequests');renderRequests();}; renderRequests();
})();
