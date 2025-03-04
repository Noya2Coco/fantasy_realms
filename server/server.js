import express from 'express';
import { createServer } from 'http';
import { Game } from './game.js';

const app = express();
const server = createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist')); // Sert le client buildé en prod
}

// Lancer le serveur WebSocket
new Game(server);

// Lancer le serveur HTTP
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Serveur HTTP lancé sur http://localhost:${PORT}`);
});
