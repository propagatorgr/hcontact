// ===== ΣΤΑΘΕΡΕΣ =====
const g = 9.81;
const dt = 0.016;

// ===== ΚΑΤΑΣΤΑΣΗ =====
let x = 0;
let v = 0;
let running = false;
let paused = false;
let phase = 0;   // 0: idle, 1: ταλάντωση, 2: ολίσθηση
let x2 = 0;
let v2 = 0;
// ===== ΠΑΡΑΜΕΤΡΟΙ =====
let m1, m2, k, mu, E;

// ===== ΣΧΕΔΙΑΣΗ =====
const scale = 300;
const X0 = 260;
const Y = 180;
const W1 = 60, H1 = 24;
const W2 = 40, H2 = 18;

function setup() {
  const c = createCanvas(900, 300);
  c.parent("canvas-holder");

  document.getElementById("startBtn").onclick = startMotion;
  document.getElementById("stopBtn").onclick  = stopMotion;
  document.getElementById("resetBtn").onclick = resetSystem;
}

function draw() {
  background(245);
  readUI();

  const omega = Math.sqrt(k / (m1 + m2));
  const xCrit = mu * g / (omega * omega);

  if (running && !paused) {
    const a = -omega * omega * x;
    v += a * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      paused = true;
      running = false;
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (paused) {
    fill(200, 0, 0);
    textSize(22);
    text("Χάσιμο επαφής", width / 2 - 90, 35);
  }
  if (phase === 1) {
  const a = -omega * omega * x;
  v += a * dt;
  x += v * dt;

  if (Math.abs(x) >= xCrit) {
    // ΧΑΝΕΤΑΙ Η ΕΠΑΦΗ
    phase = 2;

    // αρχικές συνθήκες Σ2
    x2 = 0;
    v2 = v;

    // σταματά η ταλάντωση
    v = 0;
  }
}
  if (phase === 2) {
  const a2 = -mu * g * Math.sign(v2);
  v2 += a2 * dt;
  x2 += v2 * dt;

  // σταμάτησε η ολίσθηση
  if (Math.sign(v2) !== Math.sign(v2 + a2 * dt)) {
    v2 = 0;
    // εδώ αργότερα: phase = 3 (πτώση)
  }
}
}

function readUI() {
  m1 = +document.getElementById("m1").value;
  m2 = +document.getElementById("m2").value;
  k  = +document.getElementById("k").value;
  mu = +document.getElementById("mu").value;
  E  = +document.getElementById("ESlider").value;

  document.getElementById("m1v").textContent = m1;
  document.getElementById("m2v").textContent = m2;
  document.getElementById("kv").textContent  = k;
  document.getElementById("muv").textContent = mu.toFixed(2);
  document.getElementById("Ev").textContent  = E.toFixed(1);
}

function startMotion() {
  if (running) return;
  x = 0;
  v = Math.sqrt(2 * E / (m1 + m2));
  running = true;
  paused = false;
  lockSliders(true);
}

function stopMotion() {
  running = false;
  lockSliders(false);
}

function resetSystem() {
  x = 0;
  v = 0;
  running = false;
  paused = false;
  document.getElementById("ESlider").value = 0;
  lockSliders(false);
}

function lockSliders(lock) {
  ["m1","m2","k","mu","ESlider"].forEach(id=>{
    document.getElementById(id).disabled = lock;
  });
}

// ===== ΣΧΕΔΙΟ =====
function drawSystem() {
  const X = X0 + x * scale;
  stroke(0); line(0, Y, width, Y);
  fill(180); rect(770, Y - 70, 25, 70);

  fill(200,120,120);
  rect(X - W1/2, Y - H1, W1, H1);

  fill(0); noStroke();
  ellipse(X, Y - H1/2, 7, 7);

  fill(120);
  rect(X - W2/2, Y - H1 - H2, W2, H2);
  // === ΕΛΑΤΗΡΙΟ ===
let springLeft = X + W1 / 2;   // δεξί άκρο κάτω σώματος
let springRight = 770;         // αριστερό άκρο τοίχου
let ySpring = Y - H1 / 2;
let X1 = X0 + x * scale;        // Σ1
let X2 = X1 + x2 * scale;      // Σ2
stroke(0);
noFill();
beginShape();
vertex(springLeft, ySpring);
// Σ1
rect(X1 - W1/2, Y - H1, W1, H1);

// Σ2
rect(X2 - W2/2, Y - H1 - H2, W2, H2);

let coils = 8;
for (let i = 1; i <= coils * 2; i++) {
  let t = i / (coils * 2);
  let px = lerp(springLeft, springRight, t);
  let py = ySpring + (i % 2 === 0 ? -10 : 10);
  vertex(px, py);
}

vertex(springRight, ySpring);
endShape();

}

function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);
  const xp = X0 + xCrit * scale;
  const xm = X0 - xCrit * scale;
  line(xp, Y - 90, xp, Y + 30);
  line(xm, Y - 90, xm, Y + 30);
  drawingContext.setLineDash([]);
}
