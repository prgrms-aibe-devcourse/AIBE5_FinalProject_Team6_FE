import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Middleware to parse JSON
app.use(express.json());

// Proxy logic for all Spring Boot API requests
app.all('/api/*', async (req, res) => {
  const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${targetUrl}`);

  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, val]) => {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach(v => headers.append(key, v));
        } else {
          headers.append(key, val);
        }
      }
    });

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const responseText = await response.text();
    res.status(response.status);
    
    // Copy target headers back to client response
    response.headers.forEach((value, key) => {
      // Avoid duplicate chunked encoding headers
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.send(responseText);
  } catch (error) {
    console.error('[Proxy Error]:', error);
    res.status(502).json({ error: 'Failed to contact backend server.' });
  }
});

// Serve frontend static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For all other requests, serve index.html (SPA Router support)
app.get('*', (req, res) => {
  // If requesting an API that fell through
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
