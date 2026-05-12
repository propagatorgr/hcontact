// ================= ΣΤΑΘΕΡΕΣ =================
const g = 9.81;

// ================= ΚΑΤΑΣΤΑΣΗ =================
let x = 0;
let v = 0;
let dragging = false;
let paused = false;

// φυσικές παράμετροι (από sliders)
let m1 = 4;
let m2 = 2;
let k  = 200;
let mu = 0.5;

// ================= ΣΧΕΔΙΑΣΗ =================
const scale = 300;
const X0 = 260;
const Y  = 180;

// διαστάσεις σωμάτων (Λύση Α)
const W1 = 60, H1 = 24;
const W2 = 40, H2 = 18;

function setup() {
  let c = createCanvas(900, 300);
 c.parent("canvas-holder");
}

function draw() {
  background(245);

  // ---- ανάγνωση sliders ----
  readSliders();

  // ---- υπολογισμοί ----
  let omega = Math.sqrt(k / (m1 + m2));
  let xCrit = mu * g / (omega * omega);

  // ---- φυσική ----
  if (!paused && !dragging) {
    let a = -omega * omega * x;
    v += a * 0.016;
    x += v * 0.016;

    // έλεγχος στο άκρο
    if (Math.abs(v) < 0.002 && Math.abs(x) >= xCrit) {
      paused = true;
    }
  }

  drawCriticalLines(xCrit);
  drawSystem();

  if (paused) {
    fill(200, 0, 0);
    textSize(22);
    text("Χάσιμο επαφής", width/2 - 90, 35);
  }
}

// ================= ΣΧΕΔΙΑΣΗ =================
function drawSystem() {
  let X = X0 + x * scale;

  stroke(0);
  line(0, Y, width, Y);

  fill(180);
  rect(770, Y - 70, 25, 70);

  // Σ1
  fill(200,120,120);
  rect(X - W1/2, Y - H1, W1, H1);

  // κέντρο μάζας
  fill(0);
  noStroke();
  ellipse(X, Y - H1/2, 7, 7);

  // Σ2
  fill(120);
  rect(X - W2/2, Y - H1 - H2, W2, H2);

  // ελατήριο
  let xL = X + W1/2;
  let xR = 770;
  let yS = Y - H1/2;

  noFill();
  stroke(0);
  beginShape();
  vertex(xL, yS);
  for (let i = 1; i <= 16; i++) {
    let t = i / 16;
    let px = lerp(xL, xR, t);
    let py = yS + (i % 2 === 0 ? -10 : 10);
    vertex(px, py);
  }
  vertex(xR, yS);
  endShape();

  stroke(0,150);
  line(X0, Y+5, X0, Y+30);
  noStroke();
  fill(0);
  text("O", X0-5, Y+45);
}

// ================= ΟΡΙΑ =================
function drawCriticalLines(xCrit) {
  stroke(0,120);
  drawingContext.setLineDash([6,6]);

  let xp = X0 + xCrit * scale;
  let xm = X0 - xCrit * scale;

  line(xp, Y-90, xp, Y+30);
  line(xm, Y-90, xm, Y+30);

  drawingContext.setLineDash([]);
}

// ================= SLIDERS =================
function readSliders() {
  m1 = +document.getElementById("m1Slider").value;
  m2 = +document.getElementById("m2Slider").value;
  k  = +document.getElementById("kSlider").value;
  mu = +document.getElementById("muSlider").value;

  document.getElementById("m1Val").innerText = m1;
  document.getElementById("m2Val").innerText = m2;
  document.getElementById("kVal").innerText  = k;
  document.getElementById("muVal").innerText = mu.toFixed(2);
}

// ================= ΠΟΝΤΙΚΙ =================
function mousePressed() {
  if (mouseY > Y - 80 && mouseY < Y && !paused) {
    dragging = true;
    x = random(-0.3, 0.3);
    v = 0;
  }
}

function mouseDragged() {
  if (dragging) {
    x = (mouseX - X0) / scale;
    v = 0;
  }
}

function mouseReleased() {
  dragging = false;
}
