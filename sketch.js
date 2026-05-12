// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;
const dt = 0.016;

// ================= ΦΑΣΕΙΣ =================
// 0: αναμονή
// 1: ταλάντωση
// 1.5: παύση (χάσιμο επαφής)
// 2: ολίσθηση Σ2
let phase = 0;

// ================= ΚΙΝΗΣΗ =================
let x = 0;      // θέση Σ1
let v = 0;      // ταχύτητα Σ1

let x2 = 0;     // σχετική θέση Σ2 πάνω στο Σ1
let v2 = 0;     // ταχύτητα Σ2
let slideDir = 0;  // κατεύθυνση ολίσθησης (+1 / -1)

// ================= ΠΑΡΑΜΕΤΡΟΙ =================
let m1, m2, k, mu, E;

// ================= ΣΧΕΔΙΑΣΗ =================
const scale = 300;
const X0 = 260;
const Y = 180;
const W1 = 60, H1 = 24;
const W2 = 40, H2 = 18;

function setup() {
  const c = createCanvas(900, 300);
  c.parent("canvas-holder");

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

  // ===== ΤΑΛΑΝΤΩΣΗ =====
  if (phase === 1) {
    const a = -omega * omega * x;
    v += a * dt;
    x += v * dt;

    if (Math.abs(x) >= xCrit) {
      // ΧΑΝΕΤΑΙ Η ΕΠΑΦΗ → ΠΑΥΣΗ
      phase = 1.5;

      slideDir = Math.sign(x); // προς τα πού "φεύγει" το Σ2
      v = 0;
    }
  }

  // ===== ΟΛΙΣΘΗΣΗ Σ2 =====
  if (phase === 2) {
    const a2 = mu * g * slideDir;
    v2 += a2 * dt;
    x2 += v2 * dt;

    // ΣΤΑΜΑΤΑ όταν μηδενιστεί η ταχύτητα
    if (v2 * slideDir <= 0) {
      v2 = 0;
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (phase === 1.5) {
    fill(200,0,0);
    textSize(22);
    text("Χάσιμο επαφής", width/2 - 90, 35);
  }
}

// ================= ΚΟΥΜΠΙΑ =================
function startMotion() {
  if (phase !== 0) return;

  x = 0;
  x2 = 0;
  v2 = 0;

  v = Math.sqrt(2 * E / (m1 + m2));
  phase = 1;

  lockSliders(true);
}

function resumeMotion() {
  if (phase !== 1.5) return;

  // ξεκινά ολίσθηση από ΗΡΕΜΙΑ λόγω τριβής
  v2 = 0;
  x2 = 0;

  phase = 2;
}

function stopMotion() {
  phase = 0;
  lockSliders(false);
}

function resetSystem() {
  x = 0;
  v = 0;
  x2 = 0;
  v2 = 0;
  phase = 0;

  ESlider.value = 0;
  Ev.textContent = "0";

  lockSliders(false);
}

// ================= UI =================
function readUI() {
  m1 = +m1.value;
  m2 = +m2.value;
  k  = +k.value;
  mu = +mu.value;
  E  = +ESlider.value;

  m1v.textContent = m1;
  m2v.textContent = m2;
  kv.textContent  = k;
  muv.textContent = mu.toFixed(2);
  Ev.textContent  = E.toFixed(1);
}

function lockSliders(lock) {
  ["m1","m2","k","mu","ESlider"].forEach(id=>{
    document.getElementById(id).disabled = lock;
  });
}

// ================= ΣΧΕΔΙΑΣΗ =================
function drawSystem() {
  const X1 = X0 + x * scale;
  const X2 = X1 + x2 * scale;

  // έδαφος
  stroke(0);
  line(0, Y, width, Y);

  // τοίχος
  fill(180);
  rect(770, Y - 70, 25, 70);

  // Σ1
  fill(200,120,120);
  rect(X1 - W1/2, Y - H1, W1, H1);

  // κέντρο μάζας Σ1
  fill(0);
  noStroke();
  ellipse(X1, Y - H1/2, 7, 7);

  // Σ2
  fill(120);
  rect(X2 - W2/2, Y - H1 - H2, W2, H2);

  // === ΕΛΑΤΗΡΙΟ ===
  stroke(0);
  noFill();
  beginShape();

  let springLeft = X1 + W1/2;
  let springRight = 770;
  let yS = Y - H1/2;

  vertex(springLeft, yS);
  for (let i = 1; i <= 16; i++) {
    let t = i / 16;
    let px = lerp(springLeft, springRight, t);
    let py = yS + (i % 2 === 0 ? -10 : 10);
    vertex(px, py);
  }
  vertex(springRight, yS);
  endShape();
}

function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);
  let xp = X0 + xCrit * scale;
  let xm = X0 - xCrit * scale;
  line(xp, Y - 90, xp, Y + 30);
  line(xm, Y - 90, xm, Y + 30);
  drawingContext.setLineDash([]);
}
