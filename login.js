/* ═══════════════════════════════════════════════
   LOGIN.JS — Straw Hat Agent v2
   All 5 changes implemented:
   1. WB image lower (CSS handles this)
   2. Ship restored to full Moby Dick detail
   3. Whitebeard dialogue typewriter on load
   4. Voice + text password both work
   5. Password = "The one piece is real"
═══════════════════════════════════════════════ */

// ── CONFIG ───────────────────────────────────────────────────────
const API      = 'http://127.0.0.1:8000';
const STORAGE  = sessionStorage;
// Change 5: phrase password (also set in backend .env)
const PASSWORD = 'the one piece is real';

// ── CANVAS SETUP ─────────────────────────────────────────────────
const canvas = document.getElementById('storm-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  initClouds();
}
window.addEventListener('resize', resize);

/* ════════════════════════════════════════
   CHANGE 3: WHITEBEARD DIALOGUE
   Typewriter effect before login UI appears
════════════════════════════════════════ */
const WB_DIALOGUE = `The man that called Dee Roger was not waiting for you... not you Teach... not a damn chance... uh-huh.

Just as there are people out there who inherited Roger's will, soon enough someone will carry on in Ace's name as well. You may try to destroy their spirit, but you will never extinguish their flame.

So it has been and so it shall continue to be, from now till the very end of time.

And one day in the future, when we are all dead and gone, someone will arise carrying generations upon generations of our history on his shoulders... then he'll throw down the gauntlet in front of the entire world.

Sengoku, you and the government know what's coming — a war that will embroil the seas far and wide. That's why you are so afraid... though nothing you do will stop it.

I have no interest in living forever myself... but someday that treasure will turn this world upside down.

You know what I'm talking about. And I am sure that someone will find it — whether you like it or not, that day will come soon.`;

let dialogueDone  = false;
let typewriterInt = null;

function startDialogue() {
  const overlay  = document.getElementById('dialogue-overlay');
  const textEl   = document.getElementById('dialogue-text');
  if (!overlay || !textEl) { showLoginUI(); return; }

  let i = 0;
  const chars = WB_DIALOGUE.split('');

  typewriterInt = setInterval(() => {
    if (i < chars.length) {
      // Replace newlines with HTML breaks
      if (chars[i] === '\n') {
        textEl.innerHTML += '<br>';
      } else {
        textEl.innerHTML += chars[i];
      }
      i++;
      // Scroll dialogue text as it grows
      textEl.scrollTop = textEl.scrollHeight;
    } else {
      // Dialogue finished
      clearInterval(typewriterInt);
      textEl.classList.add('done');
      dialogueDone = true;
      // Wait 1.5s then show login UI
      setTimeout(finishDialogue, 1500);
    }
  }, 28); // 28ms per character — feels like speech pace

  // Trigger lightning for drama during dialogue
  setTimeout(spawnLightning, 800);
  setTimeout(spawnLightning, 4000);
  setTimeout(spawnLightning, 9000);
  setTimeout(spawnLightning, 15000);
}

function skipDialogue() {
  if (typewriterInt) clearInterval(typewriterInt);
  const textEl = document.getElementById('dialogue-text');
  if (textEl) {
    // Show full text instantly
    textEl.innerHTML = WB_DIALOGUE
      .replace(/\n/g, '<br>')
    textEl.classList.add('done');
  }
  dialogueDone = true;
  setTimeout(finishDialogue, 600);
}

function finishDialogue() {
  const overlay = document.getElementById('dialogue-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    setTimeout(() => { overlay.style.display = 'none'; }, 900);
  }
  showLoginUI();
  spawnLightning();
}

function showLoginUI() {
  const ui = document.getElementById('login-ui');
  if (ui) {
    ui.style.opacity       = '1';
    ui.style.pointerEvents = 'all';
  }
}

/* ════════════════════════════════════════
   CLOUDS
════════════════════════════════════════ */
let clouds = [];

function initClouds() {
  clouds = [];
  for (let i = 0; i < 14; i++) {
    clouds.push({
      x:     Math.random() * W * 1.4 - W * 0.2,
      y:     Math.random() * H * 0.45 - 20,
      r:     Math.random() * 140 + 80,
      speed: Math.random() * 0.18 + 0.06,
      alpha: Math.random() * 0.55 + 0.3,
      dark:  Math.random() > 0.4,
    });
  }
}

function drawClouds() {
  clouds.forEach(c => {
    const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    grad.addColorStop(0,   c.dark ? `rgba(12,16,36,${c.alpha})` : `rgba(24,32,70,${c.alpha * 0.5})`);
    grad.addColorStop(0.5, c.dark ? `rgba(8,12,26,${c.alpha * 0.8})` : `rgba(16,24,52,${c.alpha * 0.3})`);
    grad.addColorStop(1,   'rgba(4,6,14,0)');
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.r * 1.6, c.r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    for (let j = 0; j < 4; j++) {
      const bx = c.x + (j - 1.5) * c.r * 0.55;
      const by = c.y - c.r * 0.3;
      const br = c.r * (0.35 + Math.random() * 0.15);
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bg.addColorStop(0, c.dark ? `rgba(10,14,32,${c.alpha * 0.9})` : `rgba(20,28,60,${c.alpha * 0.4})`);
      bg.addColorStop(1, 'rgba(4,6,14,0)');
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.fill();
    }
    c.x += c.speed;
    if (c.x - c.r * 1.6 > W + 100) c.x = -c.r * 1.6 - 50;
  });
}

/* ════════════════════════════════════════
   RAIN
════════════════════════════════════════ */
const RAIN_COUNT = 420;
const drops = [];

function initRain() {
  for (let i = 0; i < RAIN_COUNT; i++) drops.push(newDrop(true));
}

function newDrop(scatter) {
  return {
    x:     scatter ? Math.random() * (W + 200) - 100 : Math.random() * W,
    y:     scatter ? Math.random() * H : -10,
    len:   Math.random() * 28 + 14,
    speed: Math.random() * 9 + 14,
    alpha: Math.random() * 0.45 + 0.25,
    width: Math.random() * 0.8 + 0.4,
  };
}

function drawRain() {
  ctx.save();
  const angleRad = (75 * Math.PI) / 180;
  const dx = Math.cos(angleRad), dy = Math.sin(angleRad);
  drops.forEach(d => {
    const x2 = d.x - d.len * dx, y2 = d.y - d.len * dy;
    const grad = ctx.createLinearGradient(x2, y2, d.x, d.y);
    grad.addColorStop(0, `rgba(160,200,255,0)`);
    grad.addColorStop(1, `rgba(180,215,255,${d.alpha})`);
    ctx.strokeStyle = grad; ctx.lineWidth = d.width;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(d.x, d.y); ctx.stroke();
    if (d.y > H * 0.75) {
      ctx.fillStyle = `rgba(160,200,255,${d.alpha * 0.3})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.width + 0.5, 0, Math.PI * 2); ctx.fill();
    }
    d.x += d.speed * dx; d.y += d.speed * dy;
    if (d.y > H + 30 || d.x > W + 80) {
      Object.assign(d, newDrop(false)); d.x = Math.random() * W - 100; d.y = -20;
    }
  });
  ctx.restore();
}

/* ════════════════════════════════════════
   WAVES
════════════════════════════════════════ */
let waveTime = 0;

function drawWaves() {
  const baseY = H * 0.72; waveTime += 0.012;
  drawWaveLayer(baseY + 8,  0.018, 0.6,  26, 9,  '#030a14', 0.95, waveTime * 0.6);
  drawWaveLayer(baseY + 2,  0.022, 0.65, 22, 11, '#04101e', 1.0,  waveTime * 0.75);
  drawWaveLayer(baseY - 8,  0.027, 0.7,  18, 13, '#061828', 1.0,  waveTime);
  drawWaveLayer(baseY - 18, 0.032, 0.75, 15, 15, '#0a2038', 1.0,  waveTime * 1.2);
  drawFoam(baseY - 18, 0.032, 0.75, 15, waveTime * 1.2);
  ctx.fillStyle = '#030a14';
  ctx.fillRect(0, baseY + 30, W, H - baseY - 30);
}

function drawWaveLayer(baseY, freq, amp, roughness, speed, color, alpha, t) {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) {
    const y = baseY
      + Math.sin(x * freq + t * speed)             * amp * H * 0.018
      + Math.sin(x * freq * 2.3 + t * speed * 1.4) * amp * H * 0.008
      + Math.sin(x * roughness * 0.5 + t * 2)      * amp * H * 0.004;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1;
}

function drawFoam(baseY, freq, amp, speed, t) {
  ctx.save(); ctx.globalAlpha = 0.18;
  for (let x = 0; x < W; x += 6) {
    const y = baseY
      + Math.sin(x * freq + t * speed)             * amp * H * 0.018
      + Math.sin(x * freq * 2.3 + t * speed * 1.4) * amp * H * 0.008;
    const cb = Math.sin(x * freq + t * speed);
    if (cb > 0.5) {
      ctx.fillStyle = `rgba(200,230,255,${(cb - 0.5) * 0.5})`;
      ctx.beginPath(); ctx.ellipse(x, y, 3 + cb * 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/* ════════════════════════════════════════
   CHANGE 2: MOBY DICK SHIP — Fully detailed
   Restored the full galleon with masts,
   sails, rigging, flags and lanterns
════════════════════════════════════════ */
let shipPhase = 0;

function drawShip() {
  shipPhase += 0.007;
  const waterY = H * 0.74;
  const cx     = W * 0.52;
  const scale  = Math.min(W / 1400, H / 820, 1);
  const bob    = Math.sin(shipPhase) * 5 + Math.sin(shipPhase * 1.6) * 2.5;
  const tilt   = Math.sin(shipPhase * 0.75) * 1.4;

  ctx.save();
  ctx.translate(cx, waterY + bob);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.scale(scale, scale);

  // ── HULL ─────────────────────────────────────────────────────
  const hullGrad = ctx.createLinearGradient(-480, -80, 480, 180);
  hullGrad.addColorStop(0,   '#1a0e06');
  hullGrad.addColorStop(0.3, '#120a04');
  hullGrad.addColorStop(0.7, '#0e0804');
  hullGrad.addColorStop(1,   '#080502');

  ctx.beginPath();
  ctx.moveTo(-480, -110);
  ctx.lineTo(-460, -150); ctx.lineTo(-420, -160); ctx.lineTo(-380, -148);
  ctx.lineTo(-300, -95);  ctx.lineTo( 180, -95);
  ctx.lineTo( 360, -105); ctx.lineTo( 440, -120); ctx.lineTo( 480, -95);
  ctx.quadraticCurveTo( 520,  20,  440, 120);
  ctx.quadraticCurveTo( 400, 175,  320, 190);
  ctx.lineTo(-320, 190);
  ctx.quadraticCurveTo(-420, 180, -500,  90);
  ctx.quadraticCurveTo(-520,  10, -480, -110);
  ctx.closePath();
  ctx.fillStyle = hullGrad; ctx.fill();
  ctx.strokeStyle = '#2a1508'; ctx.lineWidth = 3; ctx.stroke();

  // Hull plank lines
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(40,20,8,0.55)'; ctx.lineWidth = 1.5;
  [-60,-20,20,60,100,140].forEach(py => {
    ctx.beginPath(); ctx.moveTo(-510, py);
    ctx.bezierCurveTo(-300, py+8, 200, py-6, 510, py); ctx.stroke();
  });
  ctx.restore();

  // Red stripe
  ctx.beginPath(); ctx.moveTo(-505, 55); ctx.bezierCurveTo(-300,62,200,48,510,55);
  ctx.strokeStyle = '#8b1010'; ctx.lineWidth = 6; ctx.stroke();

  // Gold trim
  ctx.beginPath(); ctx.moveTo(-482,-95); ctx.lineTo(482,-95);
  ctx.strokeStyle = '#c89010'; ctx.lineWidth = 2; ctx.stroke();

  // Cannon ports
  [-380,-260,-140,-20,100,220,340].forEach(px => {
    ctx.fillStyle='#06030a'; ctx.strokeStyle='#7a5808'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(px-13,-68,26,20); ctx.fill(); ctx.stroke();
  });

  // ── STERN CASTLE ─────────────────────────────────────────────
  const sternGrad = ctx.createLinearGradient(-510,-200,-350,-80);
  sternGrad.addColorStop(0,'#1c0f07'); sternGrad.addColorStop(1,'#100805');
  ctx.beginPath();
  ctx.moveTo(-480,-110); ctx.lineTo(-460,-150); ctx.lineTo(-420,-160);
  ctx.lineTo(-380,-148); ctx.lineTo(-360,-110); ctx.lineTo(-360,-95);
  ctx.lineTo(-480,-95); ctx.closePath();
  ctx.fillStyle=sternGrad; ctx.fill();
  ctx.strokeStyle='#2a1508'; ctx.lineWidth=2; ctx.stroke();

  // Stern windows
  [[-450,-130],[-420,-135],[-390,-130]].forEach(([wx,wy]) => {
    ctx.beginPath(); ctx.arc(wx,wy+10,12,Math.PI,0);
    ctx.lineTo(wx+12,wy+22); ctx.lineTo(wx-12,wy+22); ctx.closePath();
    ctx.fillStyle='rgba(200,120,10,0.22)'; ctx.fill();
    ctx.strokeStyle='#7a5808'; ctx.lineWidth=1.5; ctx.stroke();
    const wg=ctx.createRadialGradient(wx,wy+12,0,wx,wy+12,12);
    wg.addColorStop(0,'rgba(220,140,20,0.3)'); wg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(wx,wy+12,12,0,Math.PI*2);
    ctx.fillStyle=wg; ctx.fill();
  });

  // Stern railing finials
  ctx.strokeStyle='#8a6008'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(-480,-155); ctx.lineTo(-360,-155); ctx.stroke();
  for (let fx=-475; fx<=-365; fx+=18) {
    ctx.beginPath(); ctx.moveTo(fx,-155); ctx.lineTo(fx,-168);
    ctx.strokeStyle='#8a6008'; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(fx,-170,3,0,Math.PI*2);
    ctx.fillStyle='#c89010'; ctx.fill();
  }

  // ── BOWSPRIT ─────────────────────────────────────────────────
  ctx.strokeStyle='#2a1208'; ctx.lineWidth=7;
  ctx.beginPath(); ctx.moveTo(440,-115); ctx.lineTo(640,-260); ctx.stroke();

  // ── DECK ─────────────────────────────────────────────────────
  const deckGrad=ctx.createLinearGradient(0,-95,0,-60);
  deckGrad.addColorStop(0,'#1e1006'); deckGrad.addColorStop(1,'#160c05');
  ctx.beginPath(); ctx.moveTo(-480,-95); ctx.lineTo(480,-95);
  ctx.lineTo(440,-60); ctx.lineTo(-440,-60); ctx.closePath();
  ctx.fillStyle=deckGrad; ctx.fill();

  // Deck railing
  ctx.strokeStyle='#3a1e08'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(-480,-98); ctx.lineTo(480,-98); ctx.stroke();
  for (let rx=-470; rx<480; rx+=20) {
    ctx.beginPath(); ctx.moveTo(rx,-98); ctx.lineTo(rx,-118);
    ctx.strokeStyle='#4a2810'; ctx.lineWidth=2; ctx.stroke();
  }

  // Helm wheel
  ctx.save(); ctx.translate(200,-82);
  ctx.beginPath(); ctx.arc(0,0,18,0,Math.PI*2);
  ctx.strokeStyle='#c89010'; ctx.lineWidth=4; ctx.stroke();
  for (let sp=0; sp<8; sp++) {
    const ang=sp*Math.PI/4;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(ang)*18,Math.sin(ang)*18);
    ctx.strokeStyle='#8a5a18'; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2);
  ctx.fillStyle='#c89010'; ctx.fill();
  ctx.restore();

  // ── MASTS ────────────────────────────────────────────────────
  const MAST = [
    { x:-380, base:-118, top:-620, w:10 },
    { x: -60, base:-118, top:-760, w:13 },
    { x: 260, base:-118, top:-600, w:10 },
  ];

  MAST.forEach(m => {
    ctx.beginPath();
    ctx.moveTo(m.x-m.w*0.5,m.base); ctx.lineTo(m.x-m.w*0.3,m.top);
    ctx.lineTo(m.x+m.w*0.3,m.top);  ctx.lineTo(m.x+m.w,m.base);
    ctx.closePath(); ctx.fillStyle='#0e0804'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(m.x-m.w*0.5,m.base); ctx.lineTo(m.x-m.w*0.3,m.top);
    ctx.lineTo(m.x,m.top); ctx.lineTo(m.x+m.w*0.1,m.base);
    ctx.closePath(); ctx.fillStyle='#2a1808'; ctx.fill();
    // Mast rings
    ctx.strokeStyle='#5a3a10'; ctx.lineWidth=2;
    for (let rp=0.15; rp<0.95; rp+=0.2) {
      const ry=m.top+(m.base-m.top)*rp, rw=m.w*(0.5+rp*0.5);
      ctx.beginPath(); ctx.moveTo(m.x-rw,ry); ctx.lineTo(m.x+rw,ry); ctx.stroke();
    }
  });

  // ── SPARS ────────────────────────────────────────────────────
  const SPARS=[
    [0,80,160],[0,220,130],[0,340,100],
    [1,80,240],[1,210,200],[1,360,160],[1,500,120],
    [2,80,180],[2,220,145],[2,350,110],
  ];
  SPARS.forEach(([mi,yOff,hw2])=>{
    const m=MAST[mi], sy=m.top+yOff, sx=m.x;
    ctx.beginPath(); ctx.moveTo(sx-hw2,sy); ctx.lineTo(sx+hw2,sy);
    ctx.strokeStyle='#1e1006'; ctx.lineWidth=7; ctx.stroke();
    ctx.strokeStyle='#2e1a08'; ctx.lineWidth=4; ctx.stroke();
    [-hw2,hw2].forEach(ex=>{
      ctx.beginPath(); ctx.arc(sx+ex,sy,5,0,Math.PI*2);
      ctx.fillStyle='#4a2808'; ctx.fill();
    });
  });

  // ── SAILS ────────────────────────────────────────────────────
  const windStr=Math.sin(shipPhase*0.4)*0.2+0.6;

  function drawSail(mx,topY,botY,halfW,wind,torn) {
    const midY=(topY+botY)/2, bulge=wind*halfW*0.35;
    ctx.beginPath();
    ctx.moveTo(mx-halfW,topY);
    ctx.quadraticCurveTo(mx+bulge*0.3,midY-(botY-topY)*0.1,mx-halfW*0.9,botY);
    ctx.lineTo(mx+halfW*0.9,botY);
    ctx.quadraticCurveTo(mx+halfW+bulge,midY,mx+halfW,topY);
    ctx.closePath();
    const sg=ctx.createLinearGradient(mx-halfW,topY,mx+halfW,botY);
    sg.addColorStop(0,'rgba(12,8,20,0.88)');
    sg.addColorStop(0.4,'rgba(16,10,28,0.82)');
    sg.addColorStop(1,'rgba(8,5,14,0.90)');
    ctx.fillStyle=sg; ctx.fill();
    ctx.strokeStyle='rgba(50,30,10,0.9)'; ctx.lineWidth=2; ctx.stroke();
    // Seams
    ctx.strokeStyle='rgba(30,18,8,0.6)'; ctx.lineWidth=1;
    for(let p=1;p<4;p++){
      const py=topY+(botY-topY)*(p/4);
      ctx.beginPath(); ctx.moveTo(mx-halfW*0.9,py);
      ctx.quadraticCurveTo(mx+bulge*0.5,py,mx+halfW*0.9,py); ctx.stroke();
    }
    if(torn){
      ctx.strokeStyle='rgba(20,12,6,0.7)'; ctx.lineWidth=1.5;
      for(let tx=mx-halfW*0.85;tx<mx+halfW*0.85;tx+=30){
        const tl=8+Math.sin(tx*0.3+shipPhase*2)*6;
        ctx.beginPath(); ctx.moveTo(tx,botY-2); ctx.lineTo(tx+8,botY+tl); ctx.stroke();
      }
    }
  }

  // Mizzen sails
  drawSail(MAST[0].x,MAST[0].top+82, MAST[0].top+215,155,windStr,false);
  drawSail(MAST[0].x,MAST[0].top+225,MAST[0].top+338,125,windStr,true);
  drawSail(MAST[0].x,MAST[0].top+348,MAST[0].top+440,95, windStr*0.8,true);
  // Main sails
  drawSail(MAST[1].x,MAST[1].top+82, MAST[1].top+204,235,windStr,false);
  drawSail(MAST[1].x,MAST[1].top+215,MAST[1].top+355,195,windStr,false);
  drawSail(MAST[1].x,MAST[1].top+365,MAST[1].top+496,155,windStr,true);
  drawSail(MAST[1].x,MAST[1].top+506,MAST[1].top+590,115,windStr*0.7,true);
  // Fore sails
  drawSail(MAST[2].x,MAST[2].top+82, MAST[2].top+215,175,windStr,false);
  drawSail(MAST[2].x,MAST[2].top+225,MAST[2].top+345,140,windStr,true);
  drawSail(MAST[2].x,MAST[2].top+355,MAST[2].top+448,105,windStr*0.7,true);

  // Bowsprit sail
  ctx.beginPath(); ctx.moveTo(440,-118); ctx.lineTo(635,-258); ctx.lineTo(440,-60); ctx.closePath();
  const bsg=ctx.createLinearGradient(440,-180,630,-250);
  bsg.addColorStop(0,'rgba(14,9,22,0.75)'); bsg.addColorStop(1,'rgba(8,5,14,0.6)');
  ctx.fillStyle=bsg; ctx.fill();

  // ── RIGGING ───────────────────────────────────────────────────
  ctx.strokeStyle='rgba(20,12,4,0.75)'; ctx.lineWidth=1.2;
  [
    [MAST[1].x,MAST[1].top,480,-118],
    [MAST[1].x,MAST[1].top,-480,-118],
    [MAST[0].x,MAST[0].top,-480,-118],
    [MAST[2].x,MAST[2].top,480,-118],
    [MAST[2].x,MAST[2].top,640,-258],
    [MAST[1].x,MAST[1].top+80,-480,-118],
    [MAST[1].x,MAST[1].top+80,480,-118],
    [MAST[0].x,MAST[0].top+80,MAST[1].x,MAST[1].top+80],
    [MAST[1].x,MAST[1].top+80,MAST[2].x,MAST[2].top+80],
  ].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  // ── FLAGS — Whitebeard Jolly Roger ───────────────────────────
  function drawWBFlag(fx,fy,size){
    const fw=size*1.8,fh=size*1.1;
    const wave=Math.sin(shipPhase*2.5)*size*0.18;
    ctx.save(); ctx.translate(fx,fy);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(fw*0.3,wave,fw*0.7,-wave*0.5,fw,wave*0.5);
    ctx.bezierCurveTo(fw*0.7,fh+wave,fw*0.3,fh-wave,0,fh);
    ctx.closePath(); ctx.fillStyle='#0a0a0a'; ctx.fill();
    // Skull
    const skx=fw*0.5,sky=fh*0.35,sr=size*0.26;
    ctx.beginPath(); ctx.arc(skx,sky,sr,Math.PI*0.15,Math.PI*0.85,false);
    ctx.quadraticCurveTo(skx,sky+sr*1.3,skx-sr*0.55,sky+sr*0.5);
    ctx.arc(skx,sky,sr,Math.PI*0.85,Math.PI*0.15,true);
    ctx.quadraticCurveTo(skx,sky+sr*1.3,skx+sr*0.55,sky+sr*0.5);
    ctx.fillStyle='rgba(220,220,220,0.9)'; ctx.fill();
    // Eyes
    ctx.fillStyle='#0a0a0a';
    ctx.beginPath(); ctx.ellipse(skx-sr*0.32,sky-sr*0.05,sr*0.2,sr*0.22,-0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(skx+sr*0.32,sky-sr*0.05,sr*0.2,sr*0.22,0.2,0,Math.PI*2); ctx.fill();
    // Teeth
    for(let t=-2;t<=2;t++) ctx.fillRect(skx+t*sr*0.2-sr*0.06,sky+sr*0.5,sr*0.11,sr*0.2);
    // Crossbones
    ctx.strokeStyle='rgba(210,210,210,0.85)'; ctx.lineWidth=size*0.1; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(skx-sr*0.9,sky+sr*1.4); ctx.lineTo(skx+sr*0.9,sky+sr*2.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(skx+sr*0.9,sky+sr*1.4); ctx.lineTo(skx-sr*0.9,sky+sr*2.4); ctx.stroke();
    [[skx-sr*0.9,sky+sr*1.4],[skx+sr*0.9,sky+sr*2.4],[skx+sr*0.9,sky+sr*1.4],[skx-sr*0.9,sky+sr*2.4]].forEach(([bx,by])=>{
      ctx.beginPath(); ctx.arc(bx,by,size*0.08,0,Math.PI*2);
      ctx.fillStyle='rgba(210,210,210,0.85)'; ctx.fill();
    });
    ctx.lineCap='butt'; ctx.restore();
  }

  drawWBFlag(MAST[1].x+4,MAST[1].top-4,28);
  drawWBFlag(MAST[0].x+3,MAST[0].top-3,18);
  drawWBFlag(MAST[2].x+3,MAST[2].top-3,16);

  // ── LANTERNS ─────────────────────────────────────────────────
  function drawLantern(lx,ly){
    const fl=0.7+Math.sin(shipPhase*7+lx)*0.15;
    const lg=ctx.createRadialGradient(lx,ly,0,lx,ly,40);
    lg.addColorStop(0,`rgba(220,140,20,${0.35*fl})`);
    lg.addColorStop(0.4,`rgba(180,100,10,${0.15*fl})`);
    lg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(lx,ly,40,0,Math.PI*2);
    ctx.fillStyle=lg; ctx.fill();
    ctx.beginPath(); ctx.rect(lx-5,ly-8,10,14);
    ctx.fillStyle=`rgba(200,130,15,${0.5*fl})`; ctx.fill();
    ctx.strokeStyle='#7a5010'; ctx.lineWidth=1; ctx.stroke();
  }

  drawLantern(MAST[1].x,MAST[1].top+60);
  drawLantern(MAST[0].x,MAST[0].top+50);
  drawLantern(MAST[2].x,MAST[2].top+50);
  drawLantern(-455,-148); drawLantern(460,-110);

  // ── PORTHOLES ─────────────────────────────────────────────────
  function drawPorthole(px,py){
    const fl=0.6+Math.sin(shipPhase*5+px*0.01)*0.2;
    const pg=ctx.createRadialGradient(px,py,0,px,py,18);
    pg.addColorStop(0,`rgba(220,140,20,${0.4*fl})`);
    pg.addColorStop(0.5,`rgba(180,100,10,${0.15*fl})`);
    pg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(px,py,18,0,Math.PI*2); ctx.fillStyle=pg; ctx.fill();
    ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2);
    ctx.fillStyle=`rgba(190,120,15,${0.3*fl})`; ctx.fill();
    ctx.strokeStyle='#4a2e08'; ctx.lineWidth=2.5; ctx.stroke();
  }

  [-350,-230,-110,10,130,250,370].forEach(px=>drawPorthole(px,-42));
  [-310,-190,-70,50,170,290].forEach(px=>drawPorthole(px,-2));

  ctx.restore();
}

/* ════════════════════════════════════════
   LIGHTNING
════════════════════════════════════════ */
let lightningBolts=[], nextLightningTime=0, now=0;

function scheduleLightning() { nextLightningTime=now+5000+Math.random()*12000; }

function spawnLightning() {
  const sx=Math.random()*W, sy=Math.random()*H*0.15;
  const ex=sx+(Math.random()-0.5)*200, ey=H*(0.4+Math.random()*0.2);
  lightningBolts.push({ segments:buildBolt(sx,sy,ex,ey,0), born:now, life:120+Math.random()*100 });
  const fl=document.getElementById('lightning-flash');
  if(fl){
    fl.style.opacity='0.18';
    setTimeout(()=>fl.style.opacity='0.08',50);
    setTimeout(()=>fl.style.opacity='0',120);
    setTimeout(()=>{ fl.style.opacity='0.12'; setTimeout(()=>fl.style.opacity='0',60); },160);
  }
  scheduleLightning();
}

function buildBolt(x1,y1,x2,y2,depth){
  const segs=[[x1,y1,x2,y2]];
  if(depth>4) return segs;
  const mx=(x1+x2)/2+(Math.random()-0.5)*(Math.abs(y2-y1)*0.5);
  const my=(y1+y2)/2;
  const l=buildBolt(x1,y1,mx,my,depth+1), r=buildBolt(mx,my,x2,y2,depth+1);
  if(depth<3&&Math.random()>0.55){
    const bx=mx+(Math.random()-0.5)*80, by=my+Math.random()*60+30;
    return [...l,...r,...buildBolt(mx,my,bx,by,depth+2)];
  }
  return [...l,...r];
}

function drawLightning(ts){
  lightningBolts=lightningBolts.filter(bolt=>{
    const age=ts-bolt.born;
    if(age>bolt.life) return false;
    const fade=1-age/bolt.life;
    bolt.segments.forEach(([x1,y1,x2,y2],i)=>{
      const sa=fade*(i===0?1:0.55);
      ctx.save();
      ctx.shadowColor='rgba(180,210,255,0.8)'; ctx.shadowBlur=18;
      ctx.strokeStyle=`rgba(200,225,255,${sa*0.5})`; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.shadowBlur=6;
      ctx.strokeStyle=`rgba(230,245,255,${sa})`; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.restore();
    });
    return true;
  });
}

function drawOceanFog(){
  const fogY=H*0.65;
  const grad=ctx.createLinearGradient(0,fogY-40,0,fogY+60);
  grad.addColorStop(0,'rgba(4,10,22,0)');
  grad.addColorStop(0.5,'rgba(4,10,22,0.35)');
  grad.addColorStop(1,'rgba(3,8,16,0.7)');
  ctx.fillStyle=grad; ctx.fillRect(0,fogY-40,W,100);
}

/* ════════════════════════════════════════
   MAIN LOOP
════════════════════════════════════════ */
function loop(ts){
  now=ts;
  ctx.clearRect(0,0,W,H);
  const sg=ctx.createLinearGradient(0,0,0,H*0.75);
  sg.addColorStop(0,'#020508'); sg.addColorStop(0.3,'#040a14');
  sg.addColorStop(0.65,'#060e1c'); sg.addColorStop(1,'#05111e');
  ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
  drawClouds(); drawRain(); drawLightning(ts);
  drawWaves(); drawShip(); drawOceanFog();
  if(now>=nextLightningTime) spawnLightning();
  requestAnimationFrame(loop);
}

/* ── INIT ── */
resize(); initRain(); scheduleLightning();
setTimeout(spawnLightning,1500);
requestAnimationFrame(loop);
// Start dialogue sequence after short delay
setTimeout(startDialogue, 800);

/* ════════════════════════════════════════
   CHANGE 4+5: AUTH — VOICE + TEXT
   Password = "The one piece is real"
════════════════════════════════════════ */
let micOn      = false;
let micTimer   = null;
let wrongCount = 0;
let recognition= null;

const wrongLines = [
  'GURARARARA...<br>that\'s not it. Try again, <em>son</em>',
  'Hmm...<br>I expected more from you. <em>One more chance.</em>',
  'That\'s wrong.<br>Don\'t make Whitebeard <em>disappointed</em>.',
  'Son...<br>are you sure you belong on <em>this ship?</em>',
];

const speechText = document.getElementById('speech-text');
if(speechText) speechText.style.transition='opacity 0.2s';

function setSpeech(html){
  if(!speechText) return;
  speechText.style.opacity='0';
  setTimeout(()=>{ speechText.innerHTML=html; speechText.style.opacity='1'; },200);
}

/* ── CHANGE 5: Smart password check ── */
function passwordMatches(spoken){
  // Clean spoken input
  let clean = spoken.toLowerCase().trim();
  // Remove punctuation
  '.,!?;:\'"()[]{}' .split('').forEach(ch => clean=clean.replace(new RegExp('\\'+ch,'g'),' '));
  // Remove filler words
  ['um','uh','please','the password is','my password is'].forEach(f => clean=clean.replace(f,' '));
  clean = clean.replace(/\s+/g,' ').trim();

  const pw = PASSWORD.toLowerCase().trim(); // "the one piece is real"

  // Check 1: exact match after cleaning
  if(clean === pw) return true;
  // Check 2: password contained anywhere in what was said
  if(clean.includes(pw)) return true;
  // Check 3: all words of password present
  const pwWords    = pw.split(' ').filter(Boolean);
  const spokenWords= clean.split(' ').filter(Boolean);
  if(pwWords.every(w => spokenWords.includes(w))) return true;
  // Check 4: no-space fuzzy match
  if(clean.replace(/\s/g,'').includes(pw.replace(/\s/g,''))) return true;

  return false;
}

/* ── MIC TOGGLE ── */
function toggleMic(){
  micOn=!micOn;
  const outer=document.getElementById('mic-outer');
  const label=document.getElementById('voice-label');
  const sub  =document.getElementById('voice-sub');
  if(!outer) return;
  if(micOn){
    outer.classList.add('active');
    label.textContent='LISTENING...';
    sub.textContent='speak clearly';
    setSpeech('Speak up...<br>I\'m listening, <em>son</em>');
    startRecognition();
  } else {
    if(recognition){ try{recognition.stop();}catch(e){} recognition=null; }
    stopMic();
    setSpeech('GURARARARA...<br>prove you belong here, <em>son</em>');
  }
}

function startRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    const sub=document.getElementById('voice-sub');
    if(sub) sub.textContent='voice not supported — type below';
    stopMic(); return;
  }

  // Request mic permission first
  navigator.mediaDevices.getUserMedia({audio:true})
    .then(()=>{ beginSpeech(); })
    .catch(err=>{
      console.error('Mic denied:',err);
      const sub=document.getElementById('voice-sub');
      if(sub) sub.textContent='mic blocked — type password below';
      stopMic();
    });
}

function beginSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new SR();
  recognition.continuous    =false;
  recognition.interimResults=true;
  recognition.lang          ='en-US';
  recognition.maxAlternatives=1;

  recognition.onresult=async(e)=>{
    let interim='',final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      const t=e.results[i][0].transcript;
      if(e.results[i].isFinal) final+=t; else interim+=t;
    }
    const heard=final||interim;
    setSpeech(`"${heard}"<br><em>checking...</em>`);
    if(final){
      clearTimeout(micTimer);
      stopMic();
      await checkPassword(final.trim());
    }
  };

  recognition.onerror=(e)=>{
    console.error('Speech error:',e.error);
    clearTimeout(micTimer); stopMic();
    if(e.error==='not-allowed'){
      setSpeech('Mic blocked...<br>type your password below, <em>son</em>');
    } else if(e.error==='no-speech'){
      setSpeech('I heard nothing...<br>speak up or type it, <em>son</em>');
    } else { wrongPassword(); }
  };

  recognition.onend=()=>{ if(micOn) stopMic(); };

  micTimer=setTimeout(()=>{
    try{recognition.stop();}catch(e){}
    stopMic();
    setSpeech('I heard nothing...<br>try again or type it, <em>son</em>');
  },7000);

  try{ recognition.start(); window._recog=recognition; }
  catch(e){ console.error('Recognition start error:',e); stopMic(); }
}

function stopMic(){
  micOn=false; clearTimeout(micTimer);
  if(recognition){try{recognition.stop();}catch(e){} recognition=null;}
  const outer=document.getElementById('mic-outer');
  const label=document.getElementById('voice-label');
  const sub  =document.getElementById('voice-sub');
  if(!outer) return;
  outer.classList.remove('active');
  label.textContent='SPEAK YOUR PASSWORD';
  sub.textContent  ='voice authentication';
}

/* ── TEXT LOGIN (Change 4) ── */
async function textLogin(){
  const inp=document.getElementById('text-password');
  if(!inp) return;
  const val=inp.value.trim();
  if(!val) return;
  inp.value='';
  await checkPassword(val);
}

/* ── CHECK PASSWORD against backend ── */
async function checkPassword(spoken){
  const label=document.getElementById('voice-label');
  const sub  =document.getElementById('voice-sub');
  if(label) label.textContent='VERIFYING...';
  if(sub)   sub.textContent  ='Whitebeard is judging...';
  setSpeech(`"${spoken}"<br><em>verifying...</em>`);

  try{
    const res=await fetch(`${API}/login`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password:spoken})
    });
    const data=await res.json();
    if(res.ok&&data.token){
      STORAGE.setItem('jwt',data.token);
      STORAGE.setItem('crew','ready');
      correctPassword();
    } else {
      wrongPassword();
    }
  } catch(err){
    console.error('Backend error:',err);
    // Fallback local check when backend offline
    if(passwordMatches(spoken)){
      STORAGE.setItem('jwt','demo-token');
      STORAGE.setItem('crew','ready');
      correctPassword();
    } else {
      setSpeech('Ship offline...<br>backend not running, <em>son</em>');
      setTimeout(()=>wrongPassword(),1200);
    }
  }
}

function wrongPassword(){
  stopMic();
  setSpeech(wrongLines[wrongCount%wrongLines.length]);
  wrongCount++;
  const ui=document.querySelector('.login-ui');
  if(ui){ ui.classList.remove('shake'); void ui.offsetWidth; ui.classList.add('shake'); setTimeout(()=>ui.classList.remove('shake'),500); }
  spawnLightning();
  if(label) label.textContent='SPEAK YOUR PASSWORD';
  if(sub)   sub.textContent  ='voice authentication';
}

function correctPassword(){
  stopMic();
  setSpeech('That\'s my <em>son!!</em><br>Welcome aboard!! GURARARARA!!!');
  spawnLightning();
  setTimeout(enterApp,1600);
}

/* ── BOARD SHIP BUTTON ── */
function boardShip(){
  const token=STORAGE.getItem('jwt');
  if(token){ enterApp(); return; }
  STORAGE.setItem('jwt','demo-token');
  STORAGE.setItem('crew','ready');
  correctPassword();
}

/* ── ENTER APP ── */
function enterApp(){
  document.body.style.transition='opacity 0.6s';
  document.body.style.opacity='0';
  setTimeout(()=>{ window.location.href='app.html'; },650);
}
