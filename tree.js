const theta = 0.65;
const paths = [
  [
    [0, 0], //from
    [400, 600], //to
    160, // length // todo this may be redundant, but trying it
    0 // angle
  ]
];

let currentLength = 160;
let lastRotation = 0;
let currentRotation = 0;
let currentStartingPoint = [400,600];
let lastStartingPoint = [0,0];

async function branch(context, length, angle = 0) {
  context.strokeStyle = "green";

  doActualPath(context, length, angle);

  // Each branch’s length shrinks by two-thirds.
  length *= 0.66;

  // hmm?
  currentLength = length;
  // currentStartingPoint = paths[paths.length-1][0];

  console.log(length);

  // changing constant for testing - was 2
  if (length > 60) {
    // draw left side
    lastRotation = getRotation(context);
    lastStartingPoint = getCurrentPoint(context);
    context.save();
    context.rotate(theta);
    currentRotation = getRotation(context);
    currentStartingPoint = getCurrentPoint(context);
    // Subsequent calls to branch() include the length argument.
    await branch(context, length, theta);
    context.restore();
    currentRotation = lastRotation;
    currentStartingPoint = lastStartingPoint;

    // draw right side
    lastRotation = getRotation(context);
    lastStartingPoint = getCurrentPoint(context);
    context.save();
    context.rotate(-theta);
    currentRotation = getRotation(context);
    currentStartingPoint = getCurrentPoint(context);
    await branch(context, length, -theta);
    context.restore();
    currentRotation = lastRotation;
    currentStartingPoint = lastStartingPoint;
  }
}

// returns the current rotation in radians, ranged [0, 2π]
function getRotation(ctx) {
  let t = getTransform(ctx);
  debugger;
  let rad = Math.atan2(t.b, t.a);
  if (rad < 0) { // angle is > Math.PI
    rad += Math.PI * 2;
  }
  return rad;
}

function getCurrentPoint(ctx) {
  let t = getTransform(ctx);
  debugger;
  return [t.e,t.f];
}

function getTransform(ctx) {
  if ('getTransform' in ctx) {
    return ctx.getTransform();
  }

  if ('currentTransform' in ctx) {
    return ctx.currentTransform
  }
  // restructure FF's array to an Matrix like object
  else if (ctx.mozCurrentTransform) {
    let a = ctx.mozCurrentTransform;
    return {a:a[0], b:a[1], c:a[2], d:a[3], e:a[4], f:a[5]};
  }
}


function doActualPath(context, length, angle) {
  const [lastFrom, lastTo, lastLength, lastAngle] = paths[paths.length-1];

  let newFrom = currentStartingPoint;

  // if (paths.length > 1 && length === lastLength) {
  //   debugger;
  //   newFrom = lastFrom;
  // }

  const newTo = [
    lastTo[0] + (length * Math.sin(currentRotation)),
    lastTo[1] - (length * Math.cos(currentRotation))
  ];

  console.log(`new path from ${newFrom} to ${newTo}`);

  paths.push([newFrom, newTo, length, currentRotation]);

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

  await branch(context, currentLength);

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