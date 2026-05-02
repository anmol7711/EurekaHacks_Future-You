/* ──────────────────────────────────────────────
   FUTURE YOU DASHBOARD · script.js
────────────────────────────────────────────── */

// ── State ────────────────────────────────────
const state = {
  sleep:    7,
  work:     6,
  screen:   4,
  exercise: 5,
};

// ── DOM refs ─────────────────────────────────
const sliders = {
  sleep:    document.getElementById('sleep'),
  work:     document.getElementById('work'),
  screen:   document.getElementById('screen'),
  exercise: document.getElementById('exercise'),
};
const vals = {
  sleep:    document.getElementById('val-sleep'),
  work:     document.getElementById('val-work'),
  screen:   document.getElementById('val-screen'),
  exercise: document.getElementById('val-exercise'),
};
const fills = {
  sleep:    document.getElementById('fill-sleep'),
  work:     document.getElementById('fill-work'),
  screen:   document.getElementById('fill-screen'),
  exercise: document.getElementById('fill-exercise'),
};

const scoreNumber  = document.getElementById('score-number');
const scoreLabel   = document.getElementById('score-label');
const scoreBarFill = document.getElementById('score-bar-fill');
const scoreBarGlow = document.getElementById('score-bar-glow');

const rings = {
  health:    document.getElementById('ring-health'),
  happiness: document.getElementById('ring-happiness'),
  career:    document.getElementById('ring-career'),
};
const ringVals = {
  health:    document.getElementById('rval-health'),
  happiness: document.getElementById('rval-happiness'),
  career:    document.getElementById('rval-career'),
};

const statEnergy  = document.getElementById('stat-energy');
const statBurnout = document.getElementById('stat-burnout');
const statFocus   = document.getElementById('stat-focus');
const pillEnergy  = document.getElementById('pill-energy');
const pillBurnout = document.getElementById('pill-burnout');
const pillFocus   = document.getElementById('pill-focus');

const barFills = Array.from({ length: 7 }, (_, i) =>
  document.querySelector(`#bar-${i} .bar-fill`)
);

const improveBtn = document.getElementById('improve-btn');

// ── Helpers ───────────────────────────────────
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function tier(v) {
  if (v >= 70) return 'High';
  if (v >= 40) return 'Medium';
  return 'Low';
}
function tierClass(v) {
  if (v >= 70) return 'pill-high';
  if (v >= 40) return 'pill-medium';
  return 'pill-low';
}

// Ring circumference: r=32 → 2πr ≈ 201
const CIRC = 2 * Math.PI * 32;

function setRing(el, pct) {
  const offset = CIRC - (CIRC * pct) / 100;
  el.style.strokeDashoffset = offset;
}

// Smooth number count-up
let countAnim = null;
function countTo(el, target, duration = 700) {
  if (countAnim) cancelAnimationFrame(countAnim);
  const start     = parseInt(el.textContent, 10) || 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);

    if (progress < 1) {
      countAnim = requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  countAnim = requestAnimationFrame(tick);
}

// ── Calculate scores ─────────────────────────
function calculate() {
  const { sleep, work, screen, exercise } = state;

  const health    = clamp(sleep * 5 + exercise * 5 - screen * 3);
  const happiness = clamp(sleep * 4 + exercise * 3 - screen * 2);
  const career    = clamp(work  * 6 - sleep * 1);
  const future    = Math.round((health + happiness + career) / 3);

  return { health, happiness, career, future };
}

// ── Generate weekly bars ──────────────────────
function weeklyBars(future) {
  // Slightly varied data around the future score
  const variance = [0.78, 0.85, 0.9, 0.88, 1.0, 0.95, 0.82];
  return variance.map(v => clamp(Math.round(future * v)));
}

// ── Set pill text and style ───────────────────
function setPill(el, value, invert = false) {
  const t = tier(invert ? 100 - value : value);
  el.textContent = t;
  el.className = 'stat-pill ' + tierClass(invert ? 100 - value : value);
}

// ── Update DOM ────────────────────────────────
let prevFuture = 0;

function update(immediate = false) {
  const { health, happiness, career, future } = calculate();

  // Score number count-up
  if (immediate) {
    scoreNumber.textContent = future;
    prevFuture = future;
  } else {
    countTo(scoreNumber, future);
    // Pop effect
    scoreNumber.classList.remove('score-pop');
    void scoreNumber.offsetWidth;
    scoreNumber.classList.add('score-pop');
  }
  prevFuture = future;

  // Score bar
  scoreBarFill.style.width = future + '%';
  scoreBarGlow.style.width = future + '%';

  // Score label + body theme
  const t = tier(future);
  document.body.className = 'theme-' + t.toLowerCase();
  scoreLabel.textContent = t === 'High'
    ? '🌟 Thriving Future'
    : t === 'Medium'
    ? '⚡ Solid Foundation'
    : '⚠️ Needs Attention';

  // Rings
  setRing(rings.health,    health);
  setRing(rings.happiness, happiness);
  setRing(rings.career,    career);
  ringVals.health.textContent    = health    + '%';
  ringVals.happiness.textContent = happiness + '%';
  ringVals.career.textContent    = career    + '%';

  // Weekly bars
  const bars = weeklyBars(future);
  bars.forEach((val, i) => {
    barFills[i].style.height = val + '%';
  });

  // Stat cards
  const energy  = clamp(state.sleep * 6 + state.exercise * 4 - state.screen * 2);
  const burnout = clamp(state.work  * 7 + state.screen * 3 - state.sleep * 5);
  const focus   = clamp(state.sleep * 5 + state.exercise * 3 - state.screen * 4);

  statEnergy.textContent  = tier(energy);
  statBurnout.textContent = tier(burnout);
  statFocus.textContent   = tier(focus);

  setPill(pillEnergy,  energy);
  setPill(pillBurnout, burnout, true);  // higher burnout = worse
  setPill(pillFocus,   focus);

  // Slider fills
  Object.keys(state).forEach(key => {
    const pct = (state[key] / 10) * 100;
    fills[key].style.width = pct + '%';
    vals[key].textContent  = state[key];
  });
}

// ── Slider events ─────────────────────────────
Object.keys(sliders).forEach(key => {
  const input = sliders[key];

  // Live update
  input.addEventListener('input', () => {
    state[key] = parseInt(input.value, 10);
    update();
  });

  // Subtle color flash on release
  input.addEventListener('change', () => {
    vals[key].style.transform = 'scale(1.3)';
    setTimeout(() => vals[key].style.transform = '', 200);
  });
});

// ── Improve button ────────────────────────────
improveBtn.addEventListener('click', () => {
  // Nudge habits positively
  state.sleep    = Math.min(10, state.sleep    + 1);
  state.exercise = Math.min(10, state.exercise + 1);
  state.screen   = Math.max(0,  state.screen   - 1);
  state.work     = Math.min(10, state.work     + 0.5 | 0);

  // Sync slider positions
  Object.keys(sliders).forEach(key => {
    sliders[key].value = state[key];
  });

  // Animate button
  improveBtn.style.transform = 'scale(0.95)';
  improveBtn.querySelector('.btn-text').textContent = '✦ Habits Improved!';
  setTimeout(() => {
    improveBtn.style.transform = '';
    improveBtn.querySelector('.btn-text').textContent = '✦ Improve My Habits';
  }, 1400);

  update();
});

// ── Staggered ring entrance ───────────────────
// Rings start at 0 and animate to real values on load
window.addEventListener('load', () => {
  // Immediate DOM set (no animation) then trigger reflow
  Object.values(rings).forEach(r => {
    r.style.transition = 'none';
    r.style.strokeDashoffset = CIRC;
  });

  // Force reflow then re-enable transitions and update
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Object.values(rings).forEach(r => {
        r.style.transition = '';
      });
      update(true);
      // After count-up sets score, also animate number from 0
      scoreNumber.textContent = 0;
      const { future } = calculate();
      countTo(scoreNumber, future, 1000);
    });
  });
});
