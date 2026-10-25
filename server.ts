import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory server-authoritative store for cross-device sync
const serverStore = {
  syncEvents: [] as any[],
  lastSyncedTimestamp: new Date().toISOString(),
  deviceCount: 3
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Routes for cross-device sync
  app.get('/api/sync/status', (req, res) => {
    res.json({
      status: 'ONLINE',
      serverTime: new Date().toISOString(),
      registeredNodes: serverStore.deviceCount,
      totalSyncedEvents: serverStore.syncEvents.length,
      pharmacyNode: 'Dhaka-Central-Hub'
    });
  });

  app.post('/api/sync/push', (req, res) => {
    const { batch, deviceId, timestamp } = req.body;
    if (Array.isArray(batch)) {
      batch.forEach((item: any) => {
        serverStore.syncEvents.push({
          ...item,
          receivedAt: new Date().toISOString(),
          originDevice: deviceId || 'client'
        });
      });
      serverStore.lastSyncedTimestamp = new Date().toISOString();
    }
    res.json({
      success: true,
      processed: Array.isArray(batch) ? batch.length : 0,
      serverTimestamp: serverStore.lastSyncedTimestamp
    });
  });

  app.get('/api/sync/pull', (req, res) => {
    const since = req.query.since as string;
    let events = serverStore.syncEvents;
    if (since) {
      events = events.filter(e => e.receivedAt > since);
    }
    res.json({
      success: true,
      events,
      serverTimestamp: new Date().toISOString()
    });
  });

  // Medicine public query endpoint
  app.get('/api/medicines/search', async (req, res) => {
    const q = (req.query.q as string || '').toLowerCase();
    res.json({
      query: q,
      results: []
    });
  });

  // Mount Vite or serve static
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pharmly BD Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
