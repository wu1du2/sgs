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

server.app.use(async (ctx, next) => {
  if (ctx.path === '/api/reset' && ctx.method === 'POST') {
    try {
      if (server.db) {
        await server.db.wipe('default');
        console.log('Match "default" wiped.');
      }
      ctx.status = 200;
      ctx.body = { success: true };
    } catch (e) {
      console.error('Reset error:', e);
      ctx.status = 500;
      ctx.body = { error: e.message };
    }
    return;
  }
  await next();
});

const PORT = process.env.PORT || 8000;

// Serve static files from the 'dist' directory
server.app.use(serve(path.join(__dirname, 'dist')));

server.run(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});