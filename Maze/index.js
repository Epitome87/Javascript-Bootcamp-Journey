// These are grabbed from Matter, via the Script we import in index.html
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events,
  Mouse,
  MouseConstraint,
} = Matter;

const WIDTH = window.innerWidth * 0.99;
const HEIGHT = window.innerHeight * 0.99;

const engine = Engine.create();
// Disable vertical gravity
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: WIDTH,
    height: HEIGHT,
    wireframes: false,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

const OUTER_WALL_WIDTH = 4;
const WALL_WIDTH = 10;

const walls = createWorldBoundaries();
World.add(world, walls);

const NUM_ROWS = 3;
const NUM_COLS = 3;
const CELL_LENGTH_X = WIDTH / NUM_COLS;
const CELL_LENGTH_Y = HEIGHT / NUM_ROWS;

// Create a 2D array, with each value set to false.
const grid = Array(NUM_ROWS)
  .fill(null)
  .map(() => Array(NUM_COLS).fill(false));

// Verticals array: It has rows = NUM_ROWS and cols = NUM_COLS - 1
const verticals = Array(NUM_ROWS)
  .fill(null)
  .map(() => Array(NUM_COLS - 1).fill(false));

// Horizontals array: It has rows = NUM_ROWS - 1 and cols = NUM_COLS
const horizontals = Array(NUM_ROWS - 1)
  .fill(null)
  .map(() => Array(NUM_COLS).fill(false));

// Step 1: Pick random starting cell
const startRow = Math.floor(Math.random() * NUM_ROWS);
const startCol = Math.floor(Math.random() * NUM_COLS);

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

const stepThroughCell = (row, column) => {
  // If I have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    //  Randomize neighbors (otherwise we'd always visit top one first if possible)
    [row - 1, column, DIRECTION.UP], // Top neighbor: row-1, col
    [row, column + 1, DIRECTION.RIGHT], // Right neighbor: row, col+1
    [row + 1, column, DIRECTION.DOWN], // Bottom neighbor: row+1, col
    [row, column - 1, DIRECTION.LEFT], // Left neighbor: row, col-1
  ]);

  // For each neighboor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, nextDirection] = neighbor;

    // See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= NUM_ROWS ||
      nextColumn < 0 ||
      nextColumn >= NUM_COLS
    ) {
      continue;
    }

    // If we have visisted that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove a wall from either horizontals or verticals
    if (nextDirection === DIRECTION.LEFT) {
      verticals[row][column - 1] = true;
    } else if (nextDirection === DIRECTION.RIGHT) {
      verticals[row][column] = true;
    } else if (nextDirection === DIRECTION.UP) {
      horizontals[row - 1][column] = true;
    } else if (nextDirection === DIRECTION.DOWN) {
      horizontals[row][column] = true;
    }

    // Visit that next cell (call stepThrough again)
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startCol);

// Turn the Verticals into Walls!
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    // Render a wall
    // X: UnitLength * column + UnitLength/2
    // Y: UnitLength * row + UnitLength
    const wall = Bodies.rectangle(
      columnIndex * CELL_LENGTH_X + CELL_LENGTH_X,
      CELL_LENGTH_Y * rowIndex + CELL_LENGTH_Y / 2,
      WALL_WIDTH,
      CELL_LENGTH_Y,
      { label: 'wall', isStatic: true, render: { fillStyle: 'red' } }
    );
    World.add(world, wall);
  });
});

// Turn the Horizontals into Walls!
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    // Render a wall
    // X: UnitLength * column + UnitLength/2
    // Y: UnitLength * row + UnitLength
    const wall = Bodies.rectangle(
      columnIndex * CELL_LENGTH_X + CELL_LENGTH_X / 2,
      CELL_LENGTH_Y * rowIndex + CELL_LENGTH_Y,
      CELL_LENGTH_X,
      WALL_WIDTH,
      { label: 'wall', isStatic: true, render: { fillStyle: 'red' } }
    );
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  WIDTH - CELL_LENGTH_X / 2,
  HEIGHT - CELL_LENGTH_Y / 2,
  CELL_LENGTH_X * 0.5,
  CELL_LENGTH_Y * 0.5,
  { label: 'goal', isStatic: true, render: { fillStyle: 'gold' } }
);
World.add(world, goal);

// Ball (player)
const ballRadius = Math.min(CELL_LENGTH_X, CELL_LENGTH_Y) * 0.25;
const ball = Bodies.circle(CELL_LENGTH_X / 2, CELL_LENGTH_Y / 2, ballRadius, {
  label: 'ball',
  render: { fillStyle: 'blue' },
});
World.add(world, ball);

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity;

  if (event.code === 'KeyW') {
    Body.setVelocity(ball, { x, y: y - 5 });
  } else if (event.code === 'KeyS') {
    Body.setVelocity(ball, { x, y: y + 5 });
  }

  if (event.code === 'KeyD') {
    Body.setVelocity(ball, { x: x + 5, y: y });
  } else if (event.code === 'KeyA') {
    Body.setVelocity(ball, { x: x - 5, y: y });
  }
});

// Win condition: Collision between Player and Goal
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });

      document.querySelector('.winner').classList.remove('hidden');
    }
  });
});

function createWorldBoundaries() {
  return [
    Bodies.rectangle(WIDTH / 2, 0, WIDTH, OUTER_WALL_WIDTH, {
      isStatic: true,
    }), // Top
    Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, OUTER_WALL_WIDTH, {
      isStatic: true,
    }), // Bottom
    Bodies.rectangle(
      0,
      HEIGHT / 2,
      OUTER_WALL_WIDTH,
      HEIGHT - OUTER_WALL_WIDTH,
      {
        isStatic: true,
      }
    ), // Left
    Bodies.rectangle(
      WIDTH,
      HEIGHT / 2,
      OUTER_WALL_WIDTH,
      HEIGHT - OUTER_WALL_WIDTH,
      {
        label: 'boundary',
        isStatic: true,
      }
    ), // Right
  ];
}

// Creating random shapes
function createRandomShapes(numShapes) {
  for (let i = 0; i < numShapes; i++) {
    const randomX = Math.floor(Math.random() * WIDTH);
    const randomY = Math.floor(Math.random() * HEIGHT);
    const randomSize = Math.floor(Math.random() * 25) + 25;
    if (Math.random() > 0.5) {
      World.add(
        world,
        Bodies.rectangle(randomX, randomY, randomSize, randomSize, {
          isStatic: false,
        })
      );
    } else {
      World.add(
        world,
        Bodies.circle(randomX, randomY, randomSize, {
          isStatic: false,
          // render: { fillStyle: 'red' },
        })
      );
    }
  }
}
