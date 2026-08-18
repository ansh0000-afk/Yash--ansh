import type { IncomingMessage, ServerResponse } from 'node:http';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';

const MODEL_ALIASES: Record<string, string> = {
  'gemini-3.5-flash': 'gemini-3.5-flash',
  'gemini-3.6-flash': 'gemini-3.6-flash',
  'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
};

const MODEL_LIST = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'google', providerLabel: 'Google Gemini', description: 'Fast multimodal model for chat, reasoning and agentic tasks.', contextWindow: '1M tokens', speed: 'Ultra Fast', isFree: true, badge: 'Recommended', supportsImage: true },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google', providerLabel: 'Google Gemini', description: 'Strong general-purpose Gemini model for sustained agentic and coding tasks.', contextWindow: '1M tokens', speed: 'Fast', isFree: true, supportsImage: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.5 Flash-Lite', provider: 'google', providerLabel: 'Google Gemini', description: 'Cost-efficient model for high-throughput tasks.', contextWindow: '1M tokens', speed: 'Ultra Fast', isFree: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', provider: 'google', providerLabel: 'Google Gemini', description: 'Fast lightweight multimodal model.', contextWindow: '1M tokens', speed: 'Ultra Fast', isFree: true },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'google', providerLabel: 'Google Gemini', description: 'Advanced reasoning for complex coding and analysis.', contextWindow: '1M tokens', speed: 'Fast', isFree: true, badge: 'Reasoning', supportsImage: true },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'openrouter', providerLabel: 'OpenRouter', description: 'Optional OpenRouter reasoning model.', contextWindow: 'Provider dependent', speed: 'Balanced', isFree: true, badge: 'Optional' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', provider: 'openrouter', providerLabel: 'OpenRouter', description: 'Optional OpenRouter model.', contextWindow: 'Provider dependent', speed: 'Fast', isFree: true, badge: 'Optional' },
];

function json(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gemini-API-Key, X-API-Key, X-OpenRouter-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

async function body(req: IncomingMessage & { body?: unknown }): Promise<any> {
  if (req.body !== undefined) {
    if (typeof req.body === 'object' && req.body !== null) return req.body;
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function getGeminiKey(req: IncomingMessage): string | null {
  const headers = req.headers || {};
  const headerKey = headers['x-gemini-api-key'] || headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();
  const auth = headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    const value = auth.slice(7).trim();
    if (value.startsWith('AIza')) return value;
  }
  const envKey = process.env.GEMINI_API_KEY?.trim();
  return envKey || null;
}

function getOpenRouterKey(req: IncomingMessage): string | null {
  const headers = req.headers || {};
  const headerKey = headers['x-openrouter-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();
  return process.env.OPENROUTER_API_KEY?.trim() || null;
}

function maskKey(key?: string | null) {
  if (!key || key.length < 8) return 'Not Configured';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function errorStatus(message: string) {
  if (/429|RESOURCE_EXHAUSTED|rate limit|quota/i.test(message)) return 429;
  if (/401|403|unauthorized|forbidden/i.test(message)) return 401;
  if (/404|not found/i.test(message)) return 404;
  return 500;
}

async function geminiGenerate(apiKey: string, model: string, payload: any) {
  const response = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) {
    const message = data?.error?.message || text || `Gemini request failed (${response.status})`;
    const err: any = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

function normalizeModel(model?: string) {
  if (!model) return DEFAULT_MODEL;
  if (model.includes('/') || model.includes(':free')) return model;
  return MODEL_ALIASES[model] || model;
}

function toGeminiContents(messages: any[], attachedImage?: string) {
  const source = Array.isArray(messages) ? messages.slice(-12) : [];
  const contents: any[] = [];
  for (const msg of source) {
    if (!msg || !msg.content) continue;
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    contents.push({ role, parts: [{ text: String(msg.content) }] });
  }

  if (attachedImage) {
    const last = contents[contents.length - 1];
    if (last?.role === 'user') contents.pop();
    const match = String(attachedImage).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    const mimeType = match?.[1] || 'image/jpeg';
    const data = match?.[2] || String(attachedImage).replace(/^data:[^;]+;base64,/, '');
    const lastMessage = source[source.length - 1]?.content || 'Analyze this image.';
    contents.push({ role: 'user', parts: [{ inlineData: { mimeType, data } }, { text: String(lastMessage) }] });
  }
  return contents.length ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }];
}

function toolDeclarations() {
  return [{ functionDeclarations: [
    {
      name: 'create_task',
      description: 'Create a task on the user action board.',
      parameters: { type: 'OBJECT', properties: { title: { type: 'STRING' }, description: { type: 'STRING' }, priority: { type: 'STRING' }, dueDate: { type: 'STRING' } }, required: ['title'] }
    },
    {
      name: 'save_note',
      description: 'Save a useful note to the user knowledge base.',
      parameters: { type: 'OBJECT', properties: { title: { type: 'STRING' }, content: { type: 'STRING' }, category: { type: 'STRING' } }, required: ['title', 'content'] }
    },
    {
      name: 'save_user_memory',
      description: 'Save an important user preference, fact, goal or instruction.',
      parameters: { type: 'OBJECT', properties: { key: { type: 'STRING' }, value: { type: 'STRING' }, category: { type: 'STRING' } }, required: ['key', 'value'] }
    }
  ] }];
}

async function chatWithGemini(req: IncomingMessage, data: any) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured on Vercel.'), { status: 500 });

  const persona = data.persona || { systemPrompt: 'You are Alpha AI, a helpful personal AI assistant.' };
  let system = String(persona.systemPrompt || 'You are Alpha AI, a helpful personal AI assistant.');
  if (data.settings?.userCustomInstructions) system += `\n\nUser instructions:\n${data.settings.userCustomInstructions}`;
  system += `\n\nCurrent date/time: ${new Date().toLocaleString('en-IN')}`;

  if (Array.isArray(data.tasks) && data.tasks.length) {
    const active = data.tasks.filter((t: any) => t.status !== 'completed').slice(0, 8);
    system += `\n\nActive tasks:\n${active.map((t: any) => `- ${t.title} (${t.priority || 'medium'})`).join('\n')}`;
  }
  if (Array.isArray(data.notes) && data.notes.length) {
    system += `\n\nRecent notes:\n${data.notes.slice(0, 5).map((n: any) => `- ${n.title}`).join('\n')}`;
  }
  if (Array.isArray(data.userMemory) && data.userMemory.length) {
    system += `\n\nKnown user preferences/facts:\n${data.userMemory.slice(0, 10).map((m: any) => `- ${m.key}: ${m.value}`).join('\n')}`;
  }

  const modelRequested = normalizeModel(data.settings?.selectedModel || data.settings?.aiModel);
  const candidates = Array.from(new Set([
    modelRequested,
    DEFAULT_MODEL,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
  ])).filter(Boolean);

  let lastError: any = null;
  for (const model of candidates) {
    if (model.includes('/') || model.includes(':free')) {
      const orKey = getOpenRouterKey(req);
      if (!orKey) continue;
      try {
        return await openRouterChat(orKey, model, data, system);
      } catch (err) { lastError = err; continue; }
    }

    try {
      const payload: any = {
        contents: toGeminiContents(data.messages, data.attachedImage),
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          maxOutputTokens: Number(data.settings?.maxTokens) || 2048,
        },
      };
      if (data.settings?.enableSearch !== false) payload.tools = [{ googleSearch: {} }];
      if (model !== 'gemini-3.6-flash' && model !== 'gemini-3.5-flash') payload.tools = [ ...((payload.tools || [])), ...toolDeclarations() ];
      else payload.tools = [ ...((payload.tools || [])), ...toolDeclarations() ];

      const result = await geminiGenerate(apiKey, model, payload);
      const candidate = result?.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const text = parts.filter((p: any) => typeof p.text === 'string').map((p: any) => p.text).join('');
      const functionCalls = parts.filter((p: any) => p.functionCall).map((p: any) => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const groundingSources = groundingChunks.map((c: any) => c?.web ? { title: c.web.title || 'Web Source', url: c.web.uri } : null).filter(Boolean);
      return {
        text: text || 'Response received.',
        groundingSources,
        toolExecutions: functionCalls,
        modelUsed: model,
        wasFallback: model !== modelRequested,
      };
    } catch (err: any) {
      lastError = err;
      console.error(`[Alpha AI] Gemini model ${model} failed:`, err?.message || err);
    }
  }
  throw lastError || new Error('All configured AI models failed.');
}

async function openRouterChat(apiKey: string, model: string, data: any, system: string) {
  const messages: any[] = [{ role: 'system', content: system }];
  for (const msg of Array.isArray(data.messages) ? data.messages.slice(-12) : []) {
    messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: String(msg.content || '') });
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: Number(data.settings?.maxTokens) || 2048 }),
  });
  const result: any = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result?.error?.message || `OpenRouter error ${response.status}`), { status: response.status });
  return { text: result?.choices?.[0]?.message?.content || 'Response received.', groundingSources: [], toolExecutions: [], modelUsed: model, wasFallback: true };
}

async function analyze(req: IncomingMessage, data: any) {
  const taskType = data.taskType || 'general_task';
  const system = taskType === 'code_analysis' || taskType === 'complex_reasoning'
    ? 'You are Alpha AI Senior Code and Systems Analyst. Find bugs, edge cases, security issues and practical fixes.'
    : taskType === 'fast_edit' || taskType === 'auto_category'
      ? 'You are Alpha AI rapid editor. Return clean, accurate, polished output.'
      : 'You are Alpha AI. Provide clear, useful, structured analysis.';
  const result = await chatWithGemini(req, {
    messages: [{ role: 'user', content: data.context ? `Context:\n${data.context}\n\nInput:\n${data.text}` : data.text }],
    persona: { systemPrompt: system },
    settings: { selectedModel: taskType === 'code_analysis' ? 'gemini-3.1-pro-preview' : 'gemini-3.6-flash', enableSearch: false, maxTokens: 4096 }
  });
  return { result: result.text, modelUsed: result.modelUsed };
}

async function generateImage(req: IncomingMessage, data: any) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured on Vercel.'), { status: 500 });
  if (!data.prompt) throw Object.assign(new Error('Prompt is required'), { status: 400 });

  const payload = {
    contents: [{ parts: [{ text: String(data.prompt) }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: data.aspectRatio || '1:1' },
    },
  };

  const result = await geminiGenerate(apiKey, IMAGE_MODEL, payload);
  const parts = result?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part: any) => part?.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error('No image data returned by the image model.');

  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  return { imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}` };
}

async function tts(req: IncomingMessage, data: any) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured on Vercel.'), { status: 500 });
  if (!data.text) throw Object.assign(new Error('Text is required'), { status: 400 });

  const payload = {
    contents: [{ parts: [{ text: String(data.text).slice(0, 800) }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: data.voiceName || 'Kore' },
        },
      },
    },
  };

  const result = await geminiGenerate(apiKey, TTS_MODEL, payload);
  const audioPart = result?.candidates?.[0]?.content?.parts?.find((part: any) => part?.inlineData?.data);
  const audio = audioPart?.inlineData?.data;
  if (!audio) throw new Error('No audio data returned by the TTS model.');

  const mimeType = audioPart.inlineData.mimeType || 'audio/L16;codec=pcm;rate=24000';
  return { audioData: `data:${mimeType};base64,${audio}` };
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const route = Array.isArray((req as any).query?.route)
    ? (req as any).query.route.join('/')
    : String((req as any).url || '').split('?')[0].replace(/^\/api\/?/, '');

  try {
    if (req.method === 'GET' && route === 'health') return json(res, 200, { status: 'ok', timestamp: new Date().toISOString() });

    if (req.method === 'GET' && route === 'security/status') {
      const key = getGeminiKey(req);
      const orKey = getOpenRouterKey(req);
      return json(res, 200, {
        configured: !!key,
        activeSource: key ? 'environment_variable' : 'missing',
        maskedKey: maskKey(key),
        storageMechanism: 'Vercel Environment Variables (recommended for serverless)',
        encryptionActive: true,
        vaultHasCustomKey: false,
        envHasKey: !!process.env.GEMINI_API_KEY,
        openRouterConfigured: !!orKey,
        maskedOpenRouterKey: maskKey(orKey),
        lastValidated: new Date().toISOString(),
      });
    }

    if (req.method === 'GET' && route === 'models') {
      return json(res, 200, {
        models: MODEL_LIST,
        defaultModel: DEFAULT_MODEL,
        geminiConfigured: !!getGeminiKey(req),
        openRouterConfigured: !!getOpenRouterKey(req),
        autoFallbackAvailable: true,
      });
    }

    const data = await body(req);

    if (req.method === 'POST' && route === 'security/validate') {
      const apiKey = String(data.apiKey || '').trim();
      if (!apiKey) return json(res, 200, { valid: false, message: 'API key is required.' });
      try {
        await geminiGenerate(apiKey, DEFAULT_MODEL, { contents: [{ role: 'user', parts: [{ text: 'Reply with OK.' }] }], generationConfig: { maxOutputTokens: 8 } });
        return json(res, 200, { valid: true, message: 'Gemini API key validated successfully.' });
      } catch (err: any) {
        return json(res, 200, { valid: false, message: err?.message || 'API key validation failed.' });
      }
    }

    if (req.method === 'POST' && route === 'security/update-key') {
      return json(res, 400, { success: false, message: 'For Vercel, add GEMINI_API_KEY in Project Settings → Environment Variables. Runtime file storage is not persistent on serverless functions.' });
    }

    if (req.method === 'POST' && route === 'security/reset-key') {
      return json(res, 400, { success: false, message: 'Keys are managed through Vercel Environment Variables.' });
    }

    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

    if (route === 'chat') return json(res, 200, await chatWithGemini(req, data));
    if (route === 'analyze') return json(res, 200, await analyze(req, data));
    if (route === 'generate-image') return json(res, 200, await generateImage(req, data));
    if (route === 'tts') return json(res, 200, await tts(req, data));

    return json(res, 404, { error: `API route POST /api/${route} not found` });
  } catch (err: any) {
    console.error('[Alpha AI Vercel API]', err);
    const status = Number(err?.status) || errorStatus(String(err?.message || err));
    const isRateLimit = status === 429;
    return json(res, status, {
      error: err?.message || 'Server error',
      isRateLimit,
      text: isRateLimit
        ? '⚠️ Rate limit reached. Please try again shortly.'
        : '⚠️ Alpha AI server error. Check the Vercel function logs and environment variables.',
      groundingSources: [],
      toolExecutions: [],
    });
  }
}
