(() => {
  const cfg = window.AYUSH_SUPABASE || {};
  const $ = id => document.getElementById(id);
  const client = (window.supabase && cfg.url && cfg.publishableKey && !String(cfg.publishableKey).includes('PASTE_YOUR'))
    ? window.supabase.createClient(cfg.url, cfg.publishableKey)
    : null;

  const DEFAULTS = {
    site_name:'AYUSH OP', real_name:'Ayush Mishra', hero_title:'AYUSH OP',
    tagline:'Creator · Gamer · Developer · Problem Solver',
    hero_description:'Welcome to my personal space. Explore my work, connect with me, and ask for help whenever you need it.',
    about_text:'I’m passionate about technology, gaming, web development, creativity, and helping people solve problems. I enjoy building projects, learning new tools, and turning ideas into interactive experiences.',
    phone:'9754478008', instagram:'https://www.instagram.com/yk._4yushhh/', instagram_label:'@yk._4yushhh',
    telegram:'https://t.me/maybe_4yush', telegram_label:'@maybe_4yush', discord:'@pandit.vidhyak', discord_link:'',
    youtube:'', youtube_label:'COMING SOON', twitter:'', twitter_label:'COMING SOON'
  };
  const DEFAULT_PHOTOS = [
    {sort_order:1,title:'FORMAL MODE',image_url:'https://i.ibb.co/Y7Dy1cPt/Screenshot-2026-08-12-21-46-23-62-99c04817c0de5652397fc8b56c3b3817.jpg'},
    {sort_order:2,title:'RIDE MODE',image_url:'https://i.ibb.co/h143FnYk/file-00000000d2988211953bc26292c8154c.png'},
    {sort_order:3,title:'EVENT MODE',image_url:'https://i.ibb.co/GfGjzqqY/IMG-20260807-WA0006.jpg'}
  ];

  const authPanel=$('authPanel'), appPanel=$('appPanel'), configNote=$('configNote');
  let projectRows=[];

  function toast(msg, ok=true){
    const t=$('toast'); if(!t) return;
    t.textContent=msg; t.className='toast '+(ok?'ok':'bad');
    setTimeout(()=>{t.className='toast'},3200);
  }
  function showApp(){authPanel.style.display='none';appPanel.style.display='block';}
  function showAuth(){authPanel.style.display='block';appPanel.style.display='none';}
  function requireClient(){
    if(!client) throw new Error('Supabase is not configured. Keep your existing supabase-config.js with the real publishable key.');
  }

  async function ensureAdmin(){
    requireClient();
    const {data:{user}}=await client.auth.getUser();
    if(!user) return false;
    const {data,error}=await client.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error){console.error(error);return false;}
    return !!data;
  }

  $('loginForm')?.addEventListener('submit', async e=>{
    e.preventDefault();
    try{
      requireClient();
      const email=$('loginEmail').value.trim();
      const password=$('loginPassword').value;
      $('loginHint').textContent='Signing in…';
      const {error}=await client.auth.signInWithPassword({email,password});
      if(error){$('loginHint').textContent=error.message;toast(error.message,false);return;}
      if(!(await ensureAdmin())){
        await client.auth.signOut();
        $('loginHint').textContent='Login worked, but this email is not in admin_users.';
        toast('This account is not an admin.',false);
        return;
      }
      $('loginHint').textContent=''; showApp(); await loadAll(); toast('Welcome to AYUSH OP Admin ✓');
    }catch(err){console.error(err); $('loginHint').textContent=err.message; toast(err.message,false);}
  });

  $('logoutBtn')?.addEventListener('click',async()=>{try{await client.auth.signOut()}finally{location.reload()}});

  const settingsFields={
    profileName:'real_name',displayName:'site_name',heroTitle:'hero_title',heroSubtitle:'tagline',heroText:'hero_description',aboutText:'about_text',
    phone:'phone',instagram:'instagram',instagramLabel:'instagram_label',telegram:'telegram',telegramLabel:'telegram_label',discord:'discord',discordLink:'discord_link',
    youtube:'youtube',youtubeLabel:'youtube_label',twitter:'twitter',twitterLabel:'twitter_label'
  };

  async function loadSettings(){
    const {data,error}=await client.from('site_settings').select('*').eq('id',1).maybeSingle();
    if(error) throw error;
    const c={...DEFAULTS,...(data||{})};
    Object.entries(settingsFields).forEach(([id,key])=>{if($(id)) $(id).value=c[key]??'';});
  }

  async function saveSettings(){
    const payload={id:1};
    Object.entries(settingsFields).forEach(([id,key])=>payload[key]=$(id)?.value.trim()??'');
    const {error}=await client.from('site_settings').upsert(payload,{onConflict:'id'});
    if(error) throw error;
    toast('Website text & settings saved ✓');
  }
  $('saveSettings')?.addEventListener('click',()=>saveSettings().catch(e=>toast(e.message,false)));
  $('saveSocials')?.addEventListener('click',()=>saveSettings().catch(e=>toast(e.message,false)));

  function normalizeRows(rows){
    const map=new Map((rows||[]).map(r=>[Number(r.sort_order),r]));
    return [1,2,3].map(slot=>map.get(slot)||DEFAULT_PHOTOS[slot-1]);
  }

  async function loadPhotos(){
    const {data,error}=await client.from('photos').select('id,title,image_url,sort_order,created_at').order('sort_order',{ascending:true}).order('created_at',{ascending:true});
    if(error) throw error;
    const rows=normalizeRows(data||[]);
    rows.forEach((p,i)=>{
      const slot=i+1;
      $(`photoUrl${slot}`).value=p.image_url||'';
      $(`photoTitle${slot}`).value=p.title||DEFAULT_PHOTOS[i].title;
    });
    renderPhotoPreview(rows);
  }

  function renderPhotoPreview(rows){
    const grid=$('cloudPhotos'); grid.innerHTML='';
    rows.forEach((p,i)=>{
      const card=document.createElement('article'); card.className='cloud-photo';
      const img=p.image_url?`<img src="${escapeAttr(p.image_url)}" alt="">`:`<div class="empty">No image</div>`;
      card.innerHTML=`${img}<div><b>Slot ${i+1}: ${escapeHtml(p.title||'Untitled')}</b><small>${escapeHtml(p.image_url||'')}</small></div>`;
      grid.appendChild(card);
    });
  }

  function validImageUrl(url){
    try{const u=new URL(url); return /^https?:$/.test(u.protocol)}catch{return false}
  }

  async function savePhotos(){
    for(let slot=1;slot<=3;slot++){
      const image_url=$(`photoUrl${slot}`).value.trim();
      const title=$(`photoTitle${slot}`).value.trim()||`PHOTO ${slot}`;
      if(!image_url){
        const {error}=await client.from('photos').delete().eq('sort_order',slot);
        if(error) throw error;
        continue;
      }
      if(!validImageUrl(image_url)) throw new Error(`Photo ${slot}: enter a valid http/https image URL.`);
      const {data:existing,error:findError}=await client.from('photos').select('id').eq('sort_order',slot).maybeSingle();
      if(findError) throw findError;
      if(existing){
        const {error}=await client.from('photos').update({title,image_url,sort_order:slot,photo_type:'gallery'}).eq('id',existing.id);
        if(error) throw error;
      }else{
        const {error}=await client.from('photos').insert({title,image_url,sort_order:slot,photo_type:'gallery'});
        if(error) throw error;
      }
    }
    $('photoStatus').textContent='Saved ✓'; $('photoStatus').className='status show';
    setTimeout(()=>$('photoStatus').className='status',2200);
    await loadPhotos();
    toast('Photos saved ✓');
  }
  $('savePhotos')?.addEventListener('click',()=>savePhotos().catch(e=>toast(e.message,false)));

  function renderProjectEditor(){
    const box=$('projectsEditor'); box.innerHTML='';
    if(!projectRows.length) box.innerHTML='<div class="empty">No projects yet. Add a project slot.</div>';
    projectRows.forEach((p,index)=>{
      const card=document.createElement('article'); card.className='request';
      card.innerHTML=`
        <div style="padding-right:90px"><b>PROJECT ${index+1}</b><span>${p.id?'Cloud project':'New project'}</span></div>
        <label style="margin-top:12px">Title<input data-p-title value="${escapeAttr(p.title||'')}"></label>
        <label style="margin-top:12px">Description<textarea data-p-desc>${escapeHtml(p.description||'')}</textarea></label>
        <label style="margin-top:12px">Project URL (optional)<input data-p-url value="${escapeAttr(p.project_url||'')}"></label>
        <div style="display:flex;gap:10px;margin-top:12px"><button class="back" data-delete-project>DELETE</button></div>`;
      card.querySelector('[data-p-title]').addEventListener('input',e=>p.title=e.target.value);
      card.querySelector('[data-p-desc]').addEventListener('input',e=>p.description=e.target.value);
      card.querySelector('[data-p-url]').addEventListener('input',e=>p.project_url=e.target.value);
      card.querySelector('[data-delete-project]').addEventListener('click',async()=>{
        if(p.id){const {error}=await client.from('projects').delete().eq('id',p.id); if(error){toast(error.message,false);return;}}
        projectRows=projectRows.filter(x=>x!==p); renderProjectEditor(); toast('Project removed ✓');
      });
      box.appendChild(card);
    });
  }

  async function loadProjects(){
    const {data,error}=await client.from('projects').select('*').order('created_at',{ascending:true});
    if(error) throw error;
    projectRows=(data||[]).map(p=>({...p}));
    renderProjectEditor();
  }

  async function saveProjects(){
    for(const p of projectRows){
      const title=(p.title||'').trim(); const description=(p.description||'').trim(); const project_url=(p.project_url||'').trim();
      if(!title) continue;
      if(p.id){
        const {error}=await client.from('projects').update({title,description,project_url}).eq('id',p.id); if(error) throw error;
      }else{
        const {data,error}=await client.from('projects').insert({title,description,project_url,technologies:[]}).select('*').single(); if(error) throw error; p.id=data.id;
      }
    }
    await loadProjects(); toast('Projects saved ✓');
  }
  $('saveProjects')?.addEventListener('click',()=>saveProjects().catch(e=>toast(e.message,false)));
  $('addProject')?.addEventListener('click',()=>{projectRows.push({title:'New Project',description:'',project_url:''});renderProjectEditor();});

  async function loadRequests(){
    const {data,error}=await client.from('help_requests').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    const box=$('requests'); box.innerHTML='';
    if(!data?.length){box.innerHTML='<div class="empty">No help requests yet.</div>';return;}
    data.forEach(x=>{
      const card=document.createElement('article'); card.className='request';
      card.innerHTML=`<div><b>${escapeHtml(x.name)}</b><span>${escapeHtml(x.category||'General')} · ${new Date(x.created_at).toLocaleString()}</span></div><p>${escapeHtml(x.problem)}</p><small>${escapeHtml(x.email||'No email')}</small><div class="request-actions" style="position:static;margin-top:12px;display:flex;gap:10px"><button class="back" data-resolve>MARK RESOLVED</button><button class="danger" data-delete>DELETE</button></div>`;
      card.querySelector('[data-resolve]').addEventListener('click',async()=>{const {error}=await client.from('help_requests').update({status:'resolved'}).eq('id',x.id);if(error)toast(error.message,false);else{toast('Marked resolved ✓');loadRequests();}});
      card.querySelector('[data-delete]').addEventListener('click',async()=>{if(!confirm('Delete this help request?'))return;const {error}=await client.from('help_requests').delete().eq('id',x.id);if(error)toast(error.message,false);else{toast('Request deleted ✓');loadRequests();}});
      box.appendChild(card);
    });
  }
  $('refreshRequests')?.addEventListener('click',()=>loadRequests().catch(e=>toast(e.message,false)));

  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function escapeAttr(s){return escapeHtml(s).replace(/\r?\n/g,' ');}

  async function loadAll(){
    await Promise.all([loadSettings(),loadPhotos(),loadProjects(),loadRequests()]);
  }

  async function start(){
    if(!client){configNote.textContent='Supabase is not configured. Keep the existing supabase-config.js that already contains your real publishable key.';showAuth();return;}
    configNote.textContent='Supabase connected. Checking admin session…';
    try{
      if(await ensureAdmin()){configNote.textContent='Cloud connected ✓';showApp();await loadAll();}
      else {configNote.textContent='Supabase connected. Please sign in.';showAuth();}
    }catch(err){console.error(err);configNote.textContent='Connection error: '+err.message;showAuth();}
  }
  start();
})();
