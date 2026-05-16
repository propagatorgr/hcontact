// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;
const dt = 0.016;

// ================= ΦΑΣΕΙΣ =================
let phase = 0;
let paused = false;

// ================= ΚΙΝΗΣΗ =================
let x = 0, v = 0;
let x2 = 0;
let y2 = 0, vy2 = 0;
let vx2 = 0;
let hitSpring = false;

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

  // ✅ ΕΔΩ ΗΤΑΝ ΤΟ CRASH (stopMotion δεν υπήρχε)
  startBtn.onclick  = startMotion;
  resumeBtn.onclick = resumeMotion;
  stopBtn.onclick   = stopMotion;
  resetBtn.onclick  = resetSystem;

  y2 = Y - H1 - H2;
}
function draw() {
  background(245);
  readUI();

  const xCrit = getXcrit();

  // ===== ΤΕΛΙΚΟ ΣΤΑΜΑ =====
  if (phase === 4) {
    drawCriticalLines(xCrit);
    drawSystem();

    if (hitSpring) {
      fill(0,120,0);
      textSize(20);
      text("Το Σ₂ προσέκρουσε στο ελατήριο", width/2 - 180, 60);
    }
    return;
  }

  // ===== PAUSE =====
  if (paused) {
    adjustVelocityToEnergy();
    drawCriticalLines(xCrit);
    drawSystem();
    return;
  }

  const omega12 = Math.sqrt(k / (m1 + m2));
  const omega1  = Math.sqrt(k / m1);

  // ===== ΤΑΛΑΝΤΩΣΗ ΜΑΖΙ =====
  if (phase === 1) {
    v += -omega12 * omega12 * x * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      vx2 = v;   // συνεχής ταχύτητα
      vy2 = 0;

      x2 = 0;
      y2 = Y - H1 - H2;

      phase = 2;
      lockForPauseResumeOnly();
    }
  }

  // ===== Σ1 ΜΟΝΟ =====
  if (phase === 2) {
    v += -omega1 * omega1 * x * dt;
    x += v * dt;
  }

  // ===== Σ2 ΒΟΛΗ =====
  if (phase === 2) {

    // --- ΚΙΝΗΣΗ ---
    vy2 += g * dt;
    y2  += vy2 * dt;
    x2  += vx2 * dt;

    // --- ΥΠΟΛΟΓΙΣΜΟΙ ---
    const X2abs = X0 + x * scale + x2 * scale;
    const ySpring = Y - H1 / 2;
    const Xspring = 770;

    // --- ΕΞΟΔΟΣ ΑΠΟ CANVAS ---
    if (X2abs<-50||X2abs>width+50||y2>height+50){
      phase = 4;
      hitSpring = false;
      lockEverythingExceptReset();
    }

    // --- ΠΡΟΣΚΡΟΥΣΗ ΣΤΟ ΕΛΑΤΗΡΙΟ ---
    else if (y2 + H2 >= ySpring && Math.abs(X2abs - Xspring) < 40) {
      y2 = ySpring - H2;
      vy2 = 0;
      v = 0;

      hitSpring = true;
      phase = 4;
      lockEverythingExceptReset();
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();
}


 
// ================= ΕΝΕΡΓΕΙΑ =================
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

  startBtn.disabled  = true;
  stopBtn.disabled   = false;
  resumeBtn.disabled = true;
}

function stopMotion() {   // ✅ ΥΠΑΡΧΕΙ ΤΩΡΑ
  paused = true;
  EEl.disabled = false;
  
// ✅ κουμπιά
  stopBtn.disabled   = true;
  resumeBtn.disabled = false;   // ⭐ ΑΥΤΟ ΕΛΕΙΠΕ
  startBtn.disabled  = true;

}

function resumeMotion() {
  paused = false;
  lockSliders(true);
  
startBtn.disabled  = true;
  stopBtn.disabled   = false;   // ⭐ ΤΟ ΚΡΙΣΙΜΟ
  resumeBtn.disabled = true;

}

function resetSystem() {
  x = 0;
  v = 0;
  x2 = 0;
  vx2 = 0;
  vy2 = 0;

  y2 = Y - H1 - H2;

  phase = 0;
  paused = false;
  hitSpring = false;

  m1El.value = 4;
  m2El.value = 2;
  kEl.value  = 200;
  muEl.value = 0.50;
  EEl.value  = 0;

  startBtn.disabled  = false;
  stopBtn.disabled   = true;
  resumeBtn.disabled = true;

  lockSliders(false);
}

// ================= UTIL =================
function getXcrit() {
  const omega12 = Math.sqrt(k / (m1 + m2));
  const xCrit = mu * g / (omega12 * omega12);
  XcvEl.textContent = xCrit.toFixed(3);
  return xCrit;
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

// ================= DRAW =================
function drawSystem() {
  const X1 = X0 + x * scale;
  const X2 = X1 + x2 * scale;

  stroke(0);
  line(0, Y, width, Y);

  fill(180);
  rect(770, Y - 70, 25, 70);

  fill(200,120,120);
  rect(X1 - W1/2, Y - H1, W1, H1);

  fill(0); noStroke();
  ellipse(X1, Y - H1/2, 7, 7);

  fill(120);
  rect(X2 - W2/2, y2, W2, H2);

  stroke(0); noFill();
  beginShape();
  let a = X1 + W1/2, b = 770, yy = Y - H1/2;
  vertex(a, yy);
  for (let i = 1; i <= 16; i++) {
    let t = i / 16;
    vertex(lerp(a, b, t), yy + (i % 2 ? 10 : -10));
  }
  vertex(b, yy);
  endShape();
}

function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);
  line(X0 + xCrit * scale, Y - 90, X0 + xCrit * scale, Y + 30);
  line(X0 - xCrit * scale, Y - 90, X0 - xCrit * scale, Y + 30);
  drawingContext.setLineDash([]);
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
