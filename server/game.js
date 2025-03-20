import { WebSocketServer } from 'ws';
import { Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Planet } from './physicalObjects/planet.js';
import { Bullet } from './physicalObjects/bullet.js';

export class Game {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.ships = {};
        this.projectiles = [];
        this.planets = [];

        this.setupWebSocketHandlers();
        this.spawnPlanets(100); // Generate 100 planets
        this.gameLoop();
    }

    /** 📡 Handles client connections */
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws) => {
            console.log('✅ New client connected');

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(ws, data);
                } catch (error) {
                    console.error('❌ WebSocket message parsing error:', error);
                }
            });

            ws.on('close', () => {
                console.log('❌ Client disconnected');
                this.removeDisconnectedShips(ws);
                ws.terminate(); // Ensure proper WebSocket connection closure
            });

            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
                this.removeDisconnectedShips(ws); // Ensure proper cleanup on error
                ws.terminate(); // Ensure proper WebSocket connection closure on error
            });
        });
    }

    /** 🛸 Handles WebSocket messages */
    handleClientMessage(ws, data) {
        if (data.type === 'newShip') {
            const id = Math.random().toString(36).substr(2, 9); // Generate a unique ID
            const newShip = new Ship(id);
            this.ships[id] = newShip;
            ws.shipId = id;
            console.log(`✅ New ship created: ${id}`);

            // Send the game state to the new client (only they receive this)
            ws.send(JSON.stringify({
                type: 'init',
                ships: Object.values(this.ships).map(s => s.toJSON()),
                planets: this.planets.map(p => p.toJSON()),
                projectiles: this.projectiles.map(p => p.toJSON()), // Ensure correct serialization
                playerId: id
            }));

            // Broadcast the NEW SHIP to ALL other clients
            this.broadcast({ type: 'newShip', ship: newShip.toJSON() }, ws);

        } else if (data.type === 'updateShip') {
            const ship = this.ships[data.id];
            if (ship) {
                ship.update(data);
                // Broadcast the new ship information to all clients
                this.broadcast({ type: 'updateShip', ship: ship.toJSON() });
            }

        } else if (data.type === 'fireProjectile') {
            const ship = this.ships[data.shipId];
            if (ship) {
                if (!this.projectiles.find(p => p.id === data.id)) {
                    console.log(`🚀 New projectile added to server: ${data.id}`);
                    const projectile = new Bullet(data);
                    this.projectiles.push(projectile);
                    this.broadcast({ type: 'newProjectile', projectile: projectile.toJSON() });
                }
            }
        }        
    }

    /** 🚀 Creates a ship */
    createShip(id) {
        return new Ship(id);
    }

    /** 🌍 Generates planets */
    spawnPlanets(num) {
        for (let i = 0; i < num; i++) {
            const size = Math.random() * 200 + 100;
            const position = {
                x: (Math.random() - 0.5) * 10000,
                y: (Math.random() - 0.5) * 10000,
                z: (Math.random() - 0.5) * 10000
            };
            const planet = new Planet(`planet-${i}`, size, position, Math.random() < 0.05);
            this.planets.push(planet);
        }
    }

    /** 🔄 Updates the physics of ships and projectiles */
    updatePhysics(deltaTime) {
        const maxCoord = 2000;
        const teleportCooldown = 1000; // 1 second cooldown for teleportation

        Object.values(this.ships).forEach(ship => {
            ship.position.addInPlace(ship.velocity.scale(deltaTime / 1000)); // Apply movement

            // Teleport ships that exceed coordinate limits
            if (Math.abs(ship.position.x) > maxCoord || Math.abs(ship.position.y) > maxCoord || Math.abs(ship.position.z) > maxCoord) {
                const currentTime = Date.now();
                if (!ship.lastTeleportTime || currentTime - ship.lastTeleportTime > teleportCooldown) {
                    ship.position.x = -ship.position.x;
                    ship.position.y = -ship.position.y;
                    ship.position.z = -ship.position.z;
                    ship.lastTeleportTime = currentTime;
                    console.log(`🔄 Teleporting ship ${ship.id} to the opposite side of the sphere`);
                    this.broadcast({ type: 'teleportShip', ship: ship.toJSON() });
                }
            }
        });

        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
            // Update projectile properties
            projectile.position.addInPlace(projectile.velocity.scale(deltaTime / 1000));
            if (Date.now() - projectile.spawnTime > projectile.lifeTime) {
                projectile.visible = false;
            }

            // Remove projectiles that exceed coordinate limits
            if (Math.abs(projectile.position.x) > maxCoord || Math.abs(projectile.position.y) > maxCoord || Math.abs(projectile.position.z) > maxCoord) {
                projectile.visible = false;
            }
        });

        // Check for collisions between ships and projectiles
        this.projectiles.forEach(projectile => {
            Object.values(this.ships).forEach(ship => {
                if (projectile.shipId !== ship.id && this.checkCollision(ship, projectile)) {
                    ship.health -= 10; // Reduce ship health by 10
                    projectile.visible = false; // Remove the projectile
                    console.log(`💥 Ship ${ship.id} hit by projectile ${projectile.id}. Health: ${ship.health}`);
                    this.broadcast({ type: 'updateShipHealth', id: ship.id, health: ship.health }); // Send updated health to clients
                    if (ship.health <= 0) {
                        console.log(`💀 Ship ${ship.id} destroyed`);
                        delete this.ships[ship.id];
                        this.broadcast({ type: 'removeShip', id: ship.id });
                    }
                }
            });
        });

        // Remove expired or out-of-bounds projectiles
        this.projectiles = this.projectiles.filter(p => p.visible);
    }

    /** 🔄 Checks for collision between a ship and a projectile */
    checkCollision(ship, projectile) {
        const shipMin = ship.position.subtract(new Vector3(ship.hitbox.width / 2, ship.hitbox.height / 2, ship.hitbox.depth / 2));
        const shipMax = ship.position.add(new Vector3(ship.hitbox.width / 2, ship.hitbox.height / 2, ship.hitbox.depth / 2));
        const bulletMin = projectile.position.subtract(new Vector3(projectile.hitbox.radius, projectile.hitbox.radius, projectile.hitbox.length / 2));
        const bulletMax = projectile.position.add(new Vector3(projectile.hitbox.radius, projectile.hitbox.radius, projectile.hitbox.length / 2));

        return (
            shipMin.x <= bulletMax.x && shipMax.x >= bulletMin.x &&
            shipMin.y <= bulletMax.y && shipMax.y >= bulletMin.y &&
            shipMin.z <= bulletMax.z && shipMax.z >= bulletMin.z
        );
    }

    /** 🔄 Removes inactive ships */
    removeDisconnectedShips(ws) {
        if (ws.shipId && this.ships[ws.shipId]) {
            delete this.ships[ws.shipId];
            console.log(`🛑 Removing inactive ship: ${ws.shipId}`);
            this.broadcast({ type: 'removeShip', id: ws.shipId });
        }
        ws.terminate(); // Ensure proper WebSocket connection closure
    }

    /** 🔄 Update loop */
    gameLoop() {
        let lastTime = Date.now();
        let lastBroadcastTime = Date.now(); // Added a variable to limit broadcast frequency

        const loop = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.updatePhysics(deltaTime);

            // Limit broadcast frequency to 20 times per second (50ms)
            if (currentTime - lastBroadcastTime > 50) {
                this.broadcast({
                    type: 'updateGameState',
                    ships: Object.values(this.ships).map(s => s.toJSON()),
                    projectiles: this.projectiles.map(p => p.toJSON()).filter(p => p.visible), // Only keep visible ones
                    planets: this.planets.map(p => p.toJSON())
                });
                lastBroadcastTime = currentTime;
            }
            
            setImmediate(loop);
        };

        loop();
    }

    /** 📡 Sends updates to clients */
    broadcast(data, excludeWs = null) {
        this.wss.clients.forEach(client => {
            if (client !== excludeWs && client.readyState === 1) {
                try {
                    client.send(JSON.stringify(data));
                } catch (error) {
                    console.error('❌ WebSocket message send error:', error);
                }
            }
        });
    }
}
