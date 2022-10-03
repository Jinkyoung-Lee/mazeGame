const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;
//MouseContraint: means that we are going to set up something to respond directly to mouse input

// Defining the width and the height of the canvas to randomize the starting position of our random shapes
const width = 800;
const height = 600;

// Create a new Engine
const engine = Engine.create();
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

// Mouse constraint
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// // Adding shapes to World
// const shape = Bodies.rectangle(200, 200, 50, 150, {
//     isStatic: true
//     // isStatic: going to make the shape stay exactly where it is
// });
// World.add(world, shape);

// Walls
const walls = [
    Bodies.rectangle(400, 0, 800, 40, { isStatic: true }), //top
    Bodies.rectangle(400, 600, 800, 40, { isStatic: true }), //bottom
    Bodies.rectangle(0, 300, 40, 600, { isStatic: true }), //left
    Bodies.rectangle(800, 300, 40, 600, { isStatic: true }) //right
];
World.add(world, walls);

// Random shapes
for (let i = 0; i < 40; i++) {
    if (Math.random() > 0.5) {
        World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50));
    } else {
        World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, 35, {
            render: {
                fillStyle: 'red'
                //the color can be any CSS valid color, it can be name of the color or the hex color, and so on
            }
        }));
        //the 3rd argument for .circle() is radius of the circle that we are creating
    }
};