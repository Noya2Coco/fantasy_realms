// Initialisation de Matter.js
const { Engine, Render, Runner, World, Bodies, Body, Constraint } = Matter;

const width = window.innerWidth;  // Prendre toute la largeur de la fenêtre
const height = window.innerHeight;  // Prendre toute la hauteur de la fenêtre
const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Sol, murs et buts
const ground = Bodies.rectangle(width / 2, height, width, 20, { isStatic: true, render: { fillStyle: "green" } });
const leftWall = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true });
const rightWall = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true });

// Position des cages de but (alignées avec la position des joueurs)
const goalHeight = height - 50;  // Même niveau que les joueurs

const leftGoalVertical = Bodies.rectangle(10, goalHeight - 30, 10, 150, { isStatic: true, render: { fillStyle: "white" } });
const leftGoalHorizontal = Bodies.rectangle(30, goalHeight - 105, 50, 10, { isStatic: true, render: { fillStyle: "white" } });

const rightGoalVertical = Bodies.rectangle(width - 10, goalHeight - 30, 10, 150, { isStatic: true, render: { fillStyle: "white" } });
const rightGoalHorizontal = Bodies.rectangle(width - 30, goalHeight - 105, 50, 10, { isStatic: true, render: { fillStyle: "white" } });

World.add(world, [ground, leftWall, rightWall, leftGoalVertical, leftGoalHorizontal, rightGoalVertical, rightGoalHorizontal]);

// Joueurs (demi-cercles)
function createPlayer(x) {
    return Bodies.circle(x, height - 50, 30, { restitution: 0.6 });
}
const player1 = createPlayer(200);
const player2 = createPlayer(600);
World.add(world, [player1, player2]);

// Ballon de football
const ball = Bodies.circle(width / 2, height / 2, 20, { restitution: 0.8, frictionAir: 0.01 });
World.add(world, ball);

// Contrôles
document.addEventListener("keydown", (event) => {
    const force = 0.05;
    if (event.key === "ArrowLeft") Body.applyForce(player2, player2.position, { x: -force, y: 0 });
    if (event.key === "ArrowRight") Body.applyForce(player2, player2.position, { x: force, y: 0 });
    if (event.key === "ArrowUp") Body.applyForce(player2, player2.position, { x: 0, y: -force });

    if (event.key === "a") Body.applyForce(player1, player1.position, { x: -force, y: 0 });
    if (event.key === "d") Body.applyForce(player1, player1.position, { x: force, y: 0 });
    if (event.key === "w") Body.applyForce(player1, player1.position, { x: 0, y: -force });

    // Lancer le ballon avec la barre d'espace
    if (event.key === " ") {
        Body.applyForce(ball, ball.position, { x: 0.1, y: -0.1 });
    }
});
