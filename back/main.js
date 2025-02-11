import { Engine, Scene, Vector3 } from 'babylonjs';
import { Skydome } from './physicalObjets/skybox.js';
import { createSceneAxis, createMeshAxis, createSceneAxisIndicator } from './physicalObjets/ui/axis.js';
import { Mouse } from './controlManagers/mouse.js';
import { updateShipMovement, setupKeyboardControls } from './controlManagers/keyboard.js';
import { createPlanet } from './physicalObjets/planet.js';
import { drawFpsGraph } from './physicalObjets/ui/graph.js';
import { toggleInfoVisibility } from './physicalObjets/ui/utils.js';
import { Ship } from './physicalObjets/ship.js';
import { Camera } from './physicalObjets/camera.js';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const ws = new WebSocket('ws://localhost:8080');
const ships = {};
let playerShip = null;
const planets = [];

ws.onopen = () => {
    const id = Math.random().toString(36).substr(2, 9);
    ws.send(JSON.stringify({ type: 'newShip', id }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
        data.ships.forEach(shipData => {
            const ship = new Ship(scene);
            ship.mesh.position = shipData.position;
            ship.mesh.rotationQuaternion = shipData.rotation;
            ships[shipData.id] = ship;
        });
        data.planets.forEach(planetData => {
            const planet = createPlanet(scene, planetData.size, planetData.position, planetData.isStar);
            planets.push(planet);
        });
    } else if (data.type === 'newShip') {
        const ship = new Ship(scene);
        ship.mesh.position = data.ship.position;
        ship.mesh.rotationQuaternion = data.ship.rotation;
        ships[data.ship.id] = ship;
    } else if (data.type === 'updateShip') {
        const ship = ships[data.ship.id];
        if (ship) {
            ship.mesh.position = data.ship.position;
            ship.mesh.rotationQuaternion = data.ship.rotation;
            ship.mesh.velocity = data.ship.velocity;
        }
    }
};

const ship = new Ship(scene);
playerShip = ship;
ships['player'] = ship;

ship.cockpitCamera = new Camera('cockpitCamera', [0, 0.2, 0], scene, ship.mesh, 1.4, 1.8);
ship.thirdPersonCamera = new Camera('thirdPersonCamera', [0, 10, -20], scene, ship.mesh, 1.0, 1.4, Math.PI / 12);

scene.activeCamera = ship.thirdPersonCamera;
scene.activeCamera.detachControl(canvas);
scene.isCockpitView = false;
scene.infoVisible = true;

const projectiles = [];

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

const numPlanets = 100;
const maxPlanetSize = 200;
const maxMovementZone = 10000;

function generatePlanetPosition(existingPlanets) {
    let position;
    let isValidPosition = false;

    while (!isValidPosition) {
        position = new Vector3(
            (Math.random() - 0.5) * maxMovementZone,
            (Math.random() - 0.5) * maxMovementZone,
            (Math.random() - 0.5) * maxMovementZone
        );

        isValidPosition = existingPlanets.every(planet => {
            const distance = Vector3.Distance(position, planet.position);
            return distance > (planet.size * 3);
        });
    }

    return position;
}

function spawnPlanets(existingPlanets, numPlanetsToSpawn) {
    for (let i = 0; i < numPlanetsToSpawn; i++) {
        const size = Math.random() * maxPlanetSize + 100;
        const position = generatePlanetPosition(existingPlanets);

        let isStar = Math.floor(Math.random() * 50) === 0;
        const planet = createPlanet(scene, size, position, isStar);
        existingPlanets.push(planet);
    }
}

spawnPlanets(planets, 0); // No need to spawn planets here, they are received from the server

createSceneAxis(scene, 5);
ship.mesh = createMeshAxis(ship.mesh, scene, 2);
const skydome = new Skydome(scene);
toggleInfoVisibility(ship, scene);

const gravityWarning = document.getElementById('gravityWarning');

scene.onBeforeRenderObservable.add(() => {
    updateShipMovement(canvas, scene, ship, keysPressed, acceleration, maxAcceleration, damping, projectiles, planets);

    coordinatesDisplay.textContent = `Coordinates: (${ship.mesh.position.x.toFixed(2)}, ${ship.mesh.position.y.toFixed(2)}, ${ship.mesh.position.z.toFixed(2)})`;
    const rotation = ship.mesh.rotationQuaternion.toEulerAngles();
    orientationDisplay.textContent = `Orientation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`;
    shipForcesDisplay.textContent = `Ship Forces: (${ship.mesh.velocity.x.toFixed(2)}, ${ship.mesh.velocity.y.toFixed(2)}, ${ship.mesh.velocity.z.toFixed(2)})`;
    const fps = Math.round(engine.getFps());
    fpsInfos.display.textContent = `FPS: ${fps}`;
    fpsInfos.fps = fps;
    drawFpsGraph(fpsInfos);
    createSceneAxisIndicator(axisContext, ship.mesh.rotationQuaternion);

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

    if (inGravityZone) {
        const maxRange = planets.find(planet => Vector3.Distance(ship.mesh.position, planet.position) === minDistance).gravitationalRange;
        const opacity = 1 - (minDistance / maxRange);
        gravityWarning.style.display = 'block';
        gravityWarning.style.background = `radial-gradient(circle, rgba(255, 0, 0, 0) 80%, rgba(255, 0, 0, ${opacity}) 100%)`;
    } else {
        gravityWarning.style.display = 'none';
    }

    if (Math.abs(ship.mesh.position.x) > maxMovementZone / 2 ||
        Math.abs(ship.mesh.position.y) > maxMovementZone / 2 ||
        Math.abs(ship.mesh.position.z) > maxMovementZone / 2) {
        ship.mesh.position.x = Math.max(Math.min(ship.mesh.position.x, maxMovementZone / 2), -maxMovementZone / 2);
        ship.mesh.position.y = Math.max(Math.min(ship.mesh.position.y, maxMovementZone / 2), -maxMovementZone / 2);
        ship.mesh.position.z = Math.max(Math.min(ship.mesh.position.z, maxMovementZone / 2), -maxMovementZone / 2);
        ship.mesh.velocity.scaleInPlace(0);
    }

    ws.send(JSON.stringify({
        type: 'updateShip',
        id: 'player',
        position: ship.mesh.position,
        rotation: ship.mesh.rotationQuaternion,
        velocity: ship.mesh.velocity
    }));
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
