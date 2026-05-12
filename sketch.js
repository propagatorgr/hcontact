<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <title>Ταλάντωση με τριβή και απώλεια επαφής</title>

  <script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>
  <script src="sketch.js" defer></script>

  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin: 20px;
    }
    #canvas-holder {
      margin: 0 auto;
    }
    #controls {
      margin: 15px auto;
      width: 900px;
    }
    .sliderBlock {
      margin: 8px 0;
    }
    label {
      display: inline-block;
      width: 140px;
      text-align: right;
      margin-right: 10px;
    }
    input[type=range] {
      width: 300px;
    }
    button {
      margin: 10px;
      padding: 6px 14px;
      font-size: 14px;
    }
  </style>
</head>

<body>

  <div id="canvas-holder"></div>

  <div id="controls">
    <div class="sliderBlock">
      <label>m₁ (kg)</label>
      <input type="range" id="m1" min="1" max="8" step="0.5" value="4">
      <span id="m1v">4</span>
    </div>

    <div class="sliderBlock">
      <label>m₂ (kg)</label>
      <input type="range" id="m2" min="1" max="8" step="0.5" value="2">
      <span id="m2v">2</span>
    </div>

    <div class="sliderBlock">
      <label>k (N/m)</label>
      <input type="range" id="k" min="100" max="500" step="10" value="200">
      <span id="kv">200</span>
    </div>

    <div class="sliderBlock">
      <label>μ</label>
      <input type="range" id="mu" min="0.1" max="1" step="0.05" value="0.5">
      <span id="muv">0.50</span>
    </div>

    <hr>

    <div class="sliderBlock">
      <label>Ενέργεια Ε (J)</label>
      <input type="range" id="E" min="0" max="20" step="0.2" value="0">
      <span id="Ev">0</span>
    </div>
    <div>
    <button id="startBtn">START</button>
    <button id="resetBtn">RESET</button>
  </div>

</body>
</html>

