(() => {
  const cfg = window.AYUSH_SUPABASE || {};
  const client = (window.supabase && cfg.url && cfg.publishableKey && !String(cfg.publishableKey).includes('PASTE_YOUR')) ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
  const bucket = cfg.bucket || 'ayush-media';
  const $ = id => document.getElementById(id);
  const authPanel = $('authPanel');
  const appPanel = $('appPanel');
  const configNote = $('configNote');
  let settingsId=1;

  const defaultSettings={site_name:'AYUSH OP',real_name:'Ayush Mishra',hero_title:'AYUSH OP',tagline:'Creator · Gamer · Developer · Problem Solver',hero_description:'Welcome to my personal space. Explore my work, connect with me, and ask for help whenever you need it.',about_text:'I’m passionate about technology, gaming, web development, creativity, and helping people solve problems. I enjoy building projects, learning new tools, and turning ideas into interactive experiences.',phone:'9754478008',instagram:'https://www.instagram.com/yk._4yushhh/',instagram_label:'@yk._4yushhh',telegram:'https://t.me/maybe_4yush',telegram_label:'@maybe_4yush',discord:'@pandit.vidhyak',discord_link:'',youtube:'',youtube_label:'COMING SOON',twitter:'',twitter_label:'COMING SOON'};
  if(!client){ configNote.textContent='Supabase is not configured yet. Add the Publishable key in supabase-config.js.'; authPanel.style.display='block'; return; }

  function toast(msg,ok=true){const t=$('toast');t.textContent=msg;t.className='toast '+(ok?'ok':'bad');setTimeout(()=>t.className='toast',2500)}
  function showApp(){authPanel.style.display='none';appPanel.style.display='block'}
  function showAuth(){authPanel.style.display='block';appPanel.style.display='none'}
  async function ensureAdmin(){
    const {data:{user}}=await client.auth.getUser();
    if(!user) return false;
    const {data,error}=await client.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error || !data){ await client.auth.signOut(); toast('This account is not an AYUSH OP admin.',false); return false; }
    return true;
  }
  async function start(){if(await ensureAdmin()){showApp();await loadAll()}else showAuth()}
  $('loginForm')?.addEventListener('submit',async e=>{e.preventDefault(); if(!client){toast('Supabase is not configured. Check supabase-config.js.',false); return;} const email=$('loginEmail')?.value.trim()||''; const password=$('loginPassword')?.value||''; if(!email||!password){toast('Enter your email and password.',false);return;} try{const {error}=await client.auth.signInWithPassword({email,password}); if(error){toast(error.message,false);return;} if(!(await ensureAdmin()))return; showApp(); await loadAll();}catch(err){console.error(err);toast(err?.message||'Login failed.',false);}});
  $('logoutBtn')?.addEventListener('click',async()=>{await client.auth.signOut();location.reload()});

  const fieldMap={profileName:'real_name',displayName:'site_name',heroTitle:'hero_title',heroSubtitle:'tagline',heroText:'hero_description',aboutText:'about_text',phone:'phone',instagram:'instagram',instagramLabel:'instagram_label',telegram:'telegram',telegramLabel:'telegram_label',discord:'discord',discordLink:'discord_link',youtube:'youtube',youtubeLabel:'youtube_label',twitter:'twitter',twitterLabel:'twitter_label'};
  async function loadSettings(){const {data,error}=await client.from('site_settings').select('*').eq('id',settingsId).maybeSingle(); if(error)throw error; const c=data||defaultSettings; Object.entries(fieldMap).forEach(([id,key])=>{const el=$(id);if(el)el.value=c[key]??''});}
  async function saveSettings(){const payload={id:settingsId};Object.entries(fieldMap).forEach(([id,key])=>payload[key]=$(id)?.value??'');const {error}=await client.from('site_settings').upsert(payload,{onConflict:'id'});if(error)throw error;toast('Website settings saved ✓')}
  document.querySelectorAll('[data-save]').forEach(btn=>btn.addEventListener('click',()=>saveSettings().catch(e=>toast(e.message,false))));
  window.addEventListener('save-projects',()=>saveProjects().catch(e=>toast(e.message,false)));

  async function loadProjects(){const {data,error}=await client.from('projects').select('*').order('created_at',{ascending:true});if(error)throw error;const items=data||[];for(let i=1;i<=3;i++){const p=items[i-1]||{};if($(`project${i}Title`))$(`project${i}Title`).value=p.title||['Future Web','Gaming Hub','Help Center'][i-1];if($(`project${i}Desc`))$(`project${i}Desc`).value=p.description||'';}}
  async function saveProjects(){const {data:old,error:e}=await client.from('projects').select('*').order('created_at',{ascending:true});if(e)throw e;for(let i=1;i<=3;i++){const title=$(`project${i}Title`)?.value.trim();const description=$(`project${i}Desc`)?.value.trim();const existing=(old||[])[i-1];if(existing){const {error}=await client.from('projects').update({title,description}).eq('id',existing.id);if(error)throw error}else{const {error}=await client.from('projects').insert({title,description,technologies:[]});if(error)throw error;}}toast('Projects saved ✓')}

  function publicUrl(path){return `${cfg.url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`}
  async function getPhotos(){const {data,error}=await client.from('photos').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true});if(error)throw error;return data||[]}
  function renderPhotos(items){const grid=$('cloudPhotos'); if(!grid){console.warn('Admin UI: #cloudPhotos not found; skipping photo render.'); return;} grid.innerHTML=''; if(!items.length){grid.innerHTML='<div class="empty">No cloud photos yet. Upload your first image.</div>';return;}items.forEach(x=>{const card=document.createElement('article');card.className='cloud-photo';card.innerHTML=`<img src="${x.image_url}" alt="${x.title||'AYUSH OP photo'}"><div><b>${x.title||'Untitled'}</b><small>Slot ${x.sort_order||0}</small><button data-delete-photo="${x.id}" data-path="${x.storage_path||''}">DELETE</button></div>`;grid.appendChild(card)});grid.querySelectorAll('[data-delete-photo]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('Delete this photo?'))return;const id=btn.dataset.deletePhoto;const path=btn.dataset.path;try{if(path)await client.storage.from(bucket).remove([path]);const {error}=await client.from('photos').delete().eq('id',id);if(error)throw error;toast('Photo deleted ✓');renderPhotos(await getPhotos())}catch(e){toast(e.message,false)}}))}
  async function refreshPhotos(){renderPhotos(await getPhotos())}
  async function uploadPhoto(file,title,slot){if(!file)throw new Error('Choose an image first.');if(!file.type.startsWith('image/'))throw new Error('Only image files are allowed.');if(file.size>10*1024*1024)throw new Error('Maximum file size is 10 MB.');const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'jpg');const path=`uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;const up=await client.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;const url=publicUrl(path);if(slot){const old=(await client.from('photos').select('*').eq('sort_order',slot).limit(1).maybeSingle()).data;if(old){if(old.storage_path)await client.storage.from(bucket).remove([old.storage_path]);await client.from('photos').delete().eq('id',old.id);}}const {error}=await client.from('photos').insert({title:title||file.name,image_url:url,storage_path:path,photo_type:'profile',sort_order:Number(slot||99)});if(error){await client.storage.from(bucket).remove([path]);throw error;}}
  $('photoUploadForm')?.addEventListener('submit',async e=>{e.preventDefault();try{const f=$('photoFile').files[0];const t=$('photoTitle').value.trim();const slot=$('photoSlot').value;await uploadPhoto(f,t,slot);$('photoUploadForm').reset();toast('Photo uploaded to cloud ✓');await refreshPhotos()}catch(err){toast(err.message,false)}})

  async function loadRequests(){const box=$('requests'); if(!box){console.warn('Admin UI: #requests not found; skipping help inbox.'); return;} const {data,error}=await client.from('help_requests').select('*').order('created_at',{ascending:false});if(error)throw error;box.innerHTML=(data||[]).length?(data||[]).map(x=>`<article class="request"><div><b>${escapeHtml(x.name)}</b><span>${escapeHtml(x.category||'General')} · ${new Date(x.created_at).toLocaleString()}</span></div><p>${escapeHtml(x.problem)}</p><small>${escapeHtml(x.email||'No email')}</small><div class="request-actions"><button data-status="${x.id}" data-value="resolved">MARK RESOLVED</button><button data-rdelete="${x.id}" class="danger">DELETE</button></div></article>`).join(''):'<div class="empty">No help requests yet.</div>';box.querySelectorAll('[data-rdelete]').forEach(b=>b.onclick=async()=>{await client.from('help_requests').delete().eq('id',b.dataset.rdelete);loadRequests()});box.querySelectorAll('[data-status]').forEach(b=>b.onclick=async()=>{await client.from('help_requests').update({status:b.dataset.value}).eq('id',b.dataset.status);loadRequests()});}
  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  async function loadAll(){try{await loadSettings();await loadProjects();await refreshPhotos();await loadRequests()}catch(e){toast(e.message,false)}}
  window.addEventListener('focus',()=>{if(appPanel && appPanel.style.display!=='none')loadRequests().catch(()=>{})});
  start();
})();
