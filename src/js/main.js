import { Engine, Scene, FreeCamera, HemisphericLight, PointLight, Vector3, MeshBuilder, Quaternion } from '@babylonjs/core';
import { createSkybox } from './skybox.js';
import { createAxis, createShipAxis } from './utils.js';
import { handleMouseMovement } from './mouseControl.js';
import { handleKeyPress, handleKeyRelease, updateShipMovement } from './keyboardControl.js';

// Récupération du canvas
const canvas = document.getElementById('renderCanvas');

// Initialisation de l'engine et de la scène
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Ajout d'une lumière hémisphérique
const hemisphericLight = new HemisphericLight('HemisphericLight', new Vector3(1, 1, 0), scene);
hemisphericLight.intensity = 0.7; // Ajuster l'intensité de la lumière hémisphérique

// Ajout d'une lumière ponctuelle pour améliorer la visibilité
const pointLight = new PointLight('PointLight', new Vector3(0, 5, -5), scene);
pointLight.intensity = 0.9; // Ajuster l'intensité de la lumière ponctuelle

// Création du vaisseau
const ship = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, scene);
ship.position.z = -5;
ship.rotationQuaternion = Quaternion.Identity(); // Initialiser rotationQuaternion

// Initialisation des caméras
let isCockpitView = false;

// Caméras liées à un objet
const cameras = {
    cockpitCamera: new FreeCamera('CockpitCamera', new Vector3(0, 0.2, 0), scene),
    thirdPersonCamera: new FreeCamera('ThirdPersonCamera', new Vector3(0, 5, -10), scene)
};

cameras.cockpitCamera.parent = ship; // La caméra suit le mouvement du vaisseau
cameras.thirdPersonCamera.rotation.x = Math.PI / 12; // Inclinaison légère vers le bas
cameras.thirdPersonCamera.parent = ship; // La caméra suit également le mouvement du vaisseau

// Définir la caméra par défaut (vue cockpit)
scene.activeCamera = cameras.thirdPersonCamera;
scene.activeCamera.detachControl(canvas); // Détache les contrôles de la caméra actuelle

// Tableau pour gérer les projectiles
const projectiles = [];

// Récupération des éléments d'affichage
const coordinatesDisplay = document.getElementById('coordinates');
const forcesDisplay = document.getElementById('forces');

// Variables pour les forces appliquées au vaisseau
let velocity = new Vector3(0, 0, 0);
const acceleration = new Vector3(0, 0, 0);
const maxAcceleration = 0.01; // Facteur de l'accélération maximale
const damping = 0.98; // Facteur de réduction de la vitesse pour simuler la friction

// Variables pour suivre les touches enfoncées
const keysPressed = {};

// Fonction pour entrer en mode plein écran et cacher la souris
function enterImmersiveMode() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}

// Fonction pour quitter le mode plein écran
function exitImmersiveMode() {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
}

// Gestion de l'entrée en mode plein écran
canvas.addEventListener('click', () => {
    enterImmersiveMode();
});

// Gestion de la sortie du mode plein écran avec 'Escape'
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        exitImmersiveMode();
    }
});

// Gestion des déplacements du vaisseau
window.addEventListener('keydown', (event) => handleKeyPress(event, keysPressed));
window.addEventListener('keyup', (event) => handleKeyRelease(event, keysPressed));

// Gestion de l'orientation du vaisseau avec la souris
canvas.addEventListener('mousemove', (event) => handleMouseMovement(event, ship));

// Gestion des déplacements du vaisseau avec la touche 'E'
scene.onBeforeRenderObservable.add(() => {
    updateShipMovement(canvas, scene, ship, keysPressed, acceleration, velocity, maxAcceleration, damping, projectiles, isCockpitView, cameras, (newView) => {
        isCockpitView = newView;
    });

    // Mise à jour de l'affichage des coordonnées et des forces
    coordinatesDisplay.textContent = `Coordinates: (${ship.position.x.toFixed(2)}, ${ship.position.y.toFixed(2)}, ${ship.position.z.toFixed(2)})`;
    forcesDisplay.textContent = `Forces: (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)}, ${velocity.z.toFixed(2)})`;
});

// Ajout d'un repère XYZ
createAxis(scene, 5);

// Ajout d'un repère XYZ propre au vaisseau
createShipAxis(ship, scene, 2);

// Création du ciel étoilé
createSkybox(scene);

// Boucle de rendu
engine.runRenderLoop(() => {
    scene.render();
});

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    engine.resize();
});
