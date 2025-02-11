const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');
const { Vector3 } = require('babylonjs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let ships = [];
let planets = [];

app.use(express.static(path.join(__dirname, '../front')));

function generatePlanetPosition(existingPlanets) {
    let position;
    let isValidPosition = false;

    while (!isValidPosition) {
        position = new Vector3(
            (Math.random() - 0.5) * 10000,
            (Math.random() - 0.5) * 10000,
            (Math.random() - 0.5) * 10000
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
        const size = Math.random() * 200 + 100;
        const position = generatePlanetPosition(existingPlanets);

        let isStar = Math.floor(Math.random() * 50) === 0;
        const planet = { size, position, isStar }; // Simplified planet object
        existingPlanets.push(planet);
    }
}

spawnPlanets(planets, 100);

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.send(JSON.stringify({ type: 'init', ships, planets })); // Send initial data to client

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'newShip') {
            const newShip = {
                id: data.id,
                position: new Vector3(0, 0, 0),
                rotation: new Vector3(0, 0, 0),
                velocity: new Vector3(0, 0, 0)
            };
            ships.push(newShip);
            broadcast({ type: 'newShip', ship: newShip });
        } else if (data.type === 'updateShip') {
            const ship = ships.find(s => s.id === data.id);
            if (ship) {
                ship.position = data.position;
                ship.rotation = data.rotation;
                ship.velocity = data.velocity;
                broadcast({ type: 'updateShip', ship });
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
