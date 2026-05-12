let x = 0, v = 0;
let dragging = false, paused = false, falling = false;
let y2 = 0, v2 = 0;

const mu = 0.5, g = 9.81;

function setup() {
  let c = createCanvas(800, 300);
  c.parent("sketch-holder");

  select("#resume").mousePressed(() => {
    falling = true;
    paused = false;
    select("#resume").attribute("disabled", true);
  });
}

function draw() {
  background(245);

  let m1 = +select("#m1").value();
  let m2 = +select("#m2").value();
  let k  = +select("#k").value();

  select("#m1v").html(m1);
  select("#m2v").html(m2);
  select("#kv").html(k);

  let omega = sqrt(k / (m1 + m2));
  let xcrit = mu * g / (omega * omega);

  if (!dragging && !paused) {
    let a = -omega * omega * x;
    v += a * 0.016;
    x += v * 0.016;

    if (abs(x) >= xcrit) {
      paused = true;
      select("#resume").removeAttribute("disabled");
    }
  }

  if (falling) {
    v2 += g * 0.016;
    y2 += v2;
  }

  drawSystem(x, y2);

  if (paused) {
    fill("red");
    textSize(22);
    text("Χάσιμο επαφής", width/2 - 80, 40);
  }
}

function drawSystem(x, yFall) {
  let X = width/2 + x * 80;
  let Y = 180;

  // Τοίχος
  fill(180);
  rect(700, 120, 30, 80);

  // Ελατήριο (οριζόντιο)
  stroke(0);
  noFill();
  beginShape();
  for (let i = 0; i < 10; i++) {
    let px = lerp(X + 60, 700, i/9);
    let py = Y - 20 + (i % 2 === 0 ? -10 : 10);
    vertex(px, py);
  }
  endShape();

  // Σ1
  fill(200, 120, 120);
  rect(X - 60, Y - 40, 120, 40);

  // Σ2
  fill(120);
  rect(X - 40, Y - 80 + yFall, 80, 40);
}

function mousePressed() {
  if (mouseY < height && !paused) dragging = true;
}

function mouseDragged() {
  if (dragging) {
    x = (mouseX - width/2) / 80;
    v = 0;
  }
}

function mouseReleased() {
  dragging = false;
}
