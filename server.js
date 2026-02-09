import { CardGame } from './src/Game.js';
import ServerModule from 'boardgame.io/dist/cjs/server.js';
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';

const { Server, Origins } = ServerModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Server({
  games: [CardGame],
  // Allow localhost and all origins for Render deployment
  origins: [Origins.LOCALHOST, '*'],
});

const PORT = process.env.PORT || 8000;

// Serve static files from the 'dist' directory
server.app.use(serve(path.join(__dirname, 'dist')));

server.run(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});