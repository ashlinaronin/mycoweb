drawMycelium();

function drawMycelium() {
  const canvas = document.createElement('canvas');

  canvas.width = 800;
  canvas.height = 600;

  canvas.className = "mycelium-canvas";

  debugger;

  fract = new Fractal.HTree(canvas, {x: 0, y: 0}, 14, "black", "rgba(91,0,144,0.3)", true);

  start = {x: canvas.width / 2, y: canvas.height};
  target = {x: canvas.width / 4, y: canvas.height / 7};
  var htreeAnim = new Fractal.Animation(fract, start, target);

  htreeAnim.skip(2000);

  document.body.appendChild(canvas);
}
