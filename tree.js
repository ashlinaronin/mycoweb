const theta = 0.65;

function branch(context, length) {
  context.strokeStyle = "green";

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, -length);
  context.stroke();
  context.moveTo(0, -length);
  context.translate(0, -length);

  // Each branch’s length shrinks by two-thirds.
  length *= 0.66;

  console.log(length);

  if (length > 2) {
    // draw left side
    context.save();
    context.rotate(theta);
    // Subsequent calls to branch() include the length argument.
    branch(context, length);
    context.restore();

    // draw right side
    context.save();
    context.rotate(-theta);
    branch(context, length);
    context.restore();
  }
}

function init() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.className = "mycelium-canvas";

  const context = canvas.getContext("2d");

  // move to bottom center for initial branch
  context.translate(400, 600);

  branch(context, 160);

  document.body.appendChild(canvas);
}

init();