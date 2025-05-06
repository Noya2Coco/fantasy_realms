import express from 'express';
import { createServer } from 'http';
import compression from 'compression';
import helmet from 'helmet';
import { Game } from './game.js';

const app = express();
const server = createServer(app);

app.use(compression()); // Enable gzip compression for better performance
app.use(helmet()); // Secure the app by setting various HTTP headers

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist')); // Serve the built client in production
}

// Ajouter un endpoint pour vérifier si le serveur est en ligne
app.get('/health', (req, res) => {
  res.status(200).send('Server is up and running!');
});

// Ajouter un middleware pour logger les requêtes entrantes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ajoutez un middleware pour vérifier le token utilisateur
app.use((req, res, next) => {
  const token = req.query.token || req.headers['x-user-token'];
  if (token) {
    console.log(`🔑 Token utilisateur reçu: ${token}`);
    req.userToken = token; // Attach the token to the request object
  } else {
    console.warn("⚠️ Aucun token utilisateur reçu.");
  }
  next();
});

// Launch the WebSocket server
new Game(server);

// Launch the HTTP server
const PORT = 22220;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP server running at http://0.0.0.0:${PORT}`);
  console.log(`✅ WebSocket server is ready to accept connections`);
});
