// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;
const dt = 0.016;

// ================= ΚΑΤΑΣΤΑΣΗ =================
let x = 0;
let v = 0;
let running = false;
let paused = false;

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

  startBtn.onclick = startMotion;
  stopBtn.onclick  = stopMotion;
  resetBtn.onclick = resetSystem;
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
      showLoss();
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();
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

  ESlider.value = 0;
  Ev.textContent = "0";

  lockSliders(false);
}

function lockSliders(lock) {
  m1.disabled = lock;
  m2.disabled = lock;
  k.disabled  = lock;
  mu.disabled = lock;
  ESlider.disabled = lock;
}

function readUI() {
  m1 = +m1El.value;
  m2 = +m2El.value;
  k  = +kEl.value;
  mu = +muEl.value;
  E  = +ESlider.value;

  m1v.textContent = m1;
  m2v.textContent = m2;
  kv.textContent  = k;
  muv.textContent = mu.toFixed(2);
  Ev.textContent  = E.toFixed(1);
}
