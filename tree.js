const theta = 0.65;
const paths = [
  [
    [0, 0],
    [400, 600],
    0
  ]
];

async function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function branch(context, length, angle = 0) {
  context.strokeStyle = "green";

  // await wait(50);

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

    // // draw right side
    // context.save();
    // context.rotate(-theta);
    // await branch(context, length, -theta);
    // context.restore();
  }
}

function doActualPath(context, length, angle) {
  debugger;

  const lastPath = paths[paths.length-1];

  // starting from where the last line ended
  const newFrom = lastPath[1];
  const newAngle = lastPath[2] + angle;

  console.log("angle", angle);
  console.log("sine", Math.sin(angle));

  console.log("cos", Math.cos(angle));


  const newTo = [
    lastPath[1][0] + (length * Math.sin(newAngle)),
    lastPath[1][1] - (length * Math.cos(newAngle))
  ];
  // const newFrom = lastPath[0];

  console.log(`new path from ${newFrom} to ${newTo}`);

  paths.push([newFrom, newTo, newAngle]);

  console.log(paths);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, -length);
  context.stroke();
  context.moveTo(0, -length);
  context.translate(0, -length);
}

async function init() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.className = "mycelium-canvas";

  const context = canvas.getContext("2d");

  // move to bottom center for initial branch
  context.translate(400, 600);

  document.body.appendChild(canvas);

  await branch(context, 160);

  // clear out all the relative stuff so we can draw the absolute points
  context.strokeStyle = "red";
  context.resetTransform();

  // remove first (dummy) element from paths before drawing
  paths.shift();

  paths.forEach(path => {
    drawSavedPath(context, path[0], path[1]);
  });
}

function drawSavedPath(context, [x1,y1], [x2,y2]) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

init();