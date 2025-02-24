import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Game } from './game.js';

const app = express();
const server = createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist')); // Sert le client buildé en prod
}

// Lancer le serveur WebSocket
const game = new Game(server);

// Configuration pour utiliser __dirname avec ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lancer le serveur HTTP
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Serveur HTTP lancé sur http://localhost:${PORT}`);
});
