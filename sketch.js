// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;
const dt = 0.016;

// ================= ΦΑΣΕΙΣ =================
let phase = 0;
let paused = false;

// ================= ΚΙΝΗΣΗ =================
let x = 0, v = 0;
let x2 = 0, v2 = 0;
let y2 = 0, vy2 = 0;
let vx2 = 0; // ⭐ οριζόντια ταχύτητα Σ2 μετά αποκόλληση

// ================= ΠΑΡΑΜΕΤΡΟΙ =================
let m1, m2, k, mu, E;

// ================= DOM =================
let m1El, m2El, kEl, muEl, EEl;
let m1vEl, m2vEl, kvEl, muvEl, EvEl;
let AvEl, XcvEl;

// ================= ΣΧΕΔΙΑΣΗ =================
const scale = 300;
const X0 = 260;
const Y  = 180;
const W1 = 60, H1 = 24;
const W2 = 40, H2 = 18;

function setup() {
  const c = createCanvas(900, 300);
  c.parent("canvas-holder");

  m1El = document.getElementById("m1");
  m2El = document.getElementById("m2");
  kEl  = document.getElementById("k");
  muEl = document.getElementById("mu");
  EEl  = document.getElementById("ESlider");

  m1vEl = document.getElementById("m1v");
  m2vEl = document.getElementById("m2v");
  kvEl  = document.getElementById("kv");
  muvEl = document.getElementById("muv");
  EvEl  = document.getElementById("Ev");

  AvEl  = document.getElementById("Av");
  XcvEl = document.getElementById("Xcv");

  startBtn.onclick  = startMotion;
  resumeBtn.onclick = resumeMotion;
  stopBtn.onclick   = stopMotion;
  resetBtn.onclick  = resetSystem;

  y2 = Y - H1 - H2;
}

function draw() {
  background(245);
  readUI();

  // ✅ STOP mode: μόνο ενημέρωση ενέργειας → ταχύτητας
  if (paused) {
    adjustVelocityToEnergy();
    drawSystem();
    return;
  }

  const omega12 = Math.sqrt(k / (m1 + m2));
  const xCrit = mu * g / (omega12 * omega12);
  XcvEl.textContent = xCrit.toFixed(3);

  const omega1 = Math.sqrt(k / m1);

  // ===== Σ1+Σ2 μαζί =====
  if (phase === 1) {
    v += -omega12 * omega12 * x * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      phase = 3; // πάμε κατευθείαν σε αποκόλληση

      // ✅ αρχικές συνθήκες βολής
      vx2 = v;         // ίδια οριζόντια ταχύτητα
      vy2 = 0;
      x2 = 0;
      y2 = Y - H1 - H2;

      lockForPauseResumeOnly();
    }
  }

  // ===== Σ1 μόνο του =====
  if (phase === 3 || phase === 4) {
    v += -omega1 * omega1 * x * dt;
    x += v * dt;
  }

  // ===== Σ2 → ΟΡΙΖΟΝΤΙΑ ΒΟΛΗ =====
  if (phase === 3) {
    vy2 += g * dt;
    y2 += vy2 * dt;
    x2 += vx2 * dt;

    const Xspring = 770; // θέση ελατηρίου
    const ySpring = Y - H1 / 2;

    const X2abs = X0 + x * scale + x2 * scale;

    // ✅ μόνο αν είναι πάνω από το ελατήριο
    if (y2 + H2 >= ySpring && Math.abs(X2abs - Xspring) < 40) {
      y2 = ySpring - H2;
      vy2 = 0;
      v = 0;
      phase = 4;
      lockEverythingExceptReset();
    }

    // ✅ αλλιώς πέφτει απλά κάτω (χωρίς μήνυμα)
    if (y2 > height) {
      phase = 4;
      lockEverythingExceptReset();
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (phase === 4) {
    fill(0, 120, 0);
    textSize(20);
    text("Το Σ₂ προσέκρουσε στο ελατήριο", width/2 - 180, 60);
  }
}

// ================= ΕΝΕΡΓΕΙΑ ΣΕ STOP =================
function adjustVelocityToEnergy() {
  const totalMass = m1 + m2;
  const potential = 0.5 * k * x * x;
  let kinetic = E - potential;

  if (kinetic < 0) kinetic = 0;

  const sign = Math.sign(v || 1);
  v = sign * Math.sqrt(2 * kinetic / totalMass);
}

// ================= ΚΟΥΜΠΙΑ =================
function startMotion() {
  if (phase !== 0) return;

  x = 0;
  v = Math.sqrt(2 * E / (m1 + m2));

  phase = 1;
  paused = false;

  lockSliders(true);
}

function stopMotion() {
  paused = true;

  // ✅ μόνο το E slider ενεργό
  EEl.disabled = false;
}

function resumeMotion() {
  paused = false;

  // επανακλείδωμα sliders
  lockSliders(true);
}

function resetSystem() {
  x = v = x2 = v2 = vy2 = 0;
  y2 = Y - H1 - H2;
  phase = 0;
  paused = false;

  startBtn.disabled  = false;
  resumeBtn.disabled = false;
  stopBtn.disabled   = false;

  m1El.disabled = false;
  m2El.disabled = false;
  kEl.disabled  = false;
  muEl.disabled = false;
  EEl.disabled  = false;
}

// ================= LOCK =================
function lockSliders(lock) {
  m1El.disabled = lock;
  m2El.disabled = lock;
  kEl.disabled  = lock;
  muEl.disabled = lock;
  EEl.disabled  = lock;
}

function lockEverythingExceptReset() {
  startBtn.disabled  = true;
  resumeBtn.disabled = true;
  stopBtn.disabled   = true;

  lockSliders(true);

  resetBtn.disabled = false;
}

function lockForPauseResumeOnly() {
  startBtn.disabled  = true;
  stopBtn.disabled   = true;
  resetBtn.disabled  = true;
  resumeBtn.disabled = false;
}

function readUI() {
  m1 = +m1El.value;
  m2 = +m2El.value;
  k  = +kEl.value;
  mu = +muEl.value;
  E  = +EEl.value;

  m1vEl.textContent = m1;
  m2vEl.textContent = m2;
  kvEl.textContent  = k;
  muvEl.textContent = mu.toFixed(2);
  EvEl.textContent  = E.toFixed(1);

  const A = Math.sqrt(2 * E / k);
  AvEl.textContent = A.toFixed(3);
}
