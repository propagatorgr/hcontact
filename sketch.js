// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;
const dt = 0.016;

// ================= ΦΑΣΕΙΣ =================
// 0: idle
// 1: ταλάντωση
// 1.5: παύση (χάσιμο επαφής)
// 2: ολίσθηση Σ2
let phase = 0;

// ================= ΚΙΝΗΣΗ =================
let x = 0, v = 0;
let x2 = 0, v2 = 0;
let slideDir = 0;

// ================= ΠΑΡΑΜΕΤΡΟΙ =================
let m1, m2, k, mu, E;

// ================= DOM ΣΤΟΙΧΕΙΑ =================
let m1El, m2El, kEl, muEl, EEl;
let m1vEl, m2vEl, kvEl, muvEl, EvEl;

// ================= ΣΧΕΔΙΑΣΗ =================
const scale = 300;
const X0 = 260;
const Y = 180;
const W1 = 60, H1 = 24;
const W2 = 40, H2 = 18;

function setup() {
  const c = createCanvas(900, 300);
  c.parent("canvas-holder");

  // ----- DOM -----
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

  startBtn.onclick  = startMotion;
  resumeBtn.onclick = resumeMotion;
  stopBtn.onclick   = stopMotion;
  resetBtn.onclick  = resetSystem;
}

function draw() {
  background(245);
  readUI();

  const omega = Math.sqrt(k / (m1 + m2));
  const xCrit = mu * g / (omega * omega);

  if (phase === 1) {
    const a = -omega * omega * x;
    v += a * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      phase = 1.5;
      slideDir = Math.sign(x);
      v = 0;
    }
  }

  if (phase === 2) {
    const a2 = mu * g * slideDir;
    v2 += a2 * dt;
    x2 += v2 * dt;

    if (v2 * slideDir <= 0) {
      v2 = 0;
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (phase === 1.5) {
    fill(200, 0, 0);
    textSize(22);
    text("Χάσιμο επαφής", width / 2 - 90, 35);
  }
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
}

// ================= ΚΟΥΜΠΙΑ =================
function startMotion() {
  if (phase !== 0) return;

  x = 0; x2 = 0; v2 = 0;
  v = Math.sqrt(2 * E / (m1 + m2));
  phase = 1;

  lockSliders(true);
}

function resumeMotion() {
  if (phase !== 1.5) return;
  v2 = 0;
  x2 = 0;
  phase = 2;
}

function stopMotion() {
  phase = 0;
  lockSliders(false);
}

function resetSystem() {
  x = 0; v = 0; x2 = 0; v2 = 0;
  phase = 0;

  EEl.value = 0;
  EvEl.textContent = "0";
  lockSliders(false);
}

function lockSliders(lock) {
  [m1El, m2El, kEl, muEl, EEl].forEach(el => el.disabled = lock);
}

// ================= ΣΧΕΔΙΑΣΗ =================
function drawSystem() {
  const X1 = X0 + x * scale;
  const X2 = X1 + x2 * scale;

  stroke(0); line(0, Y, width, Y);
  fill(180); rect(770, Y - 70, 25, 70);

  fill(200,120,120);
  rect(X1 - W1/2, Y - H1, W1, H1);

  fill(0); noStroke();
  ellipse(X1, Y - H1/2, 7, 7);

  fill(120);
  rect(X2 - W2/2, Y - H1 - H2, W2, H2);

  // ελατήριο
  stroke(0); noFill(); beginShape();
  let a = X1 + W1/2, b = 770, y = Y - H1/2;
  vertex(a, y);
  for (let i = 1; i <= 16; i++) {
    let t = i / 16;
    vertex(lerp(a, b, t), y + (i % 2 ? 10 : -10));
  }
  vertex(b, y); endShape();
}

function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);
  line(X0 + xCrit * scale, Y - 90, X0 + xCrit * scale, Y + 30);
  line(X0 - xCrit * scale, Y - 90, X0 - xCrit * scale, Y + 30);
  drawingContext.setLineDash([]);
}
