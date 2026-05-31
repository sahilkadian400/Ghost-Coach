import express from 'express';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const SPRING_BOOT_URL = 'http://localhost:8080';

async function startServer() {
  const app = express();

  // Transparently proxy all `/api` and `/error` requests to Spring Boot on Port 8080
  app.use(['/api', '/error'], (req, res) => {
    const targetPath = req.baseUrl + req.url; // preserve path parameters and queries

    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 8080,
      path: targetPath,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      if (proxyRes.statusCode) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.warn(`[Proxy Request Error] Could not reach Spring Boot backend on Port 8080:`, err.message);
      res.status(502).json({
        error: 'Spring Boot backend server is starting up or has not been run on port 8080.'
      });
    });

    // Pipe the client's request stream (e.g. multipart/form-data images or login payloads) into the proxy request
    req.pipe(proxyReq);
  });

  // --- FRONTEND DEVELOPER SETUP & ROUTING ---
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite development server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static client bundle in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Development entry server active on http://localhost:${PORT}`);
    console.log(`Transparently routing all /api calls to Spring Boot on ${SPRING_BOOT_URL}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to startup entry proxy server:", error);
});
