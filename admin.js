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
  const PIN = 'AYUSHOP2026';
  if(sessionStorage.getItem('ayushAdminAuth')!=='1'){
    const entered=prompt('AYUSH OP ADMIN PANEL\nEnter admin password:');
    if(entered!==PIN){document.body.innerHTML='<div style="min-height:100vh;display:grid;place-items:center;background:#080808;color:white;font-family:Arial"><div style="text-align:center"><h1>ACCESS DENIED</h1><p>Open /admin.html and enter the correct password.</p></div></div>'; return;}
    sessionStorage.setItem('ayushAdminAuth','1');
  }
})();
