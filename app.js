const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Configuration varialbes
//cells: either the number of cells in the horizontal edge or the vertical edge
const cellsHorizontal = 20;
const cellsVertical = 15;
// Defining the width and the height of the canvas to randomize the starting position of our random shapes
const width = window.innerWidth;
const height = window.innerHeight;
// Unit length is saying that every cell that we create is going to be this many units tall and this many units wide
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

// Create a new Engine
const engine = Engine.create();
// Disabling gravity
engine.world.gravity.y = 0;
// World got created when a new Engine was created, so we can destructure a World from our engine
const { world } = engine;

// Create a new Render
const render = Render.create({
    element: document.body,
    //element: tells Matter.js where we want to show our drawing of the World inside the DOM
    engine: engine,
    options: {
        //turning off the wireframe mode
        wireframes: false,
        //keys and values are the same so we can just write width, height
        width,
        height
        //unit: px
    }
});
// Running render
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }), //top
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }), //bottom
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }), //left
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }) //right
];
World.add(world, walls);

// Maze generation
// List of coordinate pairs shuffling function
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        // Random index inside the array
        const index = Math.floor(Math.random() * counter);
        counter--;
        // Swapping
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    };
    return arr;
};

// Option 1: using for loop
// const grid = [];
// for (let i = 0; i < 3; i++) {
//     grid.push([]);
//     for (let j = 0; j < 3; j++) {
//         grid[i].push(false);
//     };
// };
// console.log(grid);

// Option 2:
// Create an empty array that has three possibles place in it
const grid = Array(cellsVertical).fill(null) //row
    .map(() => Array(cellsHorizontal).fill(false)); //column

// Verticals
const verticals = Array(cellsVertical).fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

// Horizontals
const horizontals = Array(cellsVertical - 1).fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

// Gernerating a random number to pick a starting cell
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// Step through maze algorithm function
const stepThroughCell = (row, column) => {
    // If we have visited the cell at [row, column], then return
    if (grid[row][column] === true) {
        return;
    };
    // Mark this cell as being visited: meaning we want to go into that grid array and update some element inside of it to true
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        // Coordinate pairs of all the neighbors
        [row - 1, column, 'up'], //up
        [row, column + 1, 'right'], //right
        [row + 1, column, 'down'], //down
        [row, column - 1, 'left'] //left
    ]);
    // For each neighbor... (iteration)
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // nextRow and nextColumn is basically the cell that that we are thinking about visiting next

        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        };
        // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        };
        // Remove a wall from either horizontals or verticals array
        // left or right
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        }
        // up or down
        else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        };

        stepThroughCell(nextRow, nextColumn);
    };
    // Visit that next cell
};

stepThroughCell(startRow, startColumn);

// Iterating over walls
// Horizontals
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        };
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2, //X-distance from the origin
            rowIndex * unitLengthY + unitLengthY, //Y-distance from the origin
            unitLengthX, //Width of the rectangle
            5, //Height of the rectangle
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'blue'
                }
            }
        );
        World.add(world, wall);
    });
});
// Verticals
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        };
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5, //Width of the rectangle
            unitLengthY, //Height of the rectangle
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'blue'
                }
            }
        );
        World.add(world, wall);
    });
});

// Drawing goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX / 2,
    unitLengthY / 2,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Drawing ball
// Find which ever is smaller then divide it by 4
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        isStatic: false,
        label: 'ball',
        render: {
            fillStyle: 'yellow'
        }
    }    
);
World.add(world, ball);

// Adding a keydown event listener
document.addEventListener('keydown', (evt) => {
    const { x, y } = ball.velocity;
    // W, up
    if (evt.keyCode === 87) {
        // Body.setVelocity: setting the velocity
        Body.setVelocity(ball, { x, y: y - 5 });
        // We are subtracting 5 because we want to move the ball in the up direction, and to move it up, we want to have a negative velocity
    }
    // A, left
    if (evt.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y });
    }
    // S, down
    if (evt.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    // D, right
    if (evt.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y });
    }
});

// Win condition
Events.on(engine, 'collisionStart', (evt) => {
    evt.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach((body) => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                };
            });
        };
    });
});