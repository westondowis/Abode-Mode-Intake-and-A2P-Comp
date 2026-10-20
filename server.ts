import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Imagen placeholder image generation proxy route
app.post('/api/generate-land-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '4:3' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured',
        needsApiKey: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Supported aspect ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
    const validAspectRatio =
      aspectRatio === '16:9' || aspectRatio === '1:1' || aspectRatio === '4:3' || aspectRatio === '3:4'
        ? aspectRatio
        : '4:3';

    // Try Imagen model first: imagen-3.0-generate-002
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: validAspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
          outputMimeType: 'image/jpeg',
        },
      });

      const base64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64) {
        return res.json({
          imageUrl: `data:image/jpeg;base64,${base64}`,
          model: 'imagen-3.0-generate-002',
          prompt,
        });
      }
    } catch (imagenErr) {
      console.warn('Imagen 3 error, trying gemini-3.1-flash-lite-image fallback:', imagenErr);

      // Fallback to gemini-3.1-flash-lite-image
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio,
          },
        },
      });

      for (const part of geminiRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({
            imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
            model: 'gemini-3.1-flash-lite-image',
            prompt,
          });
        }
      }
    }

    return res.status(500).json({ error: 'Failed to generate image from AI models' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image generation failed';
    console.error('Server image generation error:', message);
    return res.status(500).json({ error: message });
  }
});

// Dev or Prod setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
