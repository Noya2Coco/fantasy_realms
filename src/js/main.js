import { Engine, Scene, FreeCamera, Vector3 } from 'babylonjs';
import { Skydome } from './skybox.js';
import { createSceneAxis, createMeshAxis, createSceneAxisIndicator } from './axis.js';
import { Mouse } from './controlsManager/mouse.js';
import { updateShipMovement, setupKeyboardControls } from './keyboardControl.js';
import { createPlanet } from './planet.js';
import { drawFpsGraph } from './graph.js';
import { toggleInfoVisibility } from './utils.js';
import { Ship } from './ship.js';
import { Camera } from './camera.js';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Create the ship
const ship = new Ship(scene);

ship.cockpitCamera = new Camera('cockpitCamera', [0, 0.2, 0], scene, ship.mesh, 1.4, 1.8);
ship.thirdPersonCamera = new Camera('thirdPersonCamera', [0, 10, -20], scene, ship.mesh, 1.0, 1.4, Math.PI / 12);

scene.activeCamera = ship.thirdPersonCamera;
scene.activeCamera.detachControl(canvas);
scene.isCockpitView = false;
scene.infoVisible = true;

const projectiles = [];

// Get display elements
const coordinatesDisplay = document.getElementById('coordinates');
const orientationDisplay = document.getElementById('orientation');
const shipForcesDisplay = document.getElementById('ship-forces');
const planetForcesDisplay = document.getElementById('planet-forces');
const axisCanvas = document.getElementById('axisCanvas');
const axisContext = axisCanvas.getContext('2d');

const fpsInfos = {
    canvas: document.getElementById('fpsCanvas'),
    display: document.getElementById('fps'),
    context: document.getElementById('fpsCanvas').getContext('2d'),
    data: []
};

const acceleration = new Vector3(0, 0, 0);
const maxAcceleration = 0.02;
const damping = 0.99;

const keysPressed = {};



setupKeyboardControls(keysPressed);


const mouse = new Mouse(canvas, document, ship);

drawFpsGraph(fpsInfos);

const planets = [];
const numPlanets = 50;
const maxPlanetSize = 200; // Increase planet size

// Create random planets
for (let i = 0; i < numPlanets; i++) {
    const size = Math.random() * maxPlanetSize + 100; // Increase minimum size
    let position;
    let isValidPosition = false;

    // Ensure the new planet does not overlap with existing planets
    while (!isValidPosition) {
        position = new Vector3(
            (Math.random() - 0.5) * 5000, // Increase distance between planets
            (Math.random() - 0.5) * 5000,
            (Math.random() - 0.5) * 5000
        );

        isValidPosition = planets.every(planet => {
            const distance = Vector3.Distance(position, planet.position);
            return distance > (size * 3 + planet.size * 3);
        });
    }

    let isStar = Math.floor(Math.random() * 25) === 0;
    const planet = createPlanet(scene, size, position, isStar);
    planets.push(planet);
}

createSceneAxis(scene, 5);
ship.mesh = createMeshAxis(ship.mesh, scene, 2);
const skydome = new Skydome(scene);
toggleInfoVisibility(ship, scene);

const gravityWarning = document.getElementById('gravityWarning');

scene.onBeforeRenderObservable.add(() => {
    updateShipMovement(canvas, scene, ship, keysPressed, acceleration, maxAcceleration, damping, projectiles, planets);

    // Update display elements
    coordinatesDisplay.textContent = `Coordinates: (${ship.mesh.position.x.toFixed(2)}, ${ship.mesh.position.y.toFixed(2)}, ${ship.mesh.position.z.toFixed(2)})`;
    const rotation = ship.mesh.rotationQuaternion.toEulerAngles();
    orientationDisplay.textContent = `Orientation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`;
    shipForcesDisplay.textContent = `Ship Forces: (${ship.mesh.velocity.x.toFixed(2)}, ${ship.mesh.velocity.y.toFixed(2)}, ${ship.mesh.velocity.z.toFixed(2)})`;
    const fps = Math.round(engine.getFps());
    fpsInfos.display.textContent = `FPS: ${fps}`;
    fpsInfos.fps = fps;
    drawFpsGraph(fpsInfos);
    createSceneAxisIndicator(axisContext, ship.mesh.rotationQuaternion);

    // Update planet forces display
    let totalForce = new Vector3(0, 0, 0);
    let inGravityZone = false;
    let minDistance = Infinity;
    planets.forEach(planet => {
        const force = planet.applyGravitationalForce(ship.mesh);
        totalForce.addInPlace(force);
        const distance = Vector3.Distance(ship.mesh.position, planet.position);
        if (distance < planet.gravitationalRange) {
            inGravityZone = true;
            minDistance = Math.min(minDistance, distance);
        }
    });
    planetForcesDisplay.textContent = `Planet Forces: (${totalForce.x.toFixed(5)}, ${totalForce.y.toFixed(5)}, ${totalForce.z.toFixed(5)})`;

    // Show or hide gravity warning and adjust opacity
    if (inGravityZone) {
        const maxRange = planets.find(planet => Vector3.Distance(ship.mesh.position, planet.position) === minDistance).gravitationalRange;
        const opacity = 1 - (minDistance / maxRange);
        gravityWarning.style.display = 'block';
        gravityWarning.style.background = `radial-gradient(circle, rgba(255, 0, 0, 0) 80%, rgba(255, 0, 0, ${opacity}) 100%)`;
    } else {
        gravityWarning.style.display = 'none';
    }
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
