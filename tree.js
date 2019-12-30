const THETA = Math.PI / 8;
const LENGTH_SPEED_MULTIPLIER = 0.003;
const LENGTH_BRANCH_CUTOFF = 0.8;

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
  let lastStartingPoint = [800, 600];

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.className = "mycelium-canvas";

  const context = canvas.getContext("2d");

  // move to indicated origin for initial branch
  context.translate(...origin);
  context.rotate(initialAngle);

  currentRotation = getRotation(context);

  document.body.appendChild(canvas);

  await branch(context, initialLength, initialAngle);

  // clear out all the relative stuff so we can draw the absolute points
  context.strokeStyle = color;
  context.resetTransform();

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

  async function branch(context, length, angle) {
    currentStartingPoint = getCurrentPoint(context);

    doActualPath(context, length, angle);

    // Each branch’s length shrinks by approximately two-thirds (randomized).
    length *= getRandomArbitrary(0.8, 0.95);

    if (length > LENGTH_BRANCH_CUTOFF) {
      // determine based on probability if it goes right or left
      const branchesLeft = flipCoin();
      const branchesRight = flipCoin();

      if (branchesRight) {
        // draw right side
        lastRotation = getRotation(context);
        lastStartingPoint = getCurrentPoint(context);
        context.save();
        context.rotate(THETA);
        currentRotation = getRotation(context);
        await branch(context, length, THETA + getRandomArbitrary(0.0, 0.3));
        context.restore();
        currentRotation = lastRotation;
        currentStartingPoint = lastStartingPoint;
      }

      if (branchesLeft) {
        // draw left side
        lastRotation = getRotation(context);
        lastStartingPoint = getCurrentPoint(context);
        context.save();
        context.rotate(-THETA);
        currentRotation = getRotation(context);
        await branch(context, length, -THETA - getRandomArbitrary(0.0, 0.3));
        context.restore();
        currentRotation = lastRotation;
        currentStartingPoint = lastStartingPoint;
      }
    }

    // return the last point so we can start another hypha from there
    return getCurrentPoint(context);
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

}

async function doMultipleBranches(params, numIterations) {
  for (let i = 0; i < numIterations; i++) {
    await doBranch(...params);
  }
}

async function init() {
  // pit multiple branches against each other, for 3d density effect
  await doMultipleBranches([55, "red", [400, 300], 0], 3);

  // todo start new branches off the end of old ones

  await doBranch(50, "green", [400, 300], Math.PI / 4);
  await doBranch(50, "green", [400, 300], 3 * Math.PI / 4);
  await doBranch(55, "blue", [400, 300], Math.PI);
  await doBranch(50, "green", [400, 300], 5 * Math.PI / 4);
  await doBranch(50, "green", [400, 300], 7 * Math.PI / 4);
}

init();