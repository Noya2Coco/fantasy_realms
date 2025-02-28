import { WebSocketServer } from 'ws';
import { Vector3 } from '@babylonjs/core';
import { Ship } from './physicalObjects/ship.js';
import { Planet } from './physicalObjects/planet.js';
import { Projectile } from './physicalObjects/projectile.js';

export class Game {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.ships = {};
        this.projectiles = [];
        this.planets = [];

        this.setupWebSocketHandlers();
        this.spawnPlanets(100); // Génère 100 planètes
        this.gameLoop();
    }

    /** 📡 Gère les connexions des clients */
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws) => {
            console.log('✅ Nouveau client connecté');

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(ws, data);
                } catch (error) {
                    console.error('❌ Erreur de parsing du message WebSocket:', error);
                }
            });

            ws.on('close', () => {
                console.log('❌ Client déconnecté');
                this.removeDisconnectedShips(ws);
            });
        });
    }

    /** 🛸 Gère les messages WebSocket */
    handleClientMessage(ws, data) {
        if (data.type === 'newShip') {
            const id = Math.random().toString(36).substr(2, 9); // Génère un ID unique pour le joueur

            const newShip = new Ship(id);
            this.ships[id] = newShip;
            ws.shipId = id;
            console.log('✅ Nouveau vaisseau créé:', id);

            ws.send(JSON.stringify({
                type: 'init',
                ships: Object.values(this.ships).map(s => s.toJSON()),
                planets: this.planets,
                projectiles: this.projectiles,
                playerId: id
            }));

            this.broadcast({ type: 'newShip', ship: newShip.toJSON() });

        } else if (data.type === 'updateShip') {
            const ship = this.ships[data.id];
            if (ship) {
                ship.update(data);
    
                // ❌ On envoie la mise à jour à tous sauf au joueur lui-même
                this.wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === 1) {
                        client.send(JSON.stringify({ type: 'updateShip', ship: ship.toJSON() }));
                    }
                });
            }

        } else if (data.type === 'fireProjectile') {
            const ship = this.ships[data.id];
            if (ship) {
                const projectile = this.createProjectile(ship);
                this.projectiles.push(projectile);
                this.broadcast({ type: 'newProjectile', projectile });
            }
        } else if (data.type === 'keyPress' || data.type === 'keyRelease') {
            const ship = this.ships[data.id];
            if (ship) {
                this.broadcast({ type: 'updateShip', ship: ship.toJSON() });
            }
        }
    }

    /** 🚀 Crée un vaisseau */
    createShip(id) {
        return new Ship(id);
    }

    /** 💥 Crée un projectile */
    createProjectile(ship) {
        return {
            id: `proj-${Math.random().toString(36).substr(2, 9)}`,
            position: ship.position.clone(),
            velocity: new Vector3(0, 0, 3).applyRotationQuaternion(ship.rotation),
            lifeTime: 5000 // Durée de vie du projectile (5s)
        };
    }

    /** 🌍 Génère des planètes */
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

    /** 🔄 Met à jour les projectiles */
    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.position.addInPlace(projectile.velocity.scale(deltaTime / 16)); // Ajuste selon le deltaTime
            projectile.lifeTime -= deltaTime;

            return projectile.lifeTime > 0 && 
                   Vector3.Distance(projectile.position, new Vector3(0, 0, 0)) < 500;
        });
    }

    /** 🔄 Supprime les vaisseaux inactifs */
    removeDisconnectedShips(ws) {
        if (ws.shipId && this.ships[ws.shipId]) {
            delete this.ships[ws.shipId];
            console.log(`🛑 Suppression du vaisseau inactif: ${ws.shipId}`);
            this.broadcast({ type: 'removeShip', id: ws.shipId });
        }
    }

    /** 🌍 Gère la gravité des planètes */
    applyGravity() {
        Object.values(this.ships).forEach((ship) => {
            let totalForce = new Vector3(0, 0, 0);
            this.planets.forEach((planet) => {
                const distance = Vector3.Distance(ship.position, planet.position);
                if (distance < 1000) {
                    const forceDirection = planet.position.subtract(ship.position).normalize();
                    const gravitationalForce = forceDirection.scale((planet.size / distance) * 0.1);
                    totalForce.addInPlace(gravitationalForce);
                }
            });

            ship.velocity.addInPlace(totalForce);
        });
    }

    /** 🔄 Boucle de mise à jour */
    gameLoop() {
        let lastTime = Date.now();

        const loop = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.applyGravity();
            this.updateProjectiles(deltaTime);
            
            this.broadcast({
                type: 'updateGameState',
                ships: Object.values(this.ships).map(s => s.toJSON()),
                projectiles: this.projectiles.map(p => p.toJSON()),
                planets: this.planets.map(p => p.toJSON())
            });

            setTimeout(loop, 50);
        };

        loop();
    }

    /** 📡 Envoie les mises à jour aux clients */
    broadcast(data) {
        this.wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(data));
            }
        });
    }
}
