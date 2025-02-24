import { Engine, Scene, FreeCamera, Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Projectile } from './physicalObjects/projectile.js';
import { Planet } from './physicalObjects/planet.js';
import { Camera } from './physicalObjects/camera.js';
import { Particle } from './physicalObjects/particle/particle.js';
import { createSceneAxis } from './ui/axis.js';
import { drawFpsGraph } from './ui/graph.js';
import { toggleInfoVisibility } from './ui/utils.js';
import { Mouse } from './controlManagers/mouse.js';

const socket = new WebSocket('ws://localhost:8080');
const ships = {};
const projectiles = {};
const planets = {};
const particles = {};
let playerShip = null;

// Initialisation de Babylon.js
const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// ✅ Créer une caméra par défaut avant toute connexion WebSocket
let defaultCamera = new FreeCamera("defaultCamera", new Vector3(0, 5, -10), scene);
defaultCamera.setTarget(Vector3.Zero());
scene.activeCamera = defaultCamera;
defaultCamera.detachControl(canvas);
scene.isCockpitView = false;
scene.infoVisible = true;

// Création des axes pour la scène
createSceneAxis(scene, 5);

// Gestion du FPS
const fpsInfos = {
    fps: 0,
    data: [],
    canvas: document.getElementById('fpsCanvas'),
    context: document.getElementById('fpsCanvas').getContext('2d')
};

// État des touches clavier
const keysPressed = {};

// Connexion au serveur
socket.onopen = () => {
    console.log('✅ Connecté au serveur');
    const id = Math.random().toString(36).substr(2, 9); // Génère un ID unique pour le joueur
    socket.send(JSON.stringify({ type: 'newShip', id })); // Envoie la requête pour créer un vaisseau
};

// 🔄 Gestion des messages WebSocket
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init' || data.type === 'updateGameState') {
        // 🔹 Mise à jour des vaisseaux
        data.ships.forEach(shipData => {
            if (!ships[shipData.id]) {
                const isPlayer = shipData.id === playerShip?.id;
                ships[shipData.id] = new Ship(scene, shipData.id, isPlayer);
                ships[shipData.id].socket = socket; // Add socket reference
                particles[shipData.id] = new Particle(scene, ships[shipData.id].mesh);
            }
            ships[shipData.id].update(shipData);

            // ✅ Assigner la caméra au premier vaisseau du joueur
            if (!playerShip || playerShip.id === shipData.id) {
                playerShip = ships[shipData.id];

                if (defaultCamera instanceof FreeCamera) {
                    defaultCamera.dispose(); // Supprime la caméra par défaut
                    playerShip.cockpitCamera = new Camera('cockpitCamera', [0, 0.2, 0], scene, playerShip.mesh, 1.4, 1.8);
                    playerShip.thirdPersonCamera = new Camera('thirdPersonCamera', [0, 10, -20], scene, playerShip.mesh, 1.0, 1.4, Math.PI / 12);
                    scene.activeCamera = playerShip.thirdPersonCamera;
                }

                playerShip.mouse = new Mouse(canvas, document, playerShip); // Assigner l'objet Mouse au vaisseau du joueur
            }
        });

        // 🔹 Suppression des vaisseaux disparus
        Object.keys(ships).forEach(id => {
            if (!data.ships.some(s => s.id === id)) {
                ships[id].dispose();
                particles[id].dispose();
                delete ships[id];
                delete particles[id];
            }
        });

        // 🔹 Mise à jour des projectiles
        Object.keys(projectiles).forEach(id => {
            if (!data.projectiles.some(p => p.id === id)) {
                projectiles[id].dispose();
                delete projectiles[id];
            }
        });

        data.projectiles.forEach(projData => {
            if (!projectiles[projData.id]) {
                projectiles[projData.id] = new Projectile(scene, projData);
            } else {
                projectiles[projData.id].update(projData);
            }
        });

        // 🔹 Mise à jour des planètes
        data.planets.forEach(planetData => {
            if (!planets[planetData.id]) {
                planets[planetData.id] = new Planet(scene, planetData);
            }
        });
    }
};

// 🔄 Gestion des commandes clavier
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
    socket.send(JSON.stringify({ type: 'keyPress', id: playerShip.id, key: event.key.toLowerCase() }));
    if (event.key.toLowerCase() === 'x') {
        toggleInfoVisibility(playerShip, scene);
    }
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
    socket.send(JSON.stringify({ type: 'keyRelease', id: playerShip.id, key: event.key.toLowerCase() }));
});

let lastMovementUpdateTime = Date.now();
const movementUpdateInterval = 100; // Intervalle de mise à jour en ms

// 🔄 Mise à jour du mouvement et des actions du joueur
function updatePlayerActions() {
    if (playerShip) {
        let movement = { x: 0, y: 0, z: 0 };

        if (keysPressed['arrowup']) movement.z += 1;
        if (keysPressed['arrowdown']) movement.z -= 1;
        if (keysPressed['arrowleft']) movement.x -= 1;
        if (keysPressed['arrowright']) movement.x += 1;

        const currentTime = Date.now();
        if (currentTime - lastMovementUpdateTime > movementUpdateInterval) {
            socket.send(JSON.stringify({ 
                type: 'updateShip', 
                id: playerShip.id, 
                position: {
                    x: playerShip.mesh.position.x,
                    y: playerShip.mesh.position.y,
                    z: playerShip.mesh.position.z
                },
                rotation: {
                    x: playerShip.mesh.rotationQuaternion.x,
                    y: playerShip.mesh.rotationQuaternion.y,
                    z: playerShip.mesh.rotationQuaternion.z,
                    w: playerShip.mesh.rotationQuaternion.w
                }
            }));
            lastMovementUpdateTime = currentTime;
        }

        // 🔥 Appliquer la rotation interpolée en continu
        if (playerShip.mouse) {
            playerShip.mouse.applyRotationForce();
        }
    }

    requestAnimationFrame(updatePlayerActions);
}

// 🔄 Mise à jour continue des objets
function updateObjects(data) {
    if (!data || !data.ships) return;

    Object.values(ships).forEach(ship => {
        const shipData = data.ships.find(s => s.id === ship.id);
        if (shipData && ship.id !== playerShip.id) {
            ship.update(shipData); // ❌ Ne met pas à jour la position/rotation du joueur
        }
        
    });

    Object.values(projectiles).forEach(projectile => projectile.update());
    Object.values(particles).forEach(particle => particle.particleSystem.updateFunction());

    requestAnimationFrame(() => updateObjects(data));
}

// 🔄 Mise à jour du FPS
function updateFps() {
    fpsInfos.fps = Math.round(1000 / engine.getDeltaTime());
    drawFpsGraph(fpsInfos);
    requestAnimationFrame(updateFps);
}

updatePlayerActions();
updateObjects();
updateFps();

// 🔄 Boucle de rendu Babylon.js
engine.runRenderLoop(() => {
    scene.render();
});

// 🔄 Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    engine.resize();
});
