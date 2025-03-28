import { Engine, Scene, FreeCamera, Vector3, Matrix } from '@babylonjs/core';
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
import { VelocityVector } from './ui/velocityVector.js';

class SpaceBattleGame {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.sendMessage = this.sendMessage.bind(this); // Bind sendMessage method
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
        this.radarCanvas = document.getElementById('radarCanvas');
        this.radarContext = this.radarCanvas.getContext('2d');
        this.recentDamageTimeout = null;

        this.initializeSocket();
        this.updatePlayerActions();
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Ajouter un raccourci clavier pour activer/désactiver l'Inspector
        window.addEventListener('keydown', (event) => {
            if (event.key === 'i') { // Appuyer sur "i" pour ouvrir/fermer l'Inspector
                this.toggleInspector();
            }
        });
    }

    initializeSocket() {
        this.socket.onopen = () => {
            console.log('✅ Connected to server');
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
            } else if (data.type === 'teleportShip') {
                const ship = this.ships[data.ship.id];
                if (ship) {
                    ship.update(data.ship, true); // Force update for teleportation
                }
            } else if (data.type === 'newProjectile') {
                if (!this.projectiles[data.projectile.id]) {
                    console.log('🚀 New projectile received:', data.projectile);
                    this.projectiles[data.projectile.id] = new Bullet(this.scene, this.playerShip, data.projectile);
                }
            } else if (data.type === 'updateGameState') {
                Bullet.worker.postMessage({ type: "updateBulletsFromServer", bullets: data.projectiles });
            } else if (data.type === 'newShip') {
                console.log('🚀 New ship received:', data.ship); // DEBUG

                if (!this.ships[data.ship.id]) {
                    // Create the ship with its mesh
                    const newShip = new Ship(this.scene, data.ship.id, data.ship);

                    // Check and activate
                    if (!newShip.mesh) {
                        console.error("❌ ERROR: The received ship has no mesh!");
                    } else {
                        console.log("✅ Activating received ship:");
                    }

                    this.ships[newShip.id] = newShip;
                    this.ships[newShip.id].socket = this.socket;
                    this.ships[newShip.id].update(data.ship); // Update with received data
                }
            } else if (data.type === 'updateShipHealth') {
                const ship = this.ships[data.id];
                if (ship && ship.isPlayer) {
                    ship.health = data.health;
                    this.updateHealthBar(ship); // Update the health bar only for the player's ship
                }
            }
        };

        this.socket.onclose = () => {
            console.log('❌ Disconnected from server');
            this.cleanup();
        };

        this.socket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.cleanup(); // Ensure proper cleanup on error
            this.socket.close();
        };
    }

    sendMessage(data) {
        if (this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(data));
            } catch (error) {
                console.error('❌ Error sending WebSocket message:', error);
            }
        }
    }

    cleanup() {
        Object.values(this.ships).forEach(ship => ship.dispose());
        this.ships = {};
        Object.values(this.projectiles).forEach(projectile => projectile.dispose());
        this.projectiles = {};
        Object.values(this.planets).forEach(planet => planet.dispose());
        this.planets = {};
        Object.values(this.particles).forEach(particle => particle.dispose());
        this.particles = {};
        if (this.playerShip) {
            this.playerShip.dispose();
            this.playerShip = null;
        }
        if (this.socket) {
            this.socket.close(); // Ensure WebSocket connection is closed
            this.socket = null;
        }
    }

    updateGameState(data) {
        this.updateDeltaTime();

        data.ships.forEach(shipData => {
            if (!this.ships[shipData.id]) {
                console.log('✅ New ship created:', shipData);

                // Check if this ship belongs to the player
                const isPlayer = data.playerId === shipData.id;
                this.ships[shipData.id] = new Ship(this.scene, shipData.id, shipData, isPlayer);
                this.ships[shipData.id].socket = this.socket;

                if (isPlayer) {
                    this.playerShip = this.ships[shipData.id];
                    this.shipCreated = true; // Flag to indicate the player has a ship

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

            // Update positions of all ships
            this.ships[shipData.id].update(shipData);
        });

        Object.keys(this.ships).forEach(id => {
            if (!data.ships.some(s => s.id === id)) {
                console.log(`🛑 Removing ship ${id}`);
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
            this.playerShip.updatePlayer(this.planets);
            this.playerShip.velocityVector.update(
                this.playerShip.mesh.position,
                this.playerShip.mesh.position.add(this.playerShip.mesh.velocity.scale(100))
            );
            this.playerShip.adjustVectorLine(this.planets); // Mettre à jour le velocityVector
        }
    }

    updatePlayerActions() {
        if (this.playerShip) {
            const currentTime = Date.now();

            const hasMoved = this.playerShip.mesh.velocity.lengthSquared() > 0.0001; // Check for movement
            const hasRotated = this.playerShip.mesh.rotationQuaternion.lengthSquared() > 0.999; // Check for rotation

            if ((hasMoved || hasRotated) && (currentTime - this.lastMovementUpdateTime > this.movementUpdateInterval)) {
                this.sendMessage({
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
                });

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
        this.updateRadar();
        requestAnimationFrame(() => this.updatePanel());
    }

    updateRadar() {
        const ctx = this.radarContext;
        const radarRadius = this.radarCanvas.width / 2;
        const playerPos = this.playerShip.mesh.position;
        const playerRotation = this.playerShip.mesh.rotationQuaternion;

        ctx.clearRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);

        // 🔥 Dessiner le fond du radar
        ctx.beginPath();
        ctx.arc(radarRadius, radarRadius, radarRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // 🔥 Convertir la rotation du vaisseau en matrice pour obtenir ses axes locaux
        const rotationMatrix = new Matrix();
        playerRotation.toRotationMatrix(rotationMatrix);

        // 🔥 Parcourir tous les vaisseaux pour calculer leur position relative
        Object.values(this.ships).forEach(ship => {
            if (ship.id !== this.playerShip.id) {
                const shipPos = ship.mesh.position;

                const relativePos = shipPos.subtract(playerPos);

                const localPos = Vector3.TransformCoordinates(relativePos, rotationMatrix.invert());

                const maxRadarDistance = 500; // Distance maximale prise en compte
                const scaleFactor = radarRadius / maxRadarDistance;

                let x = radarRadius + (localPos.x * scaleFactor); // Plus X est élevé, plus l'ennemi est à droite sur le radar
                let y = radarRadius - (localPos.y * scaleFactor); // Plus Y est élevé, plus l'ennemi est en haut sur le radar

                const distance = Math.sqrt(localPos.x * localPos.x + localPos.y * localPos.y);
                if (distance > maxRadarDistance) {
                    x = radarRadius - (localPos.x / distance) * radarRadius;
                    y = radarRadius - (localPos.y / distance) * radarRadius;
                }

                const forward = new Vector3(0, 0, 1); // Direction "devant" du joueur
                const dotProduct = Vector3.Dot(localPos.clone().normalize(), forward);
                const size = 5 * (1 + dotProduct); // Taille entre 3 et 8 en fonction de dotProduct

                // ✅ Dessiner le point sur le radar
                ctx.beginPath();
                ctx.arc(x, y, size, 0, 2 * Math.PI);
                ctx.fillStyle = 'red'; // Couleur fixe
                ctx.fill();
            }
        });

        // ✅ Dessiner une petite croix blanche pour le joueur au centre du radar
        const crossSize = 6; // Taille de la croix
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.moveTo(radarRadius - crossSize / 2, radarRadius);
        ctx.lineTo(radarRadius + crossSize / 2, radarRadius);
        ctx.moveTo(radarRadius, radarRadius - crossSize / 2);
        ctx.lineTo(radarRadius, radarRadius + crossSize / 2);
        ctx.stroke();
    }

    updateDeltaTime() {
        const currentTime = performance.now(); // Use performance.now() for better precision
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
    }

    updateHealthBar(ship) {
        const healthBar = document.getElementById('healthBar');
        const recentDamageBar = document.getElementById('recentDamageBar');
        if (healthBar && recentDamageBar) {
            const maxHealth = 30;
            const previousHealth = parseFloat(healthBar.style.width) * maxHealth / 100;
            healthBar.style.width = `${(ship.health / maxHealth) * 100}%`;
            recentDamageBar.style.width = `${(previousHealth / maxHealth) * 100}%`;
    
            if (this.recentDamageTimeout) clearTimeout(this.recentDamageTimeout);
            this.recentDamageTimeout = setTimeout(() => {
                recentDamageBar.style.width = `${(ship.health / maxHealth) * 100}%`;
            }, 2000);
        }
    }

    toggleInspector() {
        const radarContainer = document.getElementById('radarContainer');
        if (this.scene.debugLayer.isVisible()) {
            this.scene.debugLayer.hide();
            radarContainer.style.display = 'block'; // Réactiver le radar
        } else {
            this.scene.debugLayer.show();
            radarContainer.style.display = 'none'; // Désactiver le radar
        }
    }
}

// Check if the WebWorker is already initialized
if (typeof Bullet.worker === 'undefined') {
    Bullet.worker = new Worker(new URL('./worker/bulletWorker.js', import.meta.url));
}

if (typeof Particle.worker === 'undefined') {
    Particle.worker = new Worker(new URL('./physicalObjects/particle/worker.js', import.meta.url));
}

export const game = new SpaceBattleGame();
