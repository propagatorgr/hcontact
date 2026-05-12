// ================= ΣΤΑΘΕΡΕΣ =================
const g  = 9.81;
const dt = 0.016;

// ================= ΦΑΣΕΙΣ =================
// 0: idle
// 1: ταλάντωση (Σ1+Σ2)
// 1.5: παύση (χάσιμο επαφής)
// 2: ολίσθηση Σ2, Σ1 συνεχίζει
// 3: πτώση Σ2
// 4: τελική παύση (πρόσκρουση στο ελατήριο)
let phase = 0;

// ================= ΚΙΝΗΣΗ =================
let x = 0, v = 0;          // Σ1
let x2 = 0, v2 = 0;        // Σ2 οριζόντια
let y2 = 0, vy2 = 0;       // Σ2 κατακόρυφα
let slideDir = 1;
let slideTime = 0;

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

  // Ανεξάρτητος υπολογισμός x_crit (ΔΕΝ εξαρτάται από Ε)
  const omega12 = Math.sqrt(k / (m1 + m2));
  const xCrit   = mu * g / (omega12 * omega12);
  XcvEl.textContent = xCrit.toFixed(3);

  const omega1 = Math.sqrt(k / m1);

  // ===== ΤΑΛΑΝΤΩΣΗ Σ1+Σ2 =====
  if (phase === 1) {
    v += -omega12 * omega12 * x * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      phase = 1.5;
      slideDir = Math.sign(x) || 1;
      lockForPauseResumeOnly();
    }
  }

  // ===== Σ1 συνεχίζει ΑΑΤ =====
  if (phase === 2 || phase === 3) {
    v += -omega1 * omega1 * x * dt;
    x += v * dt;
  }

  // ===== ΟΛΙΣΘΗΣΗ Σ2 =====
  if (phase === 2) {
    slideTime += dt;
    v2 += mu * g * slideDir * dt;
    x2 += v2 * dt;

    if (slideTime > 0.5) {
      phase = 3;
      vy2 = 0;
    }
  }

  // ===== ΠΤΩΣΗ Σ2 =====
  if (phase === 3) {
    vy2 += g * dt;
    y2  += vy2 * dt;

    const ySpring = Y - H1 / 2;
    if (y2 + H2 >= ySpring) {
      y2 = ySpring - H2;
      vy2 = 0;
      v   = 0;
      phase = 4;
      lockEverythingExceptReset();
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (phase === 1.5) {
    fill(200, 0, 0);
    textSize(22);
    text("Χάσιμο επαφής", width/2 - 90, 35);
  }

  if (phase === 4) {
    fill(0, 120, 0);
    textSize(20);
    text("Το Σ₂ προσέκρουσε στο ελατήριο", width/2 - 185, 60);
  }
}

// ================= ΚΟΥΜΠΙΑ =================
function startMotion() {
  if (phase !== 0) return;

  x = 0;
  v = Math.sqrt(2 * E / (m1 + m2));
  x2 = 0; v2 = 0;
  y2 = Y - H1 - H2; vy2 = 0;
  slideTime = 0;

  phase = 1;
  lockSliders(true);
}

function resumeMotion() {
  if (phase !== 1.5) return;

  x2 = 0; v2 = 0;
  y2 = Y - H1 - H2; vy2 = 0;
  slideTime = 0;
  phase = 2;
}

function stopMotion() {
  phase = 0;
  lockSliders(false);
}

function resetSystem() {
  x = v = x2 = v2 = vy2 = slideTime = 0;
  y2 = Y - H1 - H2;
  phase = 0;

  EEl.value = 0;
  EvEl.textContent = "0.0";

  startBtn.disabled  = false;
  resumeBtn.disabled = false;
  stopBtn.disabled   = false;

  m1El.disabled = false;
  m2El.disabled = false;
  kEl.disabled  = false;
  muEl.disabled = false;
  EEl.disabled  = false;

  resetBtn.disabled = false;
}

function lockEverythingExceptReset() {
  startBtn.disabled  = true;
  resumeBtn.disabled = true;
  stopBtn.disabled   = true;

  m1El.disabled = true;
  m2El.disabled = true;
  kEl.disabled  = true;
  muEl.disabled = true;
  EEl.disabled  = true;

  resetBtn.disabled = false;
}

// ================= UI =================
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

// ================= ΣΧΕΔΙΑΣΗ =================
function drawSystem() {
  const X1 = X0 + x * scale;
  const X2 = X1 + x2 * scale;

  stroke(0);
  line(0, Y, width, Y);

  fill(180);
  rect(770, Y - 70, 25, 70);

  fill(200,120,120);
  rect(X1 - W1/2, Y - H1, W1, H1);

  fill(0);
  noStroke();
  ellipse(X1, Y - H1/2, 7, 7);

  fill(120);
  rect(X2 - W2/2, y2, W2, H2);

  stroke(0);
  noFill();
  beginShape();
  let a = X1 + W1/2, b = 770, y = Y - H1/2;
  vertex(a, y);
  for (let i = 1; i <= 16; i++) {
    let t = i / 16;
    vertex(lerp(a, b, t), y + (i % 2 ? 10 : -10));
  }
  vertex(b, y);
  endShape();
}

function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);
  line(X0 + xCrit * scale, Y - 90, X0 + xCrit * scale, Y + 30);
  line(X0 - xCrit * scale, Y - 90, X0 - xCrit * scale, Y + 30);
  drawingContext.setLineDash([]);
}
function lockForPauseResumeOnly() {
  // Κουμπιά
  startBtn.disabled  = true;
  stopBtn.disabled   = true;
  resumeBtn.disabled = false;
  resetBtn.disabled  = false;

  // Sliders
  m1El.disabled = true;
  m2El.disabled = true;
  kEl.disabled  = true;
  muEl.disabled = true;
  EEl.disabled  = true;
}
