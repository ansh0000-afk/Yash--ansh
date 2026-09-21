import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import apiHandler from './api/[...route].ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Delegate all /api requests to the unified API handler
app.all('/api*', (req, res) => {
  apiHandler(req, res);
});

// Catch-all 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// Express Global Error Handler for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Express API Global Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || err.statusCode || (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') ? 429 : 500);
  res.status(statusCode).json({
    error: err.message || 'An unexpected server error occurred',
    isRateLimit: statusCode === 429
  });
});

// Start Server & Vite Setup for standalone execution
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal AI Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
