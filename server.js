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

const IMAGE_HOSTS = new Set(['raw.githubusercontent.com', 'patchwiki.biligame.com']);
const IMAGE_CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400';

server.app.use(async (ctx, next) => {
  if (ctx.path === '/api/reset' && ctx.method === 'POST') {
    try {
      if (server.db) {
        let matchIDs = [];
        if (typeof server.db.listMatches === 'function') {
          matchIDs = await server.db.listMatches();
        } else if (typeof server.db.listGames === 'function') {
          matchIDs = await server.db.listGames();
        }
        if (matchIDs.length === 0) {
          console.log('No matches to wipe.');
        } else {
          await Promise.all(matchIDs.map((matchID) => server.db.wipe(matchID)));
          console.log(`Wiped ${matchIDs.length} matches.`);
        }
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

server.app.use(async (ctx, next) => {
  if (ctx.path === '/img' && ctx.method === 'GET') {
    const url = ctx.query?.url;
    if (!url) {
      ctx.status = 400;
      ctx.body = 'Missing url';
      return;
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      ctx.status = 400;
      ctx.body = 'Invalid url';
      return;
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      ctx.status = 400;
      ctx.body = 'Invalid protocol';
      return;
    }
    if (!IMAGE_HOSTS.has(parsed.hostname)) {
      ctx.status = 403;
      ctx.body = 'Host not allowed';
      return;
    }
    try {
      const response = await fetch(parsed.toString());
      if (!response.ok) {
        ctx.status = response.status;
        ctx.body = `Upstream error: ${response.status}`;
        return;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type');
      if (contentType) ctx.set('Content-Type', contentType);
      ctx.set('Cache-Control', IMAGE_CACHE_CONTROL);
      ctx.body = buffer;
      return;
    } catch (e) {
      ctx.status = 502;
      ctx.body = 'Proxy error';
      return;
    }
  }
  await next();
});

const PORT = process.env.PORT || 8000;

// Serve static files from the 'dist' directory
server.app.use(serve(path.join(__dirname, 'dist')));

server.run(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
