import { Engine, Scene, FreeCamera, Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Planet } from './physicalObjects/planet.js';
import { Camera } from './physicalObjects/camera.js';
import { Particle } from './physicalObjects/particle/particle.js';
import { createPanelAxisIndicator, createSceneAxis, setAxesVisibility } from './ui/axis.js';
import { Mouse } from './controlManagers/mouse.js';
import { Keyboard } from './controlManagers/keyboard.js';
import { Bullet } from './physicalObjects/bullet.js';
import { Skydome } from './physicalObjects/skydome.js';
import { Panel } from './ui/panel.js';

class SpaceBattleGame {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.ships = {};
        this.playerShip = null;
        this.projectiles = {};
        this.planets = {};
        this.particles = {};
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.defaultCamera = new FreeCamera("defaultCamera", new Vector3(0, 5, -10), this.scene);
        this.defaultCamera.setTarget(Vector3.Zero());
        this.scene.activeCamera = this.defaultCamera;
        this.defaultCamera.detachControl(this.canvas);
        this.scene.isCockpitView = false;
        this.scene.infoVisible = false;
        createSceneAxis(this.scene, 5);
        this.scene.skydome = new Skydome(this.scene);
        this.lastTime = performance.now(); // Initialize lastTime correctly
        this.deltaTime = this.updateDeltaTime();
        this.fpsInfos = {
            fps: 0,
            data: [],
            canvas: document.getElementById('fpsCanvas'),
            context: document.getElementById('fpsCanvas').getContext('2d'),
            display: document.getElementById('fps')
        };
        this.lastMovementUpdateTime = Date.now();
        this.movementUpdateInterval = 100;
        this.panel = new Panel();
        this.lastPanelUpdateTime = Date.now();
        this.panelUpdateInterval = 100;
        this.shipCreated = false; // Flag to check if the ship is created

        this.initializeSocket();
        this.updatePlayerActions();
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    initializeSocket() {
        this.socket.onopen = () => {
            console.log('✅ Connecté au serveur');
            this.socket.send(JSON.stringify({ type: 'newShip' }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'init' || data.type === 'updateGameState') {
                this.updateGameState(data);
            } else if (data.type === 'updateShip') {
                const ship = this.ships[data.ship.id];
                if (ship) {
                    ship.update(data.ship);
                }
            } else if (data.type === 'newProjectile') {
                if (!this.projectiles[data.projectile.id]) {
                    console.log('🚀 Nouveau projectile reçu:', data.projectile);
                    this.projectiles[data.projectile.id] = new Bullet(this.scene, this.playerShip, data.projectile);
                }
            }
            else if (data.type === 'updateGameState') {
                Bullet.worker.postMessage({ type: "updateBulletsFromServer", bullets: data.projectiles });
            } else if (data.type === 'newShip') {
                console.log('🚀 Nouveau vaisseau reçu:', data.ship); // DEBUG

                if (!this.ships[data.ship.id]) {
                    // Création du vaisseau avec son mesh
                    const newShip = new Ship(this.scene, data.ship.id, data.ship);

                    // Vérification et activation
                    if (!newShip.mesh) {
                        console.error("❌ ERREUR: Le vaisseau reçu n'a pas de mesh !");
                    } else {
                        console.log("✅ Activation du vaisseau reçu:");
                    }

                    this.ships[newShip.id] = newShip;
                    this.ships[newShip.id].socket = this.socket;
                    this.ships[newShip.id].update(data.ship); // Mise à jour avec les données reçues
                }
            }
        };
    }

    updateGameState(data) {
        this.updateDeltaTime();

        data.ships.forEach(shipData => {
            if (!this.ships[shipData.id]) {
                console.log('✅ Nouveau vaisseau créé:', shipData);

                // Vérifie si ce vaisseau appartient au joueur
                const isPlayer = data.playerId === shipData.id;
                this.ships[shipData.id] = new Ship(this.scene, shipData.id, shipData, isPlayer);
                this.ships[shipData.id].socket = this.socket;

                if (isPlayer) {
                    this.playerShip = this.ships[shipData.id];
                    this.shipCreated = true; // Flag pour dire que le joueur a bien un vaisseau

                    if (this.defaultCamera instanceof FreeCamera) {
                        this.defaultCamera.dispose();
                        this.playerShip.cockpitCamera = new Camera('cockpitCamera', [0, 0.2, 0], this.scene, this.playerShip.mesh, 1.4, 1.8);
                        this.playerShip.thirdPersonCamera = new Camera('thirdPersonCamera', [0, 10, -20], this.scene, this.playerShip.mesh, 1.0, 1.4, Math.PI / 12);
                        this.scene.activeCamera = this.playerShip.thirdPersonCamera;
                    }

                    this.playerShip.mouse = new Mouse(this.canvas, document, this.playerShip);
                    this.playerShip.keyboard = new Keyboard(this.canvas, this.scene, this.playerShip, this.projectiles, this.socket);

                    setAxesVisibility(this.playerShip.mesh.axes, false);
                }
            }

            // Met à jour les positions de tous les vaisseaux
            this.ships[shipData.id].update(shipData);
        });

        Object.keys(this.ships).forEach(id => {
            if (!data.ships.some(s => s.id === id)) {
                console.log(`🛑 Suppression du vaisseau ${id}`);
                this.ships[id].dispose();
                delete this.ships[id];
            }
        });

        Object.keys(this.projectiles).forEach(id => {
            if (this.projectiles[id].isDisposed) {
                Bullet.worker.postMessage({
                    type: "removeBullet",
                    data: { id: id }
                });
                delete this.projectiles[id];
            }
        });

        if (this.playerShip) {
            data.planets.forEach(planetData => {
                if (!this.planets[planetData.id]) {
                    this.planets[planetData.id] = new Planet(this.scene, planetData);
                }
                this.planets[planetData.id].applyGravitationalForce(this.playerShip);
            });

            this.updateObjects(data);
            this.playerShip.keyboard.checkPressedKeys();
            this.updatePanel();
        }
    }

    updatePlayerActions() {
        if (this.playerShip) {
            const currentTime = Date.now();

            const hasMoved = this.playerShip.mesh.velocity.lengthSquared() > 0.0001; // Vérifie s'il y a du mouvement
            const hasRotated = this.playerShip.mesh.rotationQuaternion.lengthSquared() > 0.999; // Vérifie s'il y a une rotation

            if ((hasMoved || hasRotated) && (currentTime - this.lastMovementUpdateTime > this.movementUpdateInterval)) {
                this.socket.send(JSON.stringify({
                    type: 'updateShip',
                    id: this.playerShip.id,
                    position: {
                        x: this.playerShip.mesh.position.x,
                        y: this.playerShip.mesh.position.y,
                        z: this.playerShip.mesh.position.z
                    },
                    rotationQuaternion: {
                        x: this.playerShip.mesh.rotationQuaternion.x,
                        y: this.playerShip.mesh.rotationQuaternion.y,
                        z: this.playerShip.mesh.rotationQuaternion.z,
                        w: this.playerShip.mesh.rotationQuaternion.w
                    }
                }));

                this.lastMovementUpdateTime = currentTime;
            }

            if (this.playerShip.mouse) {
                this.playerShip.mouse.applyRotationForce();
            }
            this.playerShip.updatePlayer(this.planets);
        }

        requestAnimationFrame(() => this.updatePlayerActions());
    }

    async updateObjects(data) {
        this.updateDeltaTime();

        if (!data || !data.ships) return;

        await Promise.all(Object.values(this.ships).map(async (ship) => {
            const shipData = data.ships.find(s => s.id === ship.id);
            if (shipData && this.playerShip && ship.id !== this.playerShip.id) {
                ship.update(shipData);
            }
        }));

        await Promise.all(Object.values(this.particles).map(async (particle) => {
            particle.update(this.deltaTime); // Pass deltaTime to update method
            if (particle.isDisposed) {
                delete this.particles[particle.id];
            }
        }));

        this.panel.updateElementCountDisplay({
            ships: Object.keys(this.ships).length,
            projectiles: Object.keys(this.projectiles).length,
            planets: Object.keys(this.planets).length,
            particles: Object.keys(this.particles).length
        });
    }

    updatePanel() {
        const currentTime = Date.now();
        if (currentTime - this.lastPanelUpdateTime > this.panelUpdateInterval) {
            this.panel.fpsInfos.fps = Math.round(1000 / this.engine.getDeltaTime());
            this.panel.drawFpsGraph();
            this.lastPanelUpdateTime = currentTime;
        }
        this.panel.updatePositionsDisplays(this.playerShip);
        createPanelAxisIndicator(this.panel.positionsInfos.axes, this.playerShip.mesh.rotationQuaternion);
        requestAnimationFrame(() => this.updatePanel());
    }

    updateDeltaTime() {
        const currentTime = performance.now(); // Use performance.now() for better precision
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
    }
}

// Vérifie si le WebWorker est déjà initialisé
if (typeof Bullet.worker === 'undefined') {
    Bullet.worker = new Worker(new URL('./worker/bulletWorker.js', import.meta.url));
}

if (typeof Particle.worker === 'undefined') {
    Particle.worker = new Worker(new URL('./physicalObjects/particle/worker.js', import.meta.url));
}

export const game = new SpaceBattleGame();
