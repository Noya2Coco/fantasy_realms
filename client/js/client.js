import { Engine, Scene, FreeCamera, Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Planet } from './physicalObjects/planet.js';
import { Camera } from './physicalObjects/camera.js';
import { Particle } from './physicalObjects/particle/particle.js';
import { createSceneAxis } from './ui/axis.js';
import { drawFpsGraph } from './ui/graph.js';
import { toggleInfoVisibility } from './ui/utils.js';
import { Mouse } from './controlManagers/mouse.js';
import { Keyboard } from './controlManagers/keyboard.js';
import { Bullet } from './physicalObjects/bullet.js';
import { setAxesVisibilityFromObject } from './ui/axis.js';
import { Skydome } from './physicalObjects/skydome.js';

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
        this.deltaTime = 0;
        this.fpsInfos = {
            fps: 0,
            data: [],
            canvas: document.getElementById('fpsCanvas'),
            context: document.getElementById('fpsCanvas').getContext('2d')
        };
        this.lastMovementUpdateTime = Date.now();
        this.movementUpdateInterval = 100;

        this.initializeSocket();
        this.updatePlayerActions();
        this.updateFps();
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
            }
        };
    }

    updateGameState(data) {
        this.updateDeltaTime();

        data.ships.forEach(shipData => {
            if (!this.ships[shipData.id]) {
                this.ships[shipData.id] = new Ship(this.scene, shipData.id, !this.playerShip);
                this.ships[shipData.id].socket = this.socket;
            }
            this.ships[shipData.id].update(shipData);

            if (data.playerId && shipData.id === data.playerId) {
                this.playerShip = this.ships[shipData.id];

                if (this.defaultCamera instanceof FreeCamera) {
                    this.defaultCamera.dispose();
                    this.playerShip.cockpitCamera = new Camera('cockpitCamera', [0, 0.2, 0], this.scene, this.playerShip.mesh, 1.4, 1.8);
                    this.playerShip.thirdPersonCamera = new Camera('thirdPersonCamera', [0, 10, -20], this.scene, this.playerShip.mesh, 1.0, 1.4, Math.PI / 12);
                    this.scene.activeCamera = this.playerShip.thirdPersonCamera;
                }

                this.playerShip.mouse = new Mouse(this.canvas, document, this.playerShip);
                this.playerShip.keyboard = new Keyboard(this.canvas, this.scene, this.playerShip, this.projectiles, this.socket);

                setAxesVisibilityFromObject(this.playerShip.mesh.axes, false);
            }
        });

        Object.keys(this.ships).forEach(id => {
            if (!data.ships.some(s => s.id === id)) {
                this.ships[id].dispose();
                if (this.particles[id]) {
                    this.particles[id].dispose();
                }
                delete this.ships[id];
                delete this.particles[id];
            }
        });

        /*
        Object.keys(this.projectiles).forEach(id => {
            if (!data.projectiles.some(p => p.id === id)) {
                this.projectiles[id].dispose();
                delete this.projectiles[id];
            }
        });*/

        if (this.playerShip) {
            data.projectiles.forEach(projData => {
                if (!this.projectiles[projData.id]) {
                    this.projectiles[projData.id] = new Bullet(this.scene, this.playerShip, projData);
                } else {
                    this.projectiles[projData.id].update(projData);
                }
            });

            data.planets.forEach(planetData => {
                if (!this.planets[planetData.id]) {
                    this.planets[planetData.id] = new Planet(this.scene, planetData);
                }
                this.planets[planetData.id].applyGravitationalForce(this.playerShip);
            });

            this.updateObjects(data);
            this.playerShip.keyboard.checkPressedKeys();
        }
    }

    updatePlayerActions() {
        if (this.playerShip) {
            const currentTime = Date.now();
            if (currentTime - this.lastMovementUpdateTime > this.movementUpdateInterval) {
                this.socket.send(JSON.stringify({
                    type: 'updateShip',
                    id: this.playerShip.id,
                    position: {
                        x: this.playerShip.mesh.position.x,
                        y: this.playerShip.mesh.position.y,
                        z: this.playerShip.mesh.position.z
                    },
                    rotation: {
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

        await Promise.all(Object.values(this.projectiles).map(async (projectile) => {
            projectile.update(this.deltaTime);
        }));

        await Promise.all(Object.values(this.particles).map(async (particle) => {
            particle.particleSystem.update();
        }));

        requestAnimationFrame(() => this.updateObjects(data));
    }

    updateFps() {
        this.fpsInfos.fps = Math.round(1000 / this.engine.getDeltaTime());
        drawFpsGraph(this.fpsInfos);
        requestAnimationFrame(() => this.updateFps());
    }

    updateDeltaTime() {
        const currentTime = performance.now(); // Use performance.now() for better precision
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
    }
}

const game = new SpaceBattleGame();
