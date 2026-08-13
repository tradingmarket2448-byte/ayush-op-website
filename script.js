(() => {
  const FALLBACK = {
    site_name: 'AYUSH OP',
    real_name: 'Ayush Mishra',
    hero_title: 'AYUSH OP',
    tagline: 'Creator · Gamer · Developer · Problem Solver',
    hero_description: 'Welcome to my personal space. Explore my work, connect with me, and ask for help whenever you need it.',
    about_text: 'I’m passionate about technology, gaming, web development, creativity, and helping people solve problems. I enjoy building projects, learning new tools, and turning ideas into interactive experiences.',
    phone: '9754478008',
    instagram: 'https://www.instagram.com/yk._4yushhh/',
    instagram_label: '@yk._4yushhh',
    telegram: 'https://t.me/maybe_4yush',
    telegram_label: '@maybe_4yush',
    discord: '@pandit.vidhyak',
    discord_link: '',
    youtube: '',
    youtube_label: 'COMING SOON',
    twitter: '',
    twitter_label: 'COMING SOON'
  };

  const FALLBACK_PHOTOS = [
    'https://i.ibb.co/Y7Dy1cPt/Screenshot-2026-08-12-21-46-23-62-99c04817c0de5652397fc8b56c3b3817.jpg',
    'https://i.ibb.co/h143FnYk/file-00000000d2988211953bc26292c8154c.png',
    'https://i.ibb.co/GfGjzqqY/IMG-20260807-WA0006.jpg'
  ];

  const PROJECTS = [
    {title:'Future Web', description:'A modern experimental website with motion, glow effects and interactive UI.'},
    {title:'Gaming Hub', description:'A creator-focused gaming interface for videos, community and updates.'},
    {title:'Help Center', description:'A simple place where visitors can submit questions and request support.'}
  ];

  const cfg = window.AYUSH_SUPABASE || {};
  const hasSupabase = () => window.supabase && cfg.url && cfg.publishableKey && !String(cfg.publishableKey).includes('PASTE_YOUR');
  const client = hasSupabase() ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
  const $ = id => document.getElementById(id);
  const setText = (id, val) => { const e=$(id); if(e) e.textContent = val ?? ''; };
  const setLink = (id, href) => {
    const e=$(id); if(!e) return;
    if(href){ e.href=href; e.target='_blank'; e.rel='noreferrer'; e.style.pointerEvents='auto'; e.style.opacity='1'; }
    else { e.href='#'; e.removeAttribute('target'); e.removeAttribute('rel'); e.style.pointerEvents='none'; e.style.opacity='.55'; }
  };

  function photoListFromCloud(rows) {
    const out=[...FALLBACK_PHOTOS];
    (rows||[]).forEach(row => {
      const slot = Number(row.sort_order);
      if(slot>=1 && slot<=3 && row.image_url) out[slot-1]=row.image_url;
    });
    return out;
  }

  async function loadCloudData(){
    if(!client) return {settings:FALLBACK, projects:PROJECTS, photos:[]};
    const [s,p,ph] = await Promise.all([
      client.from('site_settings').select('*').eq('id',1).maybeSingle(),
      client.from('projects').select('*').order('created_at',{ascending:true}),
      client.from('photos').select('id,title,image_url,sort_order,created_at').order('sort_order',{ascending:true}).order('created_at',{ascending:true})
    ]);
    if(s.error) console.warn('site_settings:',s.error.message);
    if(p.error) console.warn('projects:',p.error.message);
    if(ph.error) console.warn('photos:',ph.error.message);
    return {
      settings: s.data ? {...FALLBACK,...s.data} : FALLBACK,
      projects: p.data?.length ? p.data : PROJECTS,
      photos: ph.data || []
    };
  }

  function render(data){
    const c=data.settings;
    setText('heroSubtitle',c.tagline);
    setText('heroText',c.hero_description);
    setText('profileNameText',(c.real_name||'Ayush Mishra')+'.');
    setText('aboutText',c.about_text);
    setText('phoneLabel',c.phone);
    setText('instagramLabel',c.instagram_label || c.instagram);
    setText('telegramLabel',c.telegram_label || c.telegram);
    setText('discordLabel',c.discord);
    setText('youtubeLabel',c.youtube_label || (c.youtube?'YouTube':'COMING SOON'));
    setText('twitterLabel',c.twitter_label || (c.twitter?'@X':'COMING SOON'));
    setLink('phoneLink', c.phone ? 'tel:'+c.phone : '');
    setLink('instagramLink',c.instagram);
    setLink('telegramLink',c.telegram);
    setLink('socialPhone',c.phone?'tel:'+c.phone:'');
    setLink('socialInstagram',c.instagram);
    setLink('socialTelegram',c.telegram);
    setLink('socialYoutube',c.youtube);
    setLink('socialTwitter',c.twitter);
    setLink('socialDiscord',c.discord_link);
    const ps=data.projects.slice(0,3);
    ps.forEach((x,i)=>{setText(`project${i+1}Title`,x.title);setText(`project${i+1}Desc`,x.description)});

    const pics=photoListFromCloud(data.photos);
    const hero=[...document.querySelectorAll('.profile-photo')];
    const cards=[...document.querySelectorAll('.photo-card img')];
    pics.slice(0,3).forEach((u,i)=>{
      if(hero[i]) hero[i].src=u;
      if(cards[i]) cards[i].src=u;
    });
  }

  const loader=$('loader');
  window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('hide'),500));
  const cursor=document.querySelector('.cursor-glow');
  window.addEventListener('pointermove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}});
  const p=$('particles');
  if(p) for(let i=0;i<55;i++){const d=document.createElement('i');d.className='particle';d.style.left=Math.random()*100+'%';d.style.animationDuration=(8+Math.random()*15)+'s';d.style.animationDelay=(-Math.random()*15)+'s';d.style.opacity=(.1+Math.random()*.45);p.appendChild(d)}
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.14});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const menuBtn=$('menuBtn'),navLinks=$('navLinks');
  if(menuBtn){menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')))}

  const modal=$('helpModal'),openHelp=$('openHelp');
  const closeHelp=()=>modal?.classList.remove('open');
  openHelp?.addEventListener('click',()=>modal.classList.add('open'));
  $('closeHelp')?.addEventListener('click',closeHelp);
  $('closeHelpBtn')?.addEventListener('click',closeHelp);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp()});

  function startPhotoSlider(){
    const profilePhotos=[...document.querySelectorAll('.profile-photo')];
    if(profilePhotos.length<2) return;
    let photoIndex=0;
    setInterval(()=>{
      profilePhotos[photoIndex].classList.remove('active');
      photoIndex=(photoIndex+1)%profilePhotos.length;
      profilePhotos[photoIndex].classList.add('active');
    },4200);
  }

  async function init(){
    try {
      const data=await loadCloudData();
      render(data);
      startPhotoSlider();
    } catch(err) {
      console.warn('Cloud load failed; using local defaults.', err);
      render({settings:FALLBACK,projects:PROJECTS,photos:[]});
      startPhotoSlider();
    }
  }
  init();

  const helpForm=$('helpForm');
  helpForm?.addEventListener('submit', async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(helpForm));
    if(client){
      const {error}=await client.from('help_requests').insert({name:data.name,email:data.email||'',category:data.category||'General',problem:data.problem||'',status:'new'});
      if(error){alert('Could not send request. Please try again.');return;}
    }
    helpForm.style.display='none';
    const intro=document.querySelector('.modal-intro');
    if(intro) intro.style.display='none';
    $('helpSuccess')?.classList.add('show');
    setTimeout(()=>{
      helpForm.reset();
      helpForm.style.display='grid';
      if(intro) intro.style.display='block';
      $('helpSuccess')?.classList.remove('show');
      closeHelp();
    },2600);
  });

  const contactForm=$('contactForm');
  contactForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(contactForm));
    if(client){
      const {error}=await client.from('help_requests').insert({name:data.name||'Contact Visitor',email:data.email||'',category:'Contact',problem:data.message||'',status:'new'});
      if(error){alert('Could not send message. Please try again.');return;}
    }
    alert('Message sent! Thanks for contacting Ayush.');
    contactForm.reset();
  });
})();
