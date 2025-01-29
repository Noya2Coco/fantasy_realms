import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, Quaternion, Color3, PointLight, StandardMaterial } from '@babylonjs/core';
import { createSkybox } from './skybox.js';
import { createSceneAxis, createShipAxis, createSceneAxisIndicator } from './axis.js';
import { handleMouseMovement, enterImmersiveMode, exitImmersiveMode } from './mouseControl.js';
import { updateShipMovement, setupKeyboardControls } from './keyboardControl.js';
import { createPlanet } from './planet.js';
import { drawFpsGraph } from './graph.js';
import { toggleInfoVisibility } from './utils.js';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Remove global lights
// const hemisphericLight = new HemisphericLight('HemisphericLight', new Vector3(1, 1, 0), scene);
// hemisphericLight.intensity = 0.7;

// const pointLight = new PointLight('PointLight', new Vector3(0, 5, -5), scene);
// pointLight.intensity = 0.9;

// Create the ship
const ship = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, scene);
ship.position.z = -5;
ship.rotationQuaternion = Quaternion.Identity();
ship.velocity = new Vector3(0, 0, 0); // Initialize velocity property
ship.velocityVector = null;
ship.velocityVectorArrow = null;

// Add emissive material to the ship
const shipMaterial = new StandardMaterial('shipMaterial', scene);
shipMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Base color
shipMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5); // Increase emissive color for more light
shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2); // Increase specular color for more diffusion
ship.material = shipMaterial;

// Initialize cameras
const cameras = {
    cockpitCamera: new FreeCamera('CockpitCamera', new Vector3(0, 0.2, 0), scene),
    thirdPersonCamera: new FreeCamera('ThirdPersonCamera', new Vector3(0, 10, -20), scene)
};

cameras.cockpitCamera.parent = ship;
cameras.cockpitCamera.minFov = 1.4;
cameras.cockpitCamera.maxFov = 1.8;
cameras.cockpitCamera.fov = cameras.cockpitCamera.minFov; // Increase FOV for cockpit view
cameras.cockpitCamera.maxZ = 10000; // Increase visibility range

cameras.thirdPersonCamera.rotation.x = Math.PI / 12;
cameras.thirdPersonCamera.parent = ship;
cameras.thirdPersonCamera.minFov = 1.0;
cameras.thirdPersonCamera.maxFov = 1.4;
cameras.thirdPersonCamera.fov = cameras.thirdPersonCamera.minFov;
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

    let isStar = Math.floor(Math.random() * 20) === 0;
    const planet = createPlanet(scene, size, position, isStar);
    planets.push(planet);
}

createSceneAxis(scene, 5);
createShipAxis(ship, scene, 2);
createSkybox(scene);
toggleInfoVisibility(ship, scene);

const gravityWarning = document.getElementById('gravityWarning');

scene.onBeforeRenderObservable.add(() => {
    updateShipMovement(canvas, scene, ship, keysPressed, acceleration, ship.velocity, maxAcceleration, damping, projectiles, cameras, planets);

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
    let inGravityZone = false;
    let minDistance = Infinity;
    planets.forEach(planet => {
        const force = planet.applyGravitationalForce(ship);
        totalForce.addInPlace(force);
        const distance = Vector3.Distance(ship.position, planet.position);
        if (distance < planet.gravitationalRange) {
            inGravityZone = true;
            minDistance = Math.min(minDistance, distance);
        }
    });
    planetForcesDisplay.textContent = `Planet Forces: (${totalForce.x.toFixed(5)}, ${totalForce.y.toFixed(5)}, ${totalForce.z.toFixed(5)})`;

    // Show or hide gravity warning and adjust opacity
    if (inGravityZone) {
        const maxRange = planets.find(planet => Vector3.Distance(ship.position, planet.position) === minDistance).gravitationalRange;
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
