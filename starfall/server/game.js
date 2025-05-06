import { WebSocketServer } from 'ws';
import { Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Planet } from './physicalObjects/planet.js';
import { Bullet } from './physicalObjects/bullet.js';
import { Particle } from './physicalObjects/particle.js';
import fetch from 'node-fetch'; // Importer fetch pour les requêtes HTTP

export class Game {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.ships = {};
        this.projectiles = [];
        this.planets = [];
        this.particles = []; // Ajout de la liste des particules

        this.setupWebSocketHandlers();
        this.spawnPlanets(100); // Generate 100 planets
        this.gameLoop();
    }

    /** Handles client connections */
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, req) => {
            console.log('✅ New client connected');
            
            // Extraire le token utilisateur de la requête WebSocket
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const userToken = urlParams.get('token');
            ws.userToken = userToken;
            console.log(`✅ User connected with token: ${userToken || 'anonymous'}`);

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

    /** Handles WebSocket messages */
    handleClientMessage(ws, data) {
        if (data.type === 'newShip') {
            const id = Math.random().toString(36).substr(2, 9); // Generate a unique ID

            // Extract the token from the WebSocket request
            const userToken = ws.userToken || 'anonymous';

            // Generate a random position
            const distance = Math.random() * 500;
            const angle1 = Math.random() * Math.PI * 2;
            const angle2 = Math.random() * Math.PI;
            const position = {
                x: distance * Math.sin(angle2) * Math.cos(angle1),
                y: distance * Math.sin(angle2) * Math.sin(angle1),
                z: distance * Math.cos(angle2)
            };

            // Pass the token to the Ship object
            const newShip = new Ship(id, position, userToken);
            this.ships[id] = newShip;
            ws.shipId = id;
            console.log(`✅ New ship created: ${id} for user ${newShip.token}`);

            // Send the game state to the new client
            ws.send(JSON.stringify({
                type: 'init',
                ships: Object.values(this.ships).map(s => s.toJSON()),
                planets: this.planets.map(p => p.toJSON()),
                projectiles: this.projectiles.map(p => p.toJSON()),
                playerId: id
            }));

            // Broadcast the new ship to all other clients
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
        } else if (data.type === 'addParticle') {
            if (!this.particles.some(p => p.id === data.particle.id)) { // Vérifie si la particule existe déjà
                console.log(`📥 Received new particle from client: ${JSON.stringify(data.particle)}`); // Log réception particule
                const particle = new Particle(data.particle); // Assurez-vous que la classe Particle est bien importée
                this.particles.push(particle);
                this.broadcast({ type: 'newParticle', particle: particle.toJSON() });
                console.log(`📤 Broadcasted new particle to clients: ${JSON.stringify(particle.toJSON())}`); // Log envoi particule
            }
        }        
    }

    /** Creates a ship */
    createShip(id) {
        return new Ship(id);
    }

    /** Generates planets */
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

    /** Updates the physics of ships, projectiles, and particles */
    async handlePlayerDeath(ship) {
        console.log(`💀 Ship ${ship.id} destroyed`);
        const killerShip = Object.values(this.ships).find(s => s.id === ship.lastHitBy); // Trouve le vaisseau qui a infligé le dernier coup
        if (killerShip) {
            killerShip.kills += 1; // Incrémente le compteur de kills du tueur
            console.log(`🔪 Ship ${killerShip.id} killed ${ship.id}. Total kills: ${killerShip.kills}`);

            // Notifie tous les clients du nouveau nombre de kills
            this.broadcast({
                type: 'updateKillerKills',
                id: killerShip.id,
                kills: killerShip.kills
            });
        }

        // Diffuse la santé mise à jour (0) avant de supprimer le vaisseau
        this.broadcast({
            type: 'updateShipHealth',
            id: ship.id,
            health: 0
        });

        delete this.ships[ship.id];
        this.broadcast({ type: 'removeShip', id: ship.id });

        // Envoi de la requête POST à localhost
        const payload = {
            user: ship.token,
            score: ship.kills,
            game: 'starfall'
        };

        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const response = await fetch('http://localhost:4000/newScore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log(`✅ Score sent for ship ${ship.id}`);
                break;
            } catch (error) {
                attempt++;
                console.error(`❌ Attempt ${attempt} failed to send score for ship ${ship.id}:`, error.message);
                if (attempt >= maxRetries) {
                    console.error(`❌ All attempts to send score for ship ${ship.id} failed. Payload:`, payload);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                }
            }
        }
    }

    updatePhysics(deltaTime) {
        const maxCoord = 10000;
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

            // Check collision with stars
            this.planets.forEach(planet => {
                if (planet.isStar && this.checkCollisionWithPlanet(ship, planet)) {
                    console.log(`💥 Ship ${ship.id} collided with star ${planet.id}`);
                    this.handlePlayerDeath(ship);
                }
            });
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
                    ship.health -= 10; // Réduit la santé du vaisseau de 10
                    projectile.visible = false; // Supprime le projectile
                    ship.lastHitBy = projectile.shipId; // Enregistre l'ID du dernier attaquant
                    console.log(`💥 Ship ${ship.id} hit by projectile ${projectile.id}. Health: ${ship.health}`);

                    if (ship.health <= 0) {
                        this.handlePlayerDeath(ship); // Gère la mort du joueur
                    } else {
                        // Toujours diffuser la santé mise à jour, même si le vaisseau n'est pas détruit
                        this.broadcast({
                            type: 'updateShipHealth',
                            id: ship.id,
                            health: ship.health
                        });
                    }
                }
            });
        });

        // Remove expired or out-of-bounds projectiles
        this.projectiles = this.projectiles.filter(p => p.visible);

        // Mise à jour des particules
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });

        // Suppression des particules expirées
        this.particles = this.particles.filter(p => p.lifeTime > 0);
    }

    /** Checks for collision between a ship and a projectile */
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

    /** Checks for collision between a ship and a planet */
    checkCollisionWithPlanet(ship, planet) {
        const distance = Vector3.Distance(ship.position, planet.position);
        const collisionRadius = planet.isStar ? planet.size : planet.size / 2; // Augmente la taille pour les étoiles
        return distance <= collisionRadius;
    }

    /** Removes inactive ships */
    removeDisconnectedShips(ws) {
        if (ws.shipId && this.ships[ws.shipId]) {
            delete this.ships[ws.shipId];
            console.log(`🛑 Removing inactive ship: ${ws.shipId}`);
            this.broadcast({ type: 'removeShip', id: ws.shipId });
        }
        ws.terminate(); // Ensure proper WebSocket connection closure
    }

    /** Update loop */
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
                    projectiles: this.projectiles.map(p => p.toJSON()).filter(p => p.visible),
                    planets: this.planets.map(p => p.toJSON()),
                    particles: this.particles.map(p => p.toJSON()) // Ajout des particules
                });
                lastBroadcastTime = currentTime;
            }
            
            setImmediate(loop);
        };

        loop();
    }

    /** Sends updates to clients */
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
