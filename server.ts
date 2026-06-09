import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Middleware to parse JSON
app.use(express.json());

// Initialize Gemini Client if API key is provided
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
  console.log('Gemini API client initialized successfully.');
} else {
  console.warn('Warning: GEMINI_API_KEY is not defined. Gemini features will be disabled.');
}

// Gemini AI Chat / Helper Endpoint
app.post('/api/ai/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: 'Gemini API key is missing on the server.' });
  }

  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // Generate content using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${context ? `Context: ${context}\n\n` : ''}User Question: ${prompt}` }]
        }
      ]
    });

    const reply = response.text || 'No response generated.';
    res.json({ reply });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to communicate with Gemini API.'
    res.status(500).json({ error: message });
  }
});

// Proxy logic for all other Spring Boot API requests
app.all('/api/*', async (req, res) => {
  // Exclude AI chat route from proxying
  if (req.originalUrl.startsWith('/api/ai/chat')) {
    return;
  }

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
