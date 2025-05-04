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

// Launch the WebSocket server
new Game(server);

// Launch the HTTP server
const PORT = 22220;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP server running at http://0.0.0.0:${PORT}`);
});
