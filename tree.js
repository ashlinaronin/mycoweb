const theta = 0.65;
const paths = [
  [
    [400, 600],
    [0, 0]
  ]
];

async function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function branch(context, length, angle = 0) {
  context.strokeStyle = "green";

  await wait(50);

  doActualPath(context, length, angle);

  // Each branch’s length shrinks by two-thirds.
  length *= 0.66;

  console.log(length);

  if (length > 2) {
    // draw left side
    context.save();
    context.rotate(theta);
    // Subsequent calls to branch() include the length argument.
    await branch(context, length, theta);
    context.restore();

    // draw right side
    context.save();
    context.rotate(-theta);
    await branch(context, length, -theta);
    context.restore();
  }
}

function doActualPath(context, length, angle) {
  debugger;

  const lastPath = paths[paths.length-1];

  const newTo = [
    lastPath[0][0] + length * Math.cos(angle),
    lastPath[0][1] + length * Math.sin(angle)
  ];
  const newFrom = lastPath[0];

  console.log(`new path from ${newFrom} to ${newTo}`);

  paths.push([newFrom, newTo]);

  console.log(paths);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, -length);
  context.stroke();
  context.moveTo(0, -length);
  context.translate(0, -length);
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