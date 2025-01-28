import { Engine, Scene, FreeCamera, HemisphericLight, PointLight, Vector3, MeshBuilder, Quaternion, Color3 } from '@babylonjs/core';
import { createSkybox } from './skybox.js';
import { createSceneAxis, createShipAxis, createSceneAxisIndicator } from './axis.js';
import { handleMouseMovement, enterImmersiveMode, exitImmersiveMode } from './mouseControl.js';
import { updateShipMovement, setupKeyboardControls } from './keyboardControl.js';
import { createPlanet } from './planet.js';
import { drawFpsGraph } from './graph.js';
import { setAxesVisibilityFromObject } from './utils.js';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Add lights to the scene
const hemisphericLight = new HemisphericLight('HemisphericLight', new Vector3(1, 1, 0), scene);
hemisphericLight.intensity = 0.7;

const pointLight = new PointLight('PointLight', new Vector3(0, 5, -5), scene);
pointLight.intensity = 0.9;

// Create the ship
const ship = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, scene);
ship.position.z = -5;
ship.rotationQuaternion = Quaternion.Identity();
ship.velocity = new Vector3(0, 0, 0); // Initialize velocity property

// Initialize cameras
const cameras = {
    cockpitCamera: new FreeCamera('CockpitCamera', new Vector3(0, 0.2, 0), scene),
    thirdPersonCamera: new FreeCamera('ThirdPersonCamera', new Vector3(0, 10, -20), scene)
};

cameras.cockpitCamera.parent = ship;
cameras.cockpitCamera.fov = 1.4; // Increase FOV for cockpit view
cameras.cockpitCamera.maxZ = 10000; // Increase visibility range

cameras.thirdPersonCamera.rotation.x = Math.PI / 12;
cameras.thirdPersonCamera.parent = ship;
cameras.thirdPersonCamera.maxZ = 10000; // Increase visibility range

scene.activeCamera = cameras.thirdPersonCamera;
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

let velocityVector = null;
let velocityVectorArrow = null;
const keysPressed = {};

canvas.addEventListener('click', () => enterImmersiveMode(canvas));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        exitImmersiveMode();
    }
});

setupKeyboardControls(keysPressed);

canvas.addEventListener('mousemove', (event) => handleMouseMovement(event, ship));

drawFpsGraph(fpsInfos);

const planets = [];
const numPlanets = 5;
const maxPlanetSize = 200; // Increase planet size

// Create random planets
for (let i = 0; i < numPlanets; i++) {
    const size = Math.random() * maxPlanetSize + 100; // Increase minimum size
    const position = new Vector3(
        (Math.random() - 0.5) * 5000, // Increase distance between planets
        (Math.random() - 0.5) * 5000,
        (Math.random() - 0.5) * 5000
    );
    const planet = createPlanet(scene, size, position);
    planets.push(planet);
}

createSceneAxis(scene, 5);
createShipAxis(ship, scene, 2);
createSkybox(scene);

const gravitationalConstant = 0.5; // Define gravitational constant

scene.onBeforeRenderObservable.add(() => {
    updateShipMovement(canvas, scene, ship, keysPressed, acceleration, ship.velocity, maxAcceleration, damping, projectiles, cameras, planets, gravitationalConstant, velocityVector, velocityVectorArrow, (newLine, newArrow) => {
        velocityVector = newLine;
        velocityVectorArrow = newArrow;
    });

    // Update display elements
    coordinatesDisplay.textContent = `Coordinates: (${ship.position.x.toFixed(2)}, ${ship.position.y.toFixed(2)}, ${ship.position.z.toFixed(2)})`;
    const rotation = ship.rotationQuaternion.toEulerAngles();
    orientationDisplay.textContent = `Orientation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`;
    shipForcesDisplay.textContent = `Ship Forces: (${ship.velocity.x.toFixed(2)}, ${ship.velocity.y.toFixed(2)}, ${ship.velocity.z.toFixed(2)})`;
    const fps = Math.round(engine.getFps());
    fpsInfos.display.textContent = `FPS: ${fps}`;
    fpsInfos.fps = fps;
    drawFpsGraph(fpsInfos);
    createSceneAxisIndicator(axisContext, ship.rotationQuaternion);

    // Update planet forces display
    let totalForce = new Vector3(0, 0, 0);
    planets.forEach(planet => {
        const force = planet.applyGravitationalForce(ship, gravitationalConstant);
        totalForce.addInPlace(force);
    });
    planetForcesDisplay.textContent = `Planet Forces: (${totalForce.x.toFixed(5)}, ${totalForce.y.toFixed(5)}, ${totalForce.z.toFixed(5)})`;
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
