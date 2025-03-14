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
            const id = Math.random().toString(36).substr(2, 9); // Génère un ID unique
            const newShip = new Ship(id);
            this.ships[id] = newShip;
            ws.shipId = id;
            console.log(`✅ Nouveau vaisseau créé: ${id}`);

            // Envoyer l'état du jeu au nouveau client (lui seul reçoit ça)
            ws.send(JSON.stringify({
                type: 'init',
                ships: Object.values(this.ships).map(s => s.toJSON()),
                planets: this.planets.map(p => p.toJSON()),
                projectiles: this.projectiles.map(p => p.toJSON()), // Ensure correct serialization
                playerId: id
            }));

            // Diffuser le NOUVEAU VAISSEAU à TOUS les autres clients
            this.broadcast({ type: 'newShip', ship: newShip.toJSON() }, ws);

        } else if (data.type === 'updateShip') {
            const ship = this.ships[data.id];
            if (ship) {
                ship.update(data);
                // Diffuser les nouvelles informations du vaisseau à tous les clients
                this.broadcast({ type: 'updateShip', ship: ship.toJSON() });
            }

        } else if (data.type === 'fireProjectile') {
            const ship = this.ships[data.shipId];
            if (ship) {
                if (!this.projectiles.find(p => p.id === data.id)) {
                    console.log(`🚀 Nouveau projectile ajouté au serveur: ${data.id}`);
                    const projectile = new Bullet(data);
                    this.projectiles.push(projectile);
                    this.broadcast({ type: 'newProjectile', projectile: projectile.toJSON() });
                }
            }
        }        
    }

    /** 🚀 Crée un vaisseau */
    createShip(id) {
        return new Ship(id);
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

    /** 🔄 Met à jour la physique des vaisseaux et projectiles */
    updatePhysics(deltaTime) {
        Object.values(this.ships).forEach(ship => {
            ship.position.addInPlace(ship.velocity.scale(deltaTime / 1000)); // Applique le déplacement
        });

        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
            // Update projectile properties
            projectile.position.addInPlace(projectile.velocity.scale(deltaTime / 1000));
            if (Date.now() - projectile.spawnTime > projectile.lifeTime) {
                projectile.visible = false;
            }

            // Suppression des projectiles qui dépassent la limite de coordonnées
            const maxCoord = 2000;
            if (Math.abs(projectile.position.x) > maxCoord || Math.abs(projectile.position.y) > maxCoord || Math.abs(projectile.position.z) > maxCoord) {
                projectile.visible = false;
            }
        });

        // Supprime les projectiles expirés ou hors limites
        this.projectiles = this.projectiles.filter(p => p.visible);
    }

    /** 🔄 Supprime les vaisseaux inactifs */
    removeDisconnectedShips(ws) {
        if (ws.shipId && this.ships[ws.shipId]) {
            delete this.ships[ws.shipId];
            console.log(`🛑 Suppression du vaisseau inactif: ${ws.shipId}`);
            this.broadcast({ type: 'removeShip', id: ws.shipId });
        }
    }

    /** 🔄 Boucle de mise à jour */
    gameLoop() {
        let lastTime = Date.now();

        const loop = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.updatePhysics(deltaTime);

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
