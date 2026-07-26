/* ═══════════════════════════════════════
   APP.JS — Straw Hat Agent v2
   Clean version with dynamic features
═══════════════════════════════════════ */

// ── BACKEND CONFIG ───────────────────────────────────────────────
const API     = 'http://127.0.0.1:8000';
const STORAGE = sessionStorage;

// ── CREW DATA ────────────────────────────────────────────────────
const CREW = {
  luffy:   { name:'Luffy',   fullName:'Monkey D. Luffy',   color:'#e83030', emoji:'☠',  domain:'General Chat',     greet:'Shishishi! Ready to sail, praveen?' },
  zoro:    { name:'Zoro',    fullName:'Roronoa Zoro',      color:'#30b860', emoji:'⚔',  domain:'Skills & DSA',     greet:'Nothing happened. Get back to training.' },
  nami:    { name:'Nami',    fullName:'Nami',               color:'#e8a020', emoji:'🗺',  domain:'Career & Finance',  greet:'Let me map out your career route.' },
  usopp:   { name:'Usopp',   fullName:'Usopp',              color:'#c87820', emoji:'🎯',  domain:'Ideas & Projects',  greet:'I, the great Usopp, have a plan!' },
  sanji:   { name:'Sanji',   fullName:'Vinsmoke Sanji',    color:'#6060e8', emoji:'🍳',  domain:'Food & Nutrition',  greet:'A good meal fuels a great mind.' },
  chopper: { name:'Chopper', fullName:'Tony Tony Chopper', color:'#e83070', emoji:'🩺',  domain:'Health & Wellness', greet:'How are you feeling today?' },
  robin:   { name:'Robin',   fullName:'Nico Robin',        color:'#a060e8', emoji:'📚',  domain:'Research & Notes',  greet:'Knowledge is the most powerful weapon.' },
  franky:  { name:'Franky',  fullName:'Franky',             color:'#20a8e8', emoji:'🔧',  domain:'Tech & Automation', greet:'SUPER! What are we building today?' },
  brook:   { name:'Brook',   fullName:'Brook',              color:'#b0b0d8', emoji:'🎵',  domain:'Music & Mood',      greet:'Yohohoho! Music for the soul!' },
  jinbe:   { name:'Jinbe',   fullName:'Jinbe',              color:'#2080c8', emoji:'🌊',  domain:'Schedule & Focus',  greet:'A calm helmsman makes the best voyage.' },
};

// ── FALLBACK REPLIES ─────────────────────────────────────────────
const REPLIES = {
  luffy:   ["Yosh! Let's do it praveen! 🏴‍☠️", "I don't know what that means but WE'LL FIGURE IT OUT!", "We're gonna make it! I promise on my crew!"],
  zoro:    ["Focus. Train harder. Nothing happened.", "A sword only gets sharper with use. Keep going.", "Get it done. No excuses."],
  nami:    ["Here's the financially smart move...", "Let me chart you a route to success.", "Save first. Always save first."],
  usopp:   ["I, the great Usopp, have the PERFECT idea!", "Back in my village I did something even greater...", "Every legend starts with one brave step!"],
  sanji:   ["Leave it to me. Nutrition is everything.", "I'll craft a plan that'll make you cry with joy.", "A great cook plans every meal like a masterpiece."],
  chopper: ["Tell me everything! I'm a great doctor!", "Don't push too hard — your health comes first!", "Rum-bum-bum! I know exactly what you need!"],
  robin:   ["Fascinating. The research suggests...", "History patterns repeat. Let me analyze this.", "I'll find what you need. Knowledge is power."],
  franky:  ["SUPER! On it right now bro!", "I'll build a SUPER solution for that!", "Tech problems are just puzzles. Let's solve it!"],
  brook:   ["Yohohoho! Here's my recommendation!", "Even a skeleton appreciates a good vibe!", "Shall I play you a song?"],
  jinbe:   ["Let's plan this methodically. Calm focus wins.", "Read the current before you sail.", "Your schedule is your chart. Trust it."],
};

// ── KEYWORD ROUTER ───────────────────────────────────────────────
const KEYWORDS = {
  zoro:    ['learn','skill','code','practice','study','train','improve','course','dsa','algorithm','programming','docker','system','backend','frontend'],
  nami:    ['career','job','travel','trip','money','salary','budget','interview','resume','work','finance','save','invest'],
  usopp:   ['idea','project','creative','story','hobby','art','build','brainstorm','design','invent','side project'],
  sanji:   ['food','eat','recipe','cook','meal','breakfast','lunch','dinner','diet','nutrition','hungry','calories','protein'],
  chopper: ['health','sick','pain','tired','sleep','exercise','workout','symptom','doctor','medicine','headache','stress','mental'],
  robin:   ['research','history','notes','journal','book','read','facts','analyse','find','explain','summarise','topic'],
  franky:  ['install','setup','automate','config','script','hardware','tool','error','fix','debug','software','deploy'],
  brook:   ['music','movie','bored','relax','fun','joke','song','entertain','watch','chill','playlist','anime'],
  jinbe:   ['schedule','today','task','focus','pomodoro','plan','priority','time','productive','routine','habit','deadline'],
};

function autoRoute(message) {
  const lower = message.toLowerCase();
  let best = 'luffy', bestScore = 0;
  for (const [char, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = char; }
  }
  return best;
}

// ── STATE ────────────────────────────────────────────────────────
let activeCrew = 'luffy';
let activeTab  = 'dashboard';
let isLoading  = false;
let chatCount  = 0;


const chatHistory = {};
Object.keys(Crew).forEach(key => { chatHistory[key]=[]; });

// ── AUTH CHECK ───────────────────────────────────────────────────
(function checkAuth() {
  const token = STORAGE.getItem('jwt');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  if (token !== 'demo-token') {
    fetch(`${API}/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => console.warn('Backend offline — demo mode'));
  }
})();

// ── LOGOUT ───────────────────────────────────────────────────────
function logout() {
  STORAGE.clear();
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity    = '0';
  setTimeout(() => { window.location.href = 'login.html'; }, 450);
}

/* ── CLOCK ── */
function updateClock() {
  const now  = new Date();
  const time = now.toLocaleTimeString('en-GB');
  const date = now.toLocaleDateString('en-GB', {
    weekday:'short', day:'numeric', month:'short', year:'numeric'
  }).replace(',','');
  const gt = document.getElementById('greeting-time');
  const nd = document.getElementById('nav-date');
  if (gt) gt.textContent = time;
  if (nd) nd.textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

/* ── DYNAMIC GREETING ── */
// Gets a real morning greeting from Luffy via backend
async function loadMorningGreeting() {
  const gs    = document.getElementById('greeting-sub');
  const token = STORAGE.getItem('jwt');
  const hour  = new Date().getHours();

  // Time-based fallback greeting
  let timeGreet = 'Shishishi! Ready to sail, praveen?'
  if (hour < 12) timeGreet = "Shishishi! Good morning praveen! What adventure awaits today?!"
  else if (hour < 17) timeGreet = "Shishishi! Good afternoon praveen! Don't slack off!"
  else timeGreet = "Shishishi! Good evening praveen! Rest up for tomorrow's adventure!"

  // Show fallback immediately
  if (gs) gs.textContent = timeGreet;

  // Try to get a real AI greeting from backend
  if (!token || token === 'demo-token') return;

  try {
    const res = await fetch(`${API}/chat`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message:   'Give me a short one-sentence morning greeting in your character voice. Maximum 15 words.',
        character: 'luffy'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (gs && data.reply) gs.textContent = data.reply;
    }
  } catch (e) {
    console.warn('Greeting fetch failed — using fallback');
  }
}

/* ── STATS — stored in localStorage ── */
// These persist across sessions
function loadStats() {
  const today     = new Date().toDateString();
  const lastVisit = localStorage.getItem('sh_last_visit');
  let   streak    = parseInt(localStorage.getItem('sh_streak') || '0');

  // Update streak
  if (lastVisit !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastVisit === yesterday) streak++; // consecutive day
    else if (!lastVisit) streak = 1;       // first time
    else streak = 1;                       // broke streak
    localStorage.setItem('sh_streak', streak);
    localStorage.setItem('sh_last_visit', today);
  }

  // Reset chat count for today
  const savedDate  = localStorage.getItem('sh_chat_date');
  if (savedDate !== today) {
    localStorage.setItem('sh_chat_count', '0');
    localStorage.setItem('sh_chat_date', today);
  }
  chatCount = parseInt(localStorage.getItem('sh_chat_count') || '0');

  // Update UI
  const sv = document.getElementById('stat-streak');
  const tv = document.getElementById('stat-tasks');
  if (sv) sv.textContent = streak;
  if (tv) tv.textContent = chatCount;
}

function incrementChatCount() {
  chatCount++;
  localStorage.setItem('sh_chat_count', chatCount.toString());
  const tv = document.getElementById('stat-tasks');
  if (tv) tv.textContent = chatCount;
}

/* ── RAG STATUS CHECK ── */
async function checkRagStatus() {
  const token = STORAGE.getItem('jwt');
  if (!token || token === 'demo-token') {
    // Show all as not loaded in demo mode
    ['kb-about','kb-career','kb-skills','kb-schedule','kb-health'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = 'Demo mode'; el.className = 'kb-bd empty'; }
    });
    return;
  }

  try {
    const res = await fetch(`${API}/rag/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const cls  = data.rag_enabled ? 'kb-bd loaded' : 'kb-bd empty';
      const txt  = data.rag_enabled ? 'Loaded'       : 'Empty';
      ['kb-about','kb-career','kb-skills','kb-schedule','kb-health'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = txt; el.className = cls; }
      });
    }
  } catch (e) {
    ['kb-about','kb-career','kb-skills','kb-schedule','kb-health'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = 'Offline'; el.className = 'kb-bd empty'; }
    });
  }
}

/* ── BUILD CREW GRID ── */
function buildCrewGrid(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  Object.entries(CREW).forEach(([key, c]) => {
    const div       = document.createElement('div');
    div.className   = 'crew-member' + (key === activeCrew ? ' active' : '');
    div.id          = 'cm-' + containerId + '-' + key;
    div.onclick     = () => selectCrew(key);
    const isActive  = key === activeCrew;
    div.innerHTML   = `
      <div class="cm-avatar" style="${isActive ? 'border-color:'+c.color+';box-shadow:0 0 14px '+c.color+'40' : ''}">
        ${c.emoji}
      </div>
      <div class="cm-name">${c.name}</div>`;
    el.appendChild(div);
  });
}

/* ── BUILD CHAT STRIP ── */
function buildChatStrip() {
  const strip = document.getElementById('chat-crew-strip');
  if (!strip) return;
  strip.innerHTML = '';
  Object.entries(CREW).forEach(([key, c]) => {
    const pill       = document.createElement('div');
    pill.className   = 'cc-pill' + (key === activeCrew ? ' active' : '');
    pill.id          = 'ccp-' + key;
    pill.style.cssText = key === activeCrew
      ? `background:${c.color}22;border-color:${c.color}60;color:${c.color}`
      : '';
    pill.onclick     = () => selectCrew(key);
    pill.innerHTML   = `<span class="cc-dot" style="background:${c.color}"></span>${c.name}`;
    strip.appendChild(pill);
  });
}

/* ── SELECT CREW ── */
function selectCrew(key) {
  if (key === activeCrew) return;
  activeCrew = key;
  const c = CREW[key];

  // Update greeting bar
  const gav = document.getElementById('greeting-avatar');
  const gt  = document.getElementById('greeting-title');
  const gs  = document.getElementById('greeting-sub');
  if (gav) {
    gav.textContent      = c.emoji;
    gav.style.borderColor= c.color;
    gav.style.boxShadow  = `0 0 12px ${c.color}50`;
  }
  if (gt) gt.textContent  = 'Good morning, Praveen!';
  if (gs) {
    gs.textContent    = c.greet;
    gs.style.color    = c.color;
  }

  // Update accent
  document.documentElement.style.setProperty('--accent', c.color);

  // Update send button
  const sb = document.getElementById('ib-send');
  if (sb) sb.style.background = c.color;

  // Rebuild grids
  buildCrewGrid('crew-grid');
  buildChatStrip();

  // Add greeting message + switch to chat
 
  switchTab('chat');
  renderChatHistory(key);

  // Update character panel
  updateCharPanel(key);
}

/* ── SWITCH VIEW (sidebar) ── */
function switchView(view) {
  document.querySelectorAll('.sb-icon').forEach(b => b.classList.remove('active'));
  document.getElementById('sbi-' + view)?.classList.add('active');
  switchTab(view);
}

/* ── SWITCH TAB ── */
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + tab)?.classList.add('active');
  document.querySelectorAll('.sb-icon').forEach(b => b.classList.remove('active'));
  document.getElementById('sbi-' + tab)?.classList.add('active');
  if (tab === 'chat') {
     buildChatStrip();
     renderChatHistory(activeCrew);
  } 
}

/* ── QUICK ACTION ── */
function quickAction(tab, crewKey) {
  if (crewKey && crewKey !== activeCrew) selectCrew(crewKey);
  switchTab(tab);
}

/* ── CHAT HELPERS ── */
function addCrewMsg(name, text, emoji, color) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  
  chatHistory[activeCrew].push({
     type: 'crew', name,text,emoji,color
  });

  const div       = document.createElement('div');
  div.className   = 'msg crew-msg';
  div.innerHTML   = `
    <div class="msg-av" style="border-color:${color}60">${emoji}</div>
    <div class="msg-body">
      <div class="msg-name" style="color:${color}">${name}</div>
      <div class="bubble">${text}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const c         = CREW[activeCrew];

  //Save to this crew memers history
  chatHistory[activeCrew].push({
    type: 'user',text,color:c.color
  });

  const div       = document.createElement('div');
  div.className   = 'msg user-msg';
  div.innerHTML   = `
    <div class="msg-av" style="border-color:${c.color}40">👤</div>
    <div class="msg-body">
      <div class="msg-name">You</div>
      <div class="bubble">${escHtml(text)}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}


function renderChatHistory(crewKey) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  // Clear current messages
  msgs.innerHTML = '';

  const history = chatHistory[crewKey] || [];

  if (history.length === 0) {
    // No history yet — show greeting
    const c   = CREW[crewKey];
    const div = document.createElement('div');
    div.className = 'msg crew-msg';
    div.innerHTML = `
      <div class="msg-av" style="border-color:${c.color}60">${c.emoji}</div>
      <div class="msg-body">
        <div class="msg-name" style="color:${c.color}">${c.name}</div>
        <div class="bubble">${c.greet}</div>
      </div>`;
    msgs.appendChild(div);
    // Save greeting to history too
    chatHistory[crewKey].push({
      type: 'crew',
      name:  c.name,
      text:  c.greet,
      emoji: c.emoji,
      color: c.color
    });
    return;
  }

  // Render existing history
  history.forEach(msg => {
    const div = document.createElement('div');
    if (msg.type === 'crew') {
      div.className = 'msg crew-msg';
      div.innerHTML = `
        <div class="msg-av" style="border-color:${msg.color}60">${msg.emoji}</div>
        <div class="msg-body">
          <div class="msg-name" style="color:${msg.color}">${msg.name}</div>
          <div class="bubble">${msg.text}</div>
        </div>`;
    } else {
      div.className = 'msg user-msg';
      div.innerHTML = `
        <div class="msg-av" style="border-color:${msg.color}40">👤</div>
        <div class="msg-body">
          <div class="msg-name">You</div>
          <div class="bubble">${escHtml(msg.text)}</div>
        </div>`;
    }
    msgs.appendChild(div);
  });

  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs || document.getElementById('typing')) return;
  const c     = CREW[activeCrew];
  const div   = document.createElement('div');
  div.id      = 'typing';
  div.className = 'msg crew-msg typing-bubble';
  div.innerHTML = `
    <div class="msg-av" style="border-color:${c.color}60">${c.emoji}</div>
    <div class="msg-body">
      <div class="msg-name" style="color:${c.color}">${c.name}</div>
      <div class="bubble">
        <div class="t-dot"></div>
        <div class="t-dot"></div>
        <div class="t-dot"></div>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() { document.getElementById('typing')?.remove(); }

/* ── SEND MESSAGE ── */
async function ibSend() {
  if (isLoading) return;
  const inp = document.getElementById('ib-input');
  const val = inp.value.trim();
  if (!val) return;

  switchTab('chat');
  addUserMsg(val);
  inp.value = '';

  // Auto-route
  const routed = autoRoute(val);
  if (routed !== activeCrew) {
    activeCrew     = routed;
    const c        = CREW[routed];
    document.documentElement.style.setProperty('--accent', c.color);
    const sb       = document.getElementById('ib-send');
    if (sb) sb.style.background = c.color;
    buildCrewGrid('crew-grid');
    buildChatStrip();
    updateCharPanel(routed);
  }

  showTyping();
  isLoading = true;
  incrementChatCount();

  const token = STORAGE.getItem('jwt');
  const c     = CREW[activeCrew];

  try {
    if (!token || token === 'demo-token') {
      await sleep(800 + Math.random() * 600);
      hideTyping();
      isLoading = false;
      const pool = REPLIES[activeCrew];
      addCrewMsg(
        c.name,
        pool[Math.floor(Math.random() * pool.length)] +
          ' <em style="font-size:11px;opacity:0.4">(demo)</em>',
        c.emoji, c.color
      );
      return;
    }

    // Real backend call
    const res = await fetch(`${API}/chat`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: val, character: activeCrew })
    });

    hideTyping();
    isLoading = false;

    if (res.ok) {
      const data   = await res.json();
      const charId = data.character || activeCrew;

      // Backend may reroute to different crew member
      if (charId !== activeCrew) {
        activeCrew   = charId;
        const newC   = CREW[charId];
        document.documentElement.style.setProperty('--accent', newC.color);
        const sb     = document.getElementById('ib-send');
        if (sb) sb.style.background = newC.color;
        buildCrewGrid('crew-grid');
        buildChatStrip();
        updateCharPanel(charId);
        addCrewMsg(newC.name, data.reply, newC.emoji, newC.color);
      } else {
        addCrewMsg(c.name, data.reply, c.emoji, c.color);
      }

    } else if (res.status === 401) {
      addCrewMsg('System', '⚠ Session expired — redirecting...', '⚠', '#e83030');
      setTimeout(() => { STORAGE.clear(); window.location.href = 'login.html'; }, 2000);
    } else {
      const err = await res.json().catch(() => ({}));
      addCrewMsg(c.name, `Something went wrong... ${err.detail || ''}`, c.emoji, c.color);
    }

  } catch (err) {
    console.error('Chat error:', err);
    hideTyping();
    isLoading = false;
    const pool = REPLIES[activeCrew];
    addCrewMsg(
      c.name,
      pool[Math.floor(Math.random() * pool.length)] +
        ' <em style="font-size:11px;opacity:0.4">(offline)</em>',
      c.emoji, c.color
    );
  }
}

/* ── INPUT HANDLERS ── */
function ibKey(e) { if (e.key === 'Enter' && !e.shiftKey) ibSend(); }

/* ── MIC INPUT ── */
function ibMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Voice input not supported'); return; }

  const mic = document.querySelector('.ib-mic');
  if (mic) mic.textContent = '🔴';

  const recog           = new SR();
  recog.continuous      = false;
  recog.interimResults  = false;
  recog.lang            = 'en-US';

  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    const inp  = document.getElementById('ib-input');
    if (inp) { inp.value = text; ibSend(); }
    if (mic) mic.textContent = '🎤';
  };
  recog.onerror = () => { if (mic) mic.textContent = '🎤'; };
  recog.onend   = () => { if (mic) mic.textContent = '🎤'; };

  // Request mic permission first
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => recog.start())
    .catch(() => {
      if (mic) mic.textContent = '🎤';
      alert('Microphone permission denied');
    });
}

/* ── UPDATE CHARACTER PANEL ── */
function updateCharPanel(key) {
  const c       = CREW[key];
  const wrap    = document.getElementById('ccf-img');
  const glow    = document.getElementById('ccf-glow');
  const nameEl  = document.getElementById('ccf-name');
  const emojiEl = document.getElementById('ccf-emoji');
  if (!wrap) return;

  if (nameEl) {
    nameEl.textContent      = c.name.toUpperCase();
    nameEl.style.color      = c.color;
    nameEl.style.textShadow = `0 0 10px ${c.color}`;
  }
  if (glow) {
    glow.style.background = `radial-gradient(ellipse at 50% 100%, ${c.color} -20%, transparent 65%)`;
  }
  document.documentElement.style.setProperty('--accent', c.color);

  // Try loading PNG
  const imgPath = `../assets/${key}.png`;
  let img       = wrap.querySelector('img');
  if (!img) { img = document.createElement('img'); wrap.appendChild(img); }

  img.style.opacity = '0';
  img.alt           = c.name;

  img.onload = () => {
    if (emojiEl) emojiEl.style.opacity = '0';
    img.style.opacity = '1';
    img.classList.remove('walkin');
    void img.offsetWidth;
    img.classList.add('walkin');
  };

  img.onerror = () => {
    img.style.display = 'none';
    if (emojiEl) { emojiEl.style.opacity = '1'; emojiEl.textContent = c.emoji; }
  };

  img.style.display = 'block';
  img.src           = imgPath;
  if (emojiEl) emojiEl.textContent = c.emoji;
}

/* ── UTILS ── */
function sleep(ms)    { return new Promise(r => setTimeout(r, ms)); }
function escHtml(str) {
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── INIT ── */
(function init() {
  // Build crew grid
  buildCrewGrid('crew-grid');
  buildChatStrip();

  // Set send button color
  const sb = document.getElementById('ib-send');
  if (sb) sb.style.background = CREW[activeCrew].color;

  // Init character panel
  updateCharPanel(activeCrew);

  // Load stats from localStorage
  loadStats();

  // Dynamic morning greeting from backend
  loadMorningGreeting();

  // Check RAG status
  checkRagStatus();

  // Initial greeting message in chat
  setTimeout(() => {
    renderChatHistory(activeCrew);
  }, 300);
})();

