let m1Slider, m2Slider, kSlider;
let resumeBtn;

let x = 0;
let v = 0;
let dragging = false;
let paused = false;
let falling = false;

const mu = 0.5;
const g = 9.81;

let y2 = 0;
let v2 = 0;

function setup() {
  let c = createCanvas(700, 300);
  c.parent(document.body);

  m1Slider = select('#m1');
  m2Slider = select('#m2');
  kSlider = select('#k');
  resumeBtn = select('#resume');

  resumeBtn.mousePressed(resumeMotion);
}

function draw() {
  background(240);

  let m1 = m1Slider.value();
  let m2 = m2Slider.value();
  let k = kSlider.value();

  select('#m1val').html(m1);
  select('#m2val').html(m2);
  select('#kval').html(k);

  let omega = sqrt(k / (m1 + m2));
  let xcrit = mu * g / (omega * omega);

  // --- Κίνηση ---
  if (!dragging && !paused) {
    let a = -omega * omega * x;
    v += a * 0.016;
    x += v * 0.016;

    if (abs(x) >= xcrit) {
      paused = true;
      resumeBtn.attribute('disabled', false);
    }
  }

  // --- Πτώση Σ2 ---
  if (falling) {
    v2 += g * 0.016;
    y2 += v2 * 0.016 * 50;
  }

  drawSystem(x, y2);

  if (paused) {
    fill('red');
    textSize(22);
    textAlign(CENTER);
    text("Χάσιμο επαφής", width / 2, 40);
  }
}

function drawSystem(x, yDrop) {
  let baseX = width / 2 + x * 80;
  let baseY = 180;

  // Σ1
  fill(200, 120, 120);
  rect(baseX - 60, baseY - 40, 120, 40);

  // Σ2
  fill(120);
  rect(baseX - 40, baseY - 80 + yDrop, 80, 40);

  // ελατήριο
  stroke(0);
  line(baseX + 60, baseY - 20, width - 50, baseY - 20);
}

function mousePressed() {
  if (mouseY > 100 && !paused) dragging = true;
}

function mouseDragged() {
  if (dragging) {
    x = (mouseX - width / 2) / 80;
    v = 0;
  }
}

function mouseReleased() {
  dragging = false;
}

function resumeMotion() {
  falling = true;
  paused = false;
  resumeBtn.attribute('disabled', true);
}
