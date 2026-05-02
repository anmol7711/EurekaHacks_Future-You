/* ═══════════════════════════════════════════
   DECADE CLOCK — script.js
   Ghost Mode · Life Timeline · Particle FX
═══════════════════════════════════════════ */

// ── STATE ────────────────────────────────────
const state = {
  age:      22,
  sleep:    7,
  exercise: 3,
  screen:   5,
  work:     3,
  social:   5,
  learning: 2,
  diet:     5,
  stress:   6,
  ghostMode: false,
};

// Saved snapshot for Ghost comparison
let ghostSnapshot = null;

// ── SLIDER CONFIG ──────────────────────────
const sliderConfig = {
  sleep:    { min: 3,  max: 10, id: 'sl-sleep',    fillId: 'hfill-sleep',    valId: 'hval-sleep',    impactId: 'impact-sleep' },
  exercise: { min: 0,  max: 7,  id: 'sl-exercise',  fillId: 'hfill-exercise', valId: 'hval-exercise', impactId: 'impact-exercise' },
  screen:   { min: 0,  max: 14, id: 'sl-screen',    fillId: 'hfill-screen',   valId: 'hval-screen',   impactId: 'impact-screen' },
  work:     { min: 0,  max: 12, id: 'sl-work',      fillId: 'hfill-work',     valId: 'hval-work',     impactId: 'impact-work' },
  social:   { min: 0,  max: 20, id: 'sl-social',    fillId: 'hfill-social',   valId: 'hval-social',   impactId: 'impact-social' },
  learning: { min: 0,  max: 20, id: 'sl-learning',  fillId: 'hfill-learning', valId: 'hval-learning', impactId: 'impact-learning' },
  diet:     { min: 1,  max: 10, id: 'sl-diet',      fillId: 'hfill-diet',     valId: 'hval-diet',     impactId: 'impact-diet' },
  stress:   { min: 1,  max: 10, id: 'sl-stress',    fillId: 'hfill-stress',   valId: 'hval-stress',   impactId: 'impact-stress' },
};

// ── OPTIMAL HABITS ────────────────────────
const optimalHabits = { sleep: 8, exercise: 5, screen: 2, work: 6, social: 10, learning: 10, diet: 9, stress: 3 };

// ── CLAMP HELPER ──────────────────────────
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const norm  = (v, min, max) => (v - min) / (max - min);

// ── SCORE ENGINE ──────────────────────────
function computeScores(s) {
  const sleepScore    = clamp(norm(s.sleep,    3, 10) * 100);
  const exerciseScore = clamp(norm(s.exercise, 0,  7) * 100);
  const screenPenalty = clamp(norm(s.screen,   0, 14) * 100);
  const workScore     = clamp(norm(s.work,     0, 12) * 100);
  const socialScore   = clamp(norm(s.social,   0, 20) * 100);
  const learningScore = clamp(norm(s.learning, 0, 20) * 100);
  const dietScore     = clamp(norm(s.diet,     1, 10) * 100);
  const stressPenalty = clamp(norm(s.stress,   1, 10) * 100);

  const health     = clamp(sleepScore * 0.3 + exerciseScore * 0.25 + dietScore * 0.2 - screenPenalty * 0.1 - stressPenalty * 0.15);
  const career     = clamp(workScore  * 0.35 + learningScore * 0.3 + sleepScore * 0.15 - stressPenalty * 0.2);
  const happiness  = clamp(socialScore * 0.3 + sleepScore * 0.2 + exerciseScore * 0.2 + dietScore * 0.15 - screenPenalty * 0.1 - stressPenalty * 0.05);
  const longevity  = clamp(sleepScore * 0.25 + exerciseScore * 0.25 + dietScore * 0.2 - stressPenalty * 0.2 - screenPenalty * 0.1);
  const wealth     = clamp(workScore  * 0.4 + learningScore * 0.35 - screenPenalty * 0.15 - stressPenalty * 0.1);
  const burnout    = clamp(stressPenalty * 0.4 + screenPenalty * 0.2 + workScore * 0.2 - sleepScore * 0.2);
  const focus      = clamp(sleepScore * 0.3 + learningScore * 0.25 - screenPenalty * 0.25 - stressPenalty * 0.2);
  const energy     = clamp(sleepScore * 0.35 + exerciseScore * 0.3 + dietScore * 0.2 - stressPenalty * 0.15);

  const trajectory = clamp(Math.round((health + career + happiness + longevity * 0.8 + wealth * 0.8 + focus * 0.7 + energy * 0.9 - burnout * 0.8) / 5.4));

  return { health, career, happiness, longevity, wealth, burnout, focus, energy, trajectory };
}

// ── TRAJECTORY VERDICT ────────────────────
function verdict(score) {
  if (score >= 85) return { text: '🚀 Exceptional trajectory. You\'re building a life others will study.', color: '#39ff82' };
  if (score >= 70) return { text: '✦ Strong path forward. Small refinements unlock elite outcomes.', color: '#f5c518' };
  if (score >= 55) return { text: '⚡ Solid foundation but drift is already setting in. Time to course-correct.', color: '#f5c518' };
  if (score >= 40) return { text: '⚠️ You\'re running on borrowed time. Habits compound — so do their costs.', color: '#ff9f40' };
  return { text: '🔴 Current trajectory leads to a decade of regret. The change starts today.', color: '#ff4d6d' };
}

// ── TIMELINE EVENT GENERATOR ──────────────
function generateTimeline(s, scores) {
  const events = [];
  const startAge = s.age;
  const milestones = [
    startAge,
    Math.max(startAge + 1, 25),
    30, 35, 40, 50, 60
  ].filter((a, i, arr) => arr.indexOf(a) === i && a >= startAge).sort((a, b) => a - b);

  const h = scores.health / 100;
  const c = scores.career / 100;
  const hap = scores.happiness / 100;
  const lon = scores.longevity / 100;
  const w = scores.wealth / 100;
  const b = scores.burnout / 100;
  const f = scores.focus / 100;

  // Current age
  events.push({
    age: startAge,
    type: 'current',
    title: `You — Right Now`,
    desc: `Every habit you track here compounds for the next ${60 - startAge} years. This is Day 1.`,
    badge: null,
    ghostNote: null,
  });

  // Age 25 zone
  if (startAge < 25) {
    const ev25 = c > 0.6
      ? { title: 'First major career breakthrough', desc: `Your ${s.work}h/day of deep work starts paying off. You\'re ahead of 80% of peers.`, badge: 'great', ghostNote: 'Ghost You got here 3 years later.' }
      : { title: 'Drifting in career uncertainty', desc: `Without focused output, opportunities pass to those who showed up. Regret is starting to form.`, badge: 'warn', ghostNote: 'Optimized You already has a clear path by now.' };
    events.push({ age: 25, type: c > 0.6 ? 'milestone' : 'warning', ...ev25 });
  }

  // Age 30
  if (startAge < 30) {
    let title30, desc30, badge30, ghost30, type30;
    if (scores.trajectory >= 70) {
      title30 = 'Life is compounding in your favor'; type30 = 'milestone';
      desc30 = `Fit, focused, financially growing. You sleep ${s.sleep}h, move ${s.exercise}x/week — your body and brain are assets.`;
      badge30 = 'great'; ghost30 = 'Ghost You peaked here and stopped growing.';
    } else if (scores.trajectory >= 45) {
      title30 = 'The gap between you and your potential widens'; type30 = 'neutral';
      desc30 = `You\'re fine. But fine isn\'t fulfilling. ${s.screen}h/day of screens cost you 3 years of skill-building.`;
      badge30 = 'info'; ghost30 = 'Optimized You has already started a business by 30.';
    } else {
      title30 = 'Burnout hits harder than expected'; type30 = 'warning';
      desc30 = `Stress at ${s.stress}/10 and only ${s.sleep}h sleep have silently wrecked your health baseline. Recovery starts now — or later, at higher cost.`;
      badge30 = 'warn'; ghost30 = 'Optimized You never experienced this. Sleep & stress fixed it.';
    }
    events.push({ age: 30, type: type30, title: title30, desc: desc30, badge: badge30, ghostNote: ghost30 });
  }

  // Age 35
  if (startAge < 35) {
    const isWealthy = w > 0.6 && c > 0.55;
    events.push({
      age: 35, type: isWealthy ? 'milestone' : 'neutral',
      title: isWealthy ? 'Financial independence within reach' : 'Money anxiety becomes a background noise',
      desc: isWealthy
        ? `${s.learning}h/week of learning + ${s.work}h of deep work paid off. You\'re building assets, not just income.`
        : `Living paycheck to paycheck because ${14 - s.work}h/day wasn\'t spent on income-building. The cost of low output compounds.`,
      badge: isWealthy ? 'great' : 'warn',
      ghostNote: isWealthy ? 'Ghost You is still catching up to where you are now.' : 'Optimized You made this transition at 30 instead.'
    });
  }

  // Age 40
  if (startAge < 40) {
    const isHealthy = h > 0.65 && lon > 0.6;
    events.push({
      age: 40, type: isHealthy ? 'milestone' : 'warning',
      title: isHealthy ? 'Your 40s feel like others\' 30s' : 'Body sends the first serious invoice',
      desc: isHealthy
        ? `${s.exercise}x/week exercise and ${s.diet}/10 diet quality are showing. You\'re the exception — not the rule.`
        : `Chronic stress (${s.stress}/10) and poor sleep (${s.sleep}h) have shortened your health span by an estimated 6–10 years. It\'s reversible — but costly.`,
      badge: isHealthy ? 'great' : 'warn',
      ghostNote: isHealthy ? 'Ghost You is dealing with early metabolic issues here.' : 'Optimized You reversed this at 35.'
    });
  }

  // Age 50
  if (startAge < 50) {
    const isHappy = hap > 0.6 && scores.social > 55;
    events.push({
      age: 50, type: isHappy ? 'milestone' : 'neutral',
      title: isHappy ? 'Deep relationships are your greatest asset' : 'Loneliness is the silent epidemic',
      desc: isHappy
        ? `${s.social}h/week of genuine connection compounded into a network that money can\'t buy. Career, health, and happiness all benefit.`
        : `Low social investment (${s.social}h/week) has a measurable health cost — equivalent to smoking 15 cigarettes/day, per research.`,
      badge: isHappy ? 'great' : 'info',
      ghostNote: 'Both timelines diverge sharply here based on social investment in your 20s-30s.'
    });
  }

  // Age 60 — always show
  events.push({
    age: 60, type: scores.trajectory >= 65 ? 'milestone' : 'neutral',
    title: scores.trajectory >= 65 ? 'The life you designed, lived' : 'A life of what-ifs',
    desc: scores.trajectory >= 65
      ? `Cognitive sharpness, financial freedom, meaningful relationships. This was built habit by habit, starting decades ago.`
      : `The accumulation of daily drift. Not a disaster — but a quiet disappointment. The version of you that could have been.`,
    badge: scores.trajectory >= 65 ? 'great' : null,
    ghostNote: scores.trajectory >= 65 ? 'Ghost You wishes they\'d started when you did.' : 'Optimized You is here right now. Still time to join them.'
  });

  return events;
}

// ── GHOST COMPARISON DATA ─────────────────
function buildGhostComparison(current, optimal) {
  const cs = computeScores(current);
  const os = computeScores(optimal);

  return [
    { label: 'Health @ 40',     now: Math.round(cs.health),    ghost: Math.round(os.health),    unit: '/100', higherBetter: true },
    { label: 'Career Peak',     now: Math.round(cs.career),    ghost: Math.round(os.career),    unit: '/100', higherBetter: true },
    { label: 'Happiness',       now: Math.round(cs.happiness), ghost: Math.round(os.happiness), unit: '/100', higherBetter: true },
    { label: 'Burnout Risk',    now: Math.round(cs.burnout),   ghost: Math.round(os.burnout),   unit: '/100', higherBetter: false },
    { label: 'Longevity Score', now: Math.round(cs.longevity), ghost: Math.round(os.longevity), unit: '/100', higherBetter: true },
    { label: 'Wealth Trajectory',now: Math.round(cs.wealth),  ghost: Math.round(os.wealth),    unit: '/100', higherBetter: true },
  ];
}

// ── DOM UPDATE ────────────────────────────
let scoreAnimFrame = null;
let displayedScore = 0;

function animateScore(target) {
  if (scoreAnimFrame) cancelAnimationFrame(scoreAnimFrame);
  const start = displayedScore;
  const startTime = performance.now();
  const dur = 800;

  function tick(now) {
    const t = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    displayedScore = Math.round(lerp(start, target, ease));
    document.getElementById('traj-num').textContent = displayedScore;
    document.getElementById('nav-score').textContent = displayedScore + '/100';
    if (t < 1) scoreAnimFrame = requestAnimationFrame(tick);
  }
  scoreAnimFrame = requestAnimationFrame(tick);
}

function updateSliderFills() {
  Object.keys(sliderConfig).forEach(key => {
    const cfg = sliderConfig[key];
    const s   = document.getElementById(cfg.id);
    const f   = document.getElementById(cfg.fillId);
    const v   = document.getElementById(cfg.valId);
    const pct = ((state[key] - cfg.min) / (cfg.max - cfg.min)) * 100;
    f.style.width = pct + '%';
    v.textContent = state[key];
  });
}

function updateImpactHints(scores) {
  const hints = {
    sleep:    { text: scores.health > 60 ? '↑ Boosting health & focus' : '↓ Sleep debt accumulating',    pos: scores.health > 60 },
    exercise: { text: scores.longevity > 55 ? '↑ Adding healthy years'    : '↓ Sedentary risk rising',    pos: scores.longevity > 55 },
    screen:   { text: state.screen < 4 ? '↑ Focus & time protected'  : '↓ Stealing ' + (state.screen * 365 | 0) + ' hrs/yr from your life', pos: state.screen < 4 },
    work:     { text: scores.career > 60 ? '↑ Career compound interest'  : '↓ Output below potential',    pos: scores.career > 60 },
    social:   { text: scores.happiness > 60 ? '↑ Relationship wealth building' : '↓ Isolation compounds slowly', pos: scores.happiness > 60 },
    learning: { text: state.learning > 5 ? '↑ Skills compounding fast'   : '↓ Knowledge gap widening',    pos: state.learning > 5 },
    diet:     { text: state.diet > 6 ? '↑ Cellular aging slowed'     : '↓ Inflammation rising silently', pos: state.diet > 6 },
    stress:   { text: state.stress < 5 ? '↑ Cortisol in check'         : '↓ Chronic stress shortens life by yrs', pos: state.stress < 5 },
  };

  Object.keys(hints).forEach(key => {
    const el = document.getElementById(sliderConfig[key].impactId);
    const h  = hints[key];
    el.textContent = h.text;
    el.className   = 'habit-impact ' + (h.pos ? 'impact-pos' : 'impact-neg');
  });
}

function renderTimeline(events) {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';

  events.forEach((ev, i) => {
    const item = document.createElement('div');
    item.className = `tl-item ${ev.type || ''}`;

    const badgeHTML = ev.badge
      ? `<span class="tl-badge badge-${ev.badge}">${ev.badge === 'great' ? '● Thriving' : ev.badge === 'warn' ? '⚠ Risk' : '● Note'}</span>`
      : '';
    const ghostHTML = ev.ghostNote
      ? `<div class="tl-ghost-note">👻 ${ev.ghostNote}</div>`
      : '';

    item.innerHTML = `
      <div class="tl-age">${ev.age}</div>
      <div class="tl-node"></div>
      <div class="tl-content">
        <div class="tl-event-title">${ev.title}</div>
        <div class="tl-event-desc">${ev.desc}</div>
        ${badgeHTML}
        ${ghostHTML}
      </div>
    `;

    tl.appendChild(item);

    // Staggered reveal
    setTimeout(() => item.classList.add('visible'), 80 + i * 90);
  });
}

function renderMetrics(scores) {
  const grid = document.getElementById('metrics-grid');
  const metrics = [
    { emoji: '❤️',  label: 'Health Score',    value: Math.round(scores.health),    unit: '/100', color: '#39ff82' },
    { emoji: '🚀',  label: 'Career Peak',      value: Math.round(scores.career),    unit: '/100', color: '#f5c518' },
    { emoji: '😊',  label: 'Happiness Index',  value: Math.round(scores.happiness), unit: '/100', color: '#c084fc' },
    { emoji: '🔥',  label: 'Burnout Risk',     value: Math.round(scores.burnout),   unit: '/100', color: '#ff4d6d' },
    { emoji: '⚡',  label: 'Energy Level',     value: Math.round(scores.energy),    unit: '/100', color: '#00e5ff' },
    { emoji: '🎯',  label: 'Focus Quotient',   value: Math.round(scores.focus),     unit: '/100', color: '#f5c518' },
    { emoji: '💰',  label: 'Wealth Path',      value: Math.round(scores.wealth),    unit: '/100', color: '#39ff82' },
    { emoji: '🕐',  label: 'Longevity Score',  value: Math.round(scores.longevity), unit: '/100', color: '#c084fc' },
  ];

  grid.innerHTML = metrics.map(m => `
    <div class="metric-card" style="--mc-color:${m.color}">
      <span class="metric-emoji">${m.emoji}</span>
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}<span style="font-size:14px;color:var(--muted)">${m.unit}</span></div>
    </div>
  `).join('');
}

function renderGhostPanel() {
  const panel = document.getElementById('ghost-panel');
  const grid  = document.getElementById('ghost-grid');
  const legGhost = document.getElementById('leg-ghost');

  if (!state.ghostMode) {
    panel.classList.add('hidden');
    legGhost.classList.add('hidden');
    document.getElementById('timeline').classList.remove('ghost-active');
    return;
  }

  panel.classList.remove('hidden');
  legGhost.classList.remove('hidden');
  document.getElementById('timeline').classList.add('ghost-active');

  const comparisons = buildGhostComparison(state, optimalHabits);
  grid.innerHTML = comparisons.map(c => {
    const diff    = c.ghost - c.now;
    const better  = c.higherBetter ? diff > 0 : diff < 0;
    const deltaAbs = Math.abs(diff);
    const deltaClass = better ? 'delta-pos' : 'delta-neg';
    const deltaSign  = better ? '+' : '';
    const adjDiff    = c.higherBetter ? diff : -diff;

    return `
      <div class="ghost-compare-item">
        <div class="gci-label">${c.label}</div>
        <div class="gci-row">
          <span class="gci-key">You Now</span>
          <span class="gci-val-now">${c.now}${c.unit}</span>
        </div>
        <div class="gci-row">
          <span class="gci-key">Optimized You</span>
          <span class="gci-val-ghost">
            ${c.ghost}${c.unit}
            <span class="gci-delta ${deltaClass}">${deltaSign}${adjDiff}</span>
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ── MAIN UPDATE ──────────────────────────
function update() {
  const scores = computeScores(state);

  // Trajectory score + bar
  animateScore(scores.trajectory);
  document.getElementById('traj-fill').style.width   = scores.trajectory + '%';
  document.getElementById('traj-fill').style.backgroundPosition = (100 - scores.trajectory) + '% 0';
  document.getElementById('traj-glow').style.width   = scores.trajectory + '%';

  const v = verdict(scores.trajectory);
  const verdictEl = document.getElementById('traj-verdict');
  verdictEl.textContent  = v.text;
  verdictEl.style.color  = v.color;

  // Slider fills + values
  updateSliderFills();

  // Impact hints
  updateImpactHints(scores);

  // Timeline
  const events = generateTimeline(state, scores);
  renderTimeline(events);

  // Metrics
  renderMetrics(scores);

  // Ghost
  renderGhostPanel();
}

// ── SLIDER BINDING ────────────────────────
Object.keys(sliderConfig).forEach(key => {
  const cfg   = sliderConfig[key];
  const input = document.getElementById(cfg.id);
  const valEl = document.getElementById(cfg.valId);
  const row   = input.closest('.habit-row');

  input.addEventListener('input', () => {
    state[key] = parseFloat(input.value);
    update();

    // Pop animation on value
    valEl.classList.remove('pop');
    void valEl.offsetWidth;
    valEl.classList.add('pop');
    setTimeout(() => valEl.classList.remove('pop'), 200);

    row.classList.add('active-slide');
    clearTimeout(row._slideTimeout);
    row._slideTimeout = setTimeout(() => row.classList.remove('active-slide'), 1000);
  });
});

// ── AGE STEPPER ───────────────────────────
document.getElementById('age-up').addEventListener('click', () => {
  if (state.age < 45) { state.age++; syncAge(); update(); }
});
document.getElementById('age-down').addEventListener('click', () => {
  if (state.age > 16) { state.age--; syncAge(); update(); }
});
function syncAge() {
  document.getElementById('age-val').textContent = state.age;
}

// ── GHOST MODE ────────────────────────────
document.getElementById('ghost-toggle').addEventListener('click', () => {
  state.ghostMode = !state.ghostMode;
  const btn   = document.getElementById('ghost-toggle');
  const badge = document.getElementById('ghost-badge');
  btn.classList.toggle('active', state.ghostMode);
  badge.textContent = state.ghostMode ? 'ON' : 'OFF';
  update();
});

// ── OPTIMIZE BUTTON ───────────────────────
document.getElementById('optimize-btn').addEventListener('click', () => {
  const btn = document.getElementById('optimize-btn');
  btn.classList.add('optimizing');
  btn.textContent = '⚡ Optimizing...';

  // Animate sliders one by one
  const keys = Object.keys(optimalHabits);
  keys.forEach((key, i) => {
    setTimeout(() => {
      const cfg   = sliderConfig[key];
      const input = document.getElementById(cfg.id);
      input.value   = optimalHabits[key];
      state[key]    = optimalHabits[key];
      update();
    }, i * 80);
  });

  setTimeout(() => {
    btn.classList.remove('optimizing');
    btn.textContent = '⚡ Auto-Optimize My Habits';
  }, keys.length * 80 + 400);
});

// ── RESET ─────────────────────────────────
document.getElementById('reset-btn').addEventListener('click', () => {
  const defaults = { sleep:7, exercise:3, screen:5, work:3, social:5, learning:2, diet:5, stress:6, age:22 };
  Object.assign(state, defaults, { ghostMode: false });

  Object.keys(sliderConfig).forEach(key => {
    document.getElementById(sliderConfig[key].id).value = state[key];
  });
  document.getElementById('age-val').textContent = state.age;
  document.getElementById('ghost-toggle').classList.remove('active');
  document.getElementById('ghost-badge').textContent = 'OFF';
  update();
});

// ── SHARE ─────────────────────────────────
document.getElementById('share-btn').addEventListener('click', () => {
  const scores  = computeScores(state);
  const shareText = `My Decade Clock score: ${scores.trajectory}/100 🕐\nHealth: ${Math.round(scores.health)} · Career: ${Math.round(scores.career)} · Happiness: ${Math.round(scores.happiness)}\nCheck your future: ${window.location.href}`;
  navigator.clipboard.writeText(shareText).then(() => {
    const toast = document.getElementById('share-toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  });
});

// ── INTRO → APP ───────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  const intro = document.getElementById('intro-screen');
  const app   = document.getElementById('app');
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.style.display = 'none';
    app.classList.remove('hidden');
    update();
    initParticles();
  }, 700);
});

// ════════════════════════════════════════
//   PARTICLE SYSTEM
// ════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 70;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * (W || 1200);
      this.y  = init ? Math.random() * (H || 800) : H + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.r  = Math.random() * 1.5 + 0.3;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.hue = Math.random() > 0.5 ? 47 : 180; // gold or cyan
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}
