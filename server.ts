import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory server-authoritative store for cross-device sync
const serverStore = {
  syncEvents: [] as any[],
  lastSyncedTimestamp: new Date().toISOString(),
  deviceCount: 3
};

function generatePharmacyFallback(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('napa') || q.includes('paracetamol') || q.includes('fever') || q.includes('জ্বর')) {
    return 'Napa (Paracetamol 500mg) is an analgesic and antipyretic manufactured by Beximco Pharma. Standard adult dose is 1-2 tablets every 4-6 hours as needed (maximum 4,000mg per 24 hours). Avoid taking with other paracetamol-containing products to protect liver health. For Gazipur home delivery within 45 minutes, you can add it to your cart and order via WhatsApp.';
  }
  if (q.includes('seclo') || q.includes('omeprazole') || q.includes('gastric') || q.includes('গ্যাস')) {
    return 'Seclo (Omeprazole 20mg) by Square Pharmaceuticals is a proton pump inhibitor used for acid reflux, gastritis, and ulcers. It is typically taken once daily in the morning 30-60 minutes before breakfast. Equivalent brands in Bangladesh include Losectil (SK+F) and Proceptin (Beximco).';
  }
  if (q.includes('insulin') || q.includes('lantus') || q.includes('cold') || q.includes('কোল্ড')) {
    return 'Insulin (such as Lantus SoloStar or Mixtard) requires strict cold-chain maintenance at 2°C to 8°C. Never freeze insulin. Pharmly BD dispatches all insulin and vaccines across Gazipur in certified ice-pack thermal carriers to ensure potency.';
  }
  if (q.includes('gazipur') || q.includes('delivery') || q.includes('গাজীপুর') || q.includes('ডেলিভারি')) {
    return 'Pharmly BD offers 45-minute rapid express delivery throughout Gazipur, including Chandana Chowrasta, Joydebpur Bazar, Tongi, Board Bazar, Konabari, and Shibbari. You can select medicines from our available stock, add them to your cart, and place an order directly via WhatsApp with Cash on Delivery or bKash.';
  }
  return 'Hello! I am Pharmly BD AI Clinical Pharmacy Assistant. I can assist you with medicine details, generic equivalents (e.g., Square, Beximco, Incepta), dosage schedules, insulin cold-chain guidelines, and our Gazipur 45-minute WhatsApp delivery service. How can I help you today?';
}

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

  // Gemini 3.8 Flash Multi-turn Clinical Pharmacy Chatbot Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const lastUserMsg = messages[messages.length - 1]?.content || '';
        const fallbackReply = generatePharmacyFallback(lastUserMsg);
        return res.json({ text: fallbackReply, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const systemInstruction = `You are the Pharmly BD AI Clinical Pharmacy Assistant (ফার্মেসী এআই সহকারী), serving Pharmly BD — a DGDA Certified Model Pharmacy in Gazipur, Bangladesh.
Your specific role and clinical instructions:
1. Provide accurate information on authentic Bangladesh medications (Square, Beximco, Incepta, Renata, ACME, etc.), brand vs generic equivalents (e.g. Paracetamol: Napa, Ace, Fast; Esomeprazole: Maxpro, Sergel; Omeprazole: Seclo; Montelukast: Monas).
2. Answer dosage guidelines, administration instructions (before/after meals), and common precautions.
3. Cold-Chain Advisory: For insulins (Lantus, Mixtard, Novorapid) and vaccines, remind patients about 2°C–8°C storage and dispatching with ice-pack thermal protection.
4. Gazipur Delivery Guidance: Inform users that Pharmly BD provides 45-minute rapid express delivery via WhatsApp across Chandana Chowrasta, Joydebpur, Tongi, Board Bazar, Konabari, Shibbari, and surrounding areas.
5. Patient Safety & Ethics: Always advise patients to consult a registered MBBS doctor for prescriptions and emergency medical conditions. If signs of severe illness or allergic reactions are mentioned, advise immediate hospital care.
6. Communication style: Welcoming, professional, clear, concise. Answer in English or Bengali (বাংলিশ/বাংলা) based on user preference.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const replyText = response.text || 'I am here to assist with your medicines, prescriptions, or Gazipur delivery inquiries.';
      res.json({ text: replyText });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      // If error occurs, fallback gracefully so chat stays functional
      const lastUserMsg = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
      res.json({ 
        text: generatePharmacyFallback(lastUserMsg),
        isFallback: true
      });
    }
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
