const THETA = Math.PI / 4; // looks really cool with 90 deg (pi/2)
const LENGTH_SPEED_MULTIPLIER = 0.0003;
const LENGTH_BRANCH_CUTOFF = 2;

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function flipCoin() {
  return Math.random() >= 0.5;
}

// returns the current rotation in radians, ranged [0, 2π]
function getRotation(ctx) {
  let t = getTransform(ctx);
  let rad = Math.atan2(t.b, t.a);
  if (rad < 0) { // angle is > Math.PI
    rad += Math.PI * 2;
  }
  return rad;
}

function getCurrentPoint(ctx) {
  let t = getTransform(ctx);
  return [t.e, t.f];
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
    return {a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5]};
  }
}

// TODO: use glMatrix or other matrix solution to avoid instantiating multiple canvases (esp since we could just be writing to one)
async function doBranch(initialLength, color, origin, initialAngle) {
  let paths = [];
  let lastRotation = 0;
  let currentRotation = 0;
  let currentStartingPoint = [0,0];
  let lastStartingPoint = [CANVAS_WIDTH, CANVAS_HEIGHT];

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.className = "mycelium-canvas";

  const context = canvas.getContext("2d");

  // move to indicated origin for initial branch
  context.translate(...origin);
  context.rotate(initialAngle);

  currentRotation = getRotation(context);

  await branch(context, initialLength, initialAngle);

  async function branch(context, length, angle) {
    currentStartingPoint = getCurrentPoint(context);

    doActualPath(context, length, angle);

    // Each branch’s length shrinks by approximately two-thirds (randomized).
    length *= getRandomArbitrary(0.5, 0.7);

    if (length > LENGTH_BRANCH_CUTOFF) {
      // determine based on probability if it goes right or left
      const branchesLeft = flipCoin();
      const branchesRight = flipCoin();
      const branchesCenter = flipCoin();
      const branchesAnother = flipCoin();

      if (branchesRight) {
        const rightAngle = THETA + getRandomArbitrary(0.0, 0.3);
        await doRotation(context, length, rightAngle);

        //todo: freezes when i enable this-- not infinite recursion, but exponentially more to calculate -- reaching limits of the canvas
        // const another = THETA*2 + getRandomArbitrary(0.0, 0.3);
        // await doRotation(context, length, another);
      }

      if (branchesLeft) {
        const leftAngle = -THETA - getRandomArbitrary(0.0, 0.3);
        await doRotation(context, length, leftAngle);

        // const another = -THETA*2 - getRandomArbitrary(0.0, 0.3);
        // await doRotation(context, length, another);
      }

      if (branchesCenter) {
        const centerAngle = THETA * 2 + getRandomArbitrary(0.0, 0.3);
        await doRotation(context, length, centerAngle);
      }

      if (branchesAnother) {
        const anotherAngle = -THETA * 2 + getRandomArbitrary(0.0, 0.3);
        await doRotation(context, length, anotherAngle);
      }


    }
  }

  async function doRotation(context, length, angle) {
    // draw left side
    lastRotation = getRotation(context);
    lastStartingPoint = getCurrentPoint(context);
    context.save();
    context.rotate(angle);
    currentRotation = getRotation(context);
    await branch(context, length, angle);
    context.restore();
    currentRotation = lastRotation;
    currentStartingPoint = lastStartingPoint;
  }

  function doActualPath(context, length) {
    let newFrom = currentStartingPoint;

    const newTo = [
      currentStartingPoint[0] + (length * Math.sin(currentRotation)),
      currentStartingPoint[1] - (length * Math.cos(currentRotation))
    ];

    console.log("length", length);
    console.log("currentRotation", currentRotation);
    console.log(`new path from ${newFrom} to ${newTo}`);

    paths.push([newFrom, newTo, length]);

    context.translate(0, -length);
    currentStartingPoint = getCurrentPoint(context);
  }

  // return paths array so we can combine and draw it all in one pass
  return paths;
}

async function doMultipleBranches(params, numIterations) {
  let [initialLength, color, origin, initialAngle] = params;
  let startingPoint = origin;
  let paths = [];
  for (let i = 0; i < numIterations; i++) {
    const newAngle = initialAngle + ((Math.PI/4) * i);
    const latestPaths = await doBranch(initialLength, color, startingPoint, newAngle);
    startingPoint = latestPaths[latestPaths.length-1][1];
    paths = [...paths, ...latestPaths];
  }

  drawPaths(paths, color);
}

function drawPaths(paths, color) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.className = "mycelium-canvas";
  const context = canvas.getContext("2d");
  document.body.appendChild(canvas);

  context.strokeStyle = color;

  const timeline = gsap.timeline();

  paths.forEach(path => {
    const [from, to, length] = path;
    let animPoint = {x: from[0], y: from[1]};
    timeline.to(animPoint, length * LENGTH_SPEED_MULTIPLIER, {
      x: to[0],
      y: to[1],
      onUpdate: () => {
        context.beginPath();
        context.moveTo(from[0], from[1]);
        context.lineTo(animPoint.x, animPoint.y);
        context.stroke();
      }
    });
  });
}

async function init() {
  const ORIGIN = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
  
  // pit multiple branches against each other, for 3d density effect
  await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, 0], 32);
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, 0], 32);
  //
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, Math.PI / 4], 2);
  //
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, 3 * Math.PI / 4], 2);
  //
  await doMultipleBranches([CANVAS_HEIGHT / 8, "brown", ORIGIN, Math.PI], 32);
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "brown", ORIGIN, Math.PI], 32);
  //
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, 5 * Math.PI / 4], 2);
  //
  // await doMultipleBranches([CANVAS_HEIGHT / 8, "black", ORIGIN, 7 * Math.PI / 4], 2);

  // todo start new branches off the end of old ones
  // await doMultipleBranches([50, "green", ORIGIN, Math.PI / 4], 3);
  // await doMultipleBranches([50, "green", ORIGIN, 3 * Math.PI / 4], 3);
  // await doMultipleBranches([55, "blue", ORIGIN, Math.PI], 3);
  // await doMultipleBranches([50, "green", ORIGIN, 5 * Math.PI / 4], 3);
  // await doMultipleBranches([50, "green", ORIGIN, 7 * Math.PI / 4], 3);
}

init();