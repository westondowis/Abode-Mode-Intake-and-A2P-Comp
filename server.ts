import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { processIncomingLead, getRecentAuditLeads, dispatchLeadNotifications } from './server/leadService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// Lead Intake Submission Route: Persists to Firestore + Audit Log & Triggers Asynchronous Alerts
app.post('/api/leads/submit', async (req, res) => {
  try {
    const data = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: JSON object expected' });
    }

    const fullName = String(data.fullName || '').trim();
    const phone = String(data.phone || '').trim();
    const email = String(data.email || '').trim();

    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!phone && !email) {
      return res.status(400).json({ error: 'At least one contact method (phone or email) is required' });
    }

    const leadId =
      data.id && typeof data.id === 'string' && data.id.startsWith('ABODE-')
        ? data.id
        : `ABODE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const flow: 'buy' | 'sell' = data.flow === 'buy' ? 'buy' : 'sell';
    const nowIso = new Date().toISOString();

    const normalizedLead = {
      id: leadId,
      flow,
      fullName,
      phone,
      email,
      propertyAddress: String(data.propertyAddress || data.parcelOrAddress || '').trim(),
      parcelNumber: String(data.parcelNumber || '').trim(),
      county: String(data.county || '').trim(),
      state: String(data.state || '').trim(),
      acreage: String(data.acreage || '').trim(),
      askingPrice: String(data.askingPrice || data.sellTargetPrice || data.budgetRange || '').trim(),
      motivation: String(data.motivation || data.reasonForSelling || data.buyIntendedUse || '').trim(),
      timeline: String(data.timeline || data.sellTimeline || data.purchasingTimeline || '').trim(),
      occupancyCondition: String(data.occupancyCondition || data.sellOwnershipStatus || '').trim(),
      notes: String(data.notes || '').trim(),
      // A2P 10DLC & CTIA Carrier Compliance Metadata
      smsTransactionalConsent: Boolean(data.smsTransactionalConsent ?? data.smsConsentTransactional ?? false),
      smsMarketingConsent: Boolean(data.smsMarketingConsent ?? data.smsConsentMarketing ?? false),
      smsConsent: Boolean(data.smsConsent ?? (data.smsTransactionalConsent || data.smsMarketingConsent)),
      consentTimestamp: data.consentTimestamp || (data.smsTransactionalConsent || data.smsMarketingConsent ? nowIso : null),
      consentIpHint: String(data.consentIpHint || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'client-ip'),
      userAgent: String(data.userAgent || req.headers['user-agent'] || 'AbodeMode-Web/1.0'),
      disclosureVersion: String(data.disclosureVersion || 'CTIA_2026_V1'),
      nonSharingCovenantAccepted: Boolean(data.nonSharingCovenantAccepted ?? true),
      exactConsentDisclosureText: String(data.exactConsentDisclosureText || ''),
      submittedAt: String(data.submittedAt || nowIso),
      status: 'new',
    };

    const result = await processIncomingLead(normalizedLead);

    return res.status(200).json({
      success: true,
      leadId: result.leadId,
      persistedTo: result.persistedTo,
      timestamp: result.timestamp,
      message: 'Lead recorded in primary datastore and queued for acquisition team review',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process lead';
    console.error('[Server] Lead submission error:', message);
    return res.status(500).json({ error: message });
  }
});

// Audit / Admin endpoint to verify persisted leads
app.get('/api/leads', (_req, res) => {
  try {
    const leads = getRecentAuditLeads(50);
    return res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve leads';
    return res.status(500).json({ error: message });
  }
});

// Trigger test alert to verify notification pipeline
app.post('/api/leads/test-alert', async (_req, res) => {
  try {
    const testLead = {
      id: `ABODE-TEST-${Date.now().toString(36).toUpperCase()}`,
      flow: 'sell' as const,
      fullName: 'William Dowis (Acquisitions Desk Test)',
      phone: '(720) 649-0734',
      email: process.env.ACQUISITION_NOTIFICATION_EMAIL || 'wdowis@abodebuys.com',
      propertyAddress: '1000 Abode Mode Test Way, Costilla County, CO',
      parcelNumber: 'APN-TEST-2026-99',
      county: 'Costilla',
      state: 'CO',
      acreage: '10.5',
      askingPrice: '$25,000 Cash',
      motivation: 'End-to-End Pipeline Verification Test',
      timeline: 'Fast Close (<14 days)',
      occupancyCondition: 'Vacant Land / Clear Title',
      notes: 'Diagnostic test verifying email alert and webhook dispatch pipeline.',
      smsTransactionalConsent: true,
      smsMarketingConsent: false,
      smsConsent: true,
      consentTimestamp: new Date().toISOString(),
      consentIpHint: '127.0.0.1',
      userAgent: 'Server-Diagnostic/1.0',
      disclosureVersion: 'CTIA_2026_V1',
      nonSharingCovenantAccepted: true,
      submittedAt: new Date().toISOString(),
      status: 'reviewing',
    };

    await dispatchLeadNotifications(testLead);

    return res.json({
      success: true,
      message: `Test alert dispatched for ${process.env.ACQUISITION_NOTIFICATION_EMAIL || 'wdowis@abodebuys.com'}`,
      testLeadId: testLead.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Test alert failed';
    return res.status(500).json({ error: message });
  }
});


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
