// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// firebase-applet-config.json
var firebase_applet_config_default = {
  apiKey: "AIzaSyAHsTUFcownV4vBppBB0oissSra8N9rdHI",
  authDomain: "alpha-ai-881d8.firebaseapp.com",
  projectId: "alpha-ai-881d8",
  storageBucket: "alpha-ai-881d8.firebasestorage.app",
  messagingSenderId: "524557465201",
  appId: "1:524557465201:web:9411b2c31a292f63eb4dd0",
  measurementId: "G-VDVM82FX5K"
};

// api/[...route].ts
var GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
var DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
var IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
var TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
var MAX_REQUEST_BODY_BYTES = 12 * 1024 * 1024;
var AUTH_ATTEMPT_LIMIT = { maxRequests: 30, windowMs: 6e4 };
var verifiedFirebaseTokens = /* @__PURE__ */ new Map();
var requestBudgets = /* @__PURE__ */ new Map();
var ROUTE_LIMITS = {
  chat: { maxRequests: 30, windowMs: 6e4 },
  analyze: { maxRequests: 20, windowMs: 6e4 },
  "generate-image": { maxRequests: 5, windowMs: 6e4 },
  tts: { maxRequests: 20, windowMs: 6e4 },
  "security/validate": { maxRequests: 5, windowMs: 6e4 }
};
var MODEL_ALIASES = {
  "gemini-3.5-flash": "gemini-3.5-flash",
  "gemini-3.6-flash": "gemini-3.6-flash",
  "gemini-3.1-flash-lite": "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview": "gemini-3.1-pro-preview",
  "gemini-2.5-flash": "gemini-2.5-flash",
  "gemini-2.5-flash-lite": "gemini-2.5-flash-lite"
};
var MODEL_LIST = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "google", providerLabel: "Google Gemini", description: "Fast multimodal model for chat, reasoning and agentic tasks.", contextWindow: "1M tokens", speed: "Ultra Fast", isFree: true, badge: "Recommended", supportsImage: true },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", provider: "google", providerLabel: "Google Gemini", description: "Strong general-purpose Gemini model for sustained agentic and coding tasks.", contextWindow: "1M tokens", speed: "Fast", isFree: true, supportsImage: true },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "google", providerLabel: "Google Gemini", description: "Cost-efficient model for high-throughput tasks.", contextWindow: "1M tokens", speed: "Ultra Fast", isFree: true },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", provider: "google", providerLabel: "Google Gemini", description: "Fast lightweight multimodal model.", contextWindow: "1M tokens", speed: "Ultra Fast", isFree: true },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", provider: "google", providerLabel: "Google Gemini", description: "Advanced reasoning for complex coding and analysis.", contextWindow: "1M tokens", speed: "Fast", isFree: true, badge: "Reasoning", supportsImage: true },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)", provider: "openrouter", providerLabel: "OpenRouter", description: "Optional OpenRouter reasoning model.", contextWindow: "Provider dependent", speed: "Balanced", isFree: true, badge: "Optional" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (Free)", provider: "openrouter", providerLabel: "OpenRouter", description: "Optional OpenRouter model.", contextWindow: "Provider dependent", speed: "Fast", isFree: true, badge: "Optional" }
];
function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}
function cors(req, res) {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((origin2) => origin2.trim()).filter(Boolean);
  const allowedOrigins = /* @__PURE__ */ new Set([
    "https://yash-ansh.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost",
    "capacitor://localhost",
    ...process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [],
    ...process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : [],
    ...configuredOrigins
  ]);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Gemini-API-Key, X-API-Key, X-OpenRouter-API-Key");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}
async function body(req) {
  if (req.body !== void 0) {
    const serializedBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body) || "";
    if (Buffer.byteLength(serializedBody, "utf8") > MAX_REQUEST_BODY_BYTES) {
      throw Object.assign(new Error("Request body is too large."), { status: 413 });
    }
    if (typeof req.body === "object" && req.body !== null) return req.body;
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }
  const chunks = [];
  let receivedBytes = 0;
  let bodyTooLarge = false;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    receivedBytes += buffer.length;
    if (receivedBytes > MAX_REQUEST_BODY_BYTES) {
      bodyTooLarge = true;
      continue;
    }
    chunks.push(buffer);
  }
  if (bodyTooLarge) throw Object.assign(new Error("Request body is too large."), { status: 413 });
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function getGeminiKey(req) {
  const headers = req.headers || {};
  const headerKey = headers["x-gemini-api-key"] || headers["x-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) return headerKey.trim();
  const auth = headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const value = auth.slice(7).trim();
    if (value.startsWith("AIza")) return value;
  }
  const envKey = process.env.GEMINI_API_KEY?.trim();
  return envKey || null;
}
function getOpenRouterKey(req) {
  const headers = req.headers || {};
  const headerKey = headers["x-openrouter-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) return headerKey.trim();
  return process.env.OPENROUTER_API_KEY?.trim() || null;
}
async function verifyFirebaseUser(req) {
  const authorization = req.headers.authorization;
  const token = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return null;
  const cached = verifiedFirebaseTokens.get(token);
  if (cached && cached.expiresAt > Date.now()) return { uid: cached.uid };
  if (cached) verifiedFirebaseTokens.delete(token);
  let response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebase_applet_config_default.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        signal: AbortSignal.timeout(5e3)
      }
    );
  } catch {
    throw Object.assign(new Error("Authentication service is temporarily unavailable."), { status: 503 });
  }
  if (response.status === 400 || response.status === 401) return null;
  if (!response.ok) {
    throw Object.assign(new Error("Could not verify the signed-in user."), { status: 503 });
  }
  const result = await response.json();
  const uid = result.users?.[0]?.localId;
  if (!uid) return null;
  const tokenPayload = token.split(".")[1];
  let tokenExpiry = Date.now() + 6e4;
  try {
    const payload = JSON.parse(Buffer.from(tokenPayload, "base64url").toString("utf8"));
    if (typeof payload.exp === "number") tokenExpiry = Math.min(payload.exp * 1e3, tokenExpiry);
  } catch {
    return null;
  }
  if (tokenExpiry > Date.now()) {
    if (verifiedFirebaseTokens.size >= 1e3) {
      const oldestToken = verifiedFirebaseTokens.keys().next().value;
      if (oldestToken) verifiedFirebaseTokens.delete(oldestToken);
    }
    verifiedFirebaseTokens.set(token, { uid, expiresAt: tokenExpiry });
  }
  return { uid };
}
function startRequestBudget(key, windowMs, now) {
  if (!requestBudgets.has(key) && requestBudgets.size >= 5e3) {
    for (const [existingKey, bucket] of requestBudgets) {
      if (now - bucket.windowStart >= bucket.windowMs) requestBudgets.delete(existingKey);
      if (requestBudgets.size < 5e3) break;
    }
    if (requestBudgets.size >= 5e3) {
      const oldestKey = requestBudgets.keys().next().value;
      if (oldestKey) requestBudgets.delete(oldestKey);
    }
  }
  requestBudgets.set(key, { windowStart: now, windowMs, count: 1 });
}
function consumeBudget(key, limit) {
  const now = Date.now();
  const bucket = requestBudgets.get(key);
  if (!bucket || now - bucket.windowStart >= limit.windowMs) {
    startRequestBudget(key, limit.windowMs, now);
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit.maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((limit.windowMs - (now - bucket.windowStart)) / 1e3))
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
function consumeRequestBudget(uid, route) {
  const limit = ROUTE_LIMITS[route];
  if (!limit) return { allowed: true, retryAfterSeconds: 0 };
  return consumeBudget(`${uid}:${route}`, limit);
}
function consumeAuthAttemptBudget(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientAddress = typeof forwardedFor === "string" ? forwardedFor.split(",").at(-1)?.trim() || req.socket.remoteAddress || "unknown" : req.socket.remoteAddress || "unknown";
  return consumeBudget(`auth:${clientAddress}`, AUTH_ATTEMPT_LIMIT);
}
function getGroqKey() {
  return process.env.GROQ_API_KEY?.trim() || null;
}
function maskKey(key) {
  if (!key || key.length < 8) return "Not Configured";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
function errorStatus(message) {
  if (/429|RESOURCE_EXHAUSTED|rate limit|quota/i.test(message)) return 429;
  if (/401|403|unauthorized|forbidden/i.test(message)) return 401;
  if (/404|not found/i.test(message)) return 404;
  return 500;
}
async function geminiGenerate(apiKey, model, payload) {
  const response = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = data?.error?.message || text || `Gemini request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}
function normalizeModel(model) {
  if (!model) return DEFAULT_MODEL;
  if (model.includes("/") || model.includes(":free")) return model;
  return MODEL_ALIASES[model] || model;
}
function toGeminiContents(messages, attachedImage) {
  const source = Array.isArray(messages) ? messages.slice(-12) : [];
  const contents = [];
  for (const msg of source) {
    if (!msg || !msg.content) continue;
    const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
    contents.push({ role, parts: [{ text: String(msg.content) }] });
  }
  if (attachedImage) {
    const last = contents[contents.length - 1];
    if (last?.role === "user") contents.pop();
    const match = String(attachedImage).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    const mimeType = match?.[1] || "image/jpeg";
    const data = match?.[2] || String(attachedImage).replace(/^data:[^;]+;base64,/, "");
    const lastMessage = source[source.length - 1]?.content || "Analyze this image.";
    contents.push({ role: "user", parts: [{ inlineData: { mimeType, data } }, { text: String(lastMessage) }] });
  }
  return contents.length ? contents : [{ role: "user", parts: [{ text: "Hello" }] }];
}
function toolDeclarations() {
  return [{ functionDeclarations: [
    {
      name: "create_task",
      description: "Create a task on the user action board.",
      parameters: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, priority: { type: "STRING" }, dueDate: { type: "STRING" } }, required: ["title"] }
    },
    {
      name: "save_note",
      description: "Save a useful note to the user knowledge base.",
      parameters: { type: "OBJECT", properties: { title: { type: "STRING" }, content: { type: "STRING" }, category: { type: "STRING" } }, required: ["title", "content"] }
    },
    {
      name: "save_user_memory",
      description: "Save an important user preference, fact, goal or instruction.",
      parameters: { type: "OBJECT", properties: { key: { type: "STRING" }, value: { type: "STRING" }, category: { type: "STRING" } }, required: ["key", "value"] }
    }
  ] }];
}
async function chatWithGemini(req, data) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY is not configured on Vercel."), { status: 500 });
  const persona = data.persona || { systemPrompt: "You are Alpha AI, a helpful personal AI assistant." };
  let system = String(persona.systemPrompt || "You are Alpha AI, a helpful personal AI assistant.");
  if (data.settings?.userCustomInstructions) system += `

User instructions:
${data.settings.userCustomInstructions}`;
  system += `

Current date/time: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}`;
  if (Array.isArray(data.tasks) && data.tasks.length) {
    const active = data.tasks.filter((t) => t.status !== "completed").slice(0, 8);
    system += `

Active tasks:
${active.map((t) => `- ${t.title} (${t.priority || "medium"})`).join("\n")}`;
  }
  if (Array.isArray(data.notes) && data.notes.length) {
    system += `

Recent notes:
${data.notes.slice(0, 5).map((n) => `- ${n.title}`).join("\n")}`;
  }
  if (Array.isArray(data.userMemory) && data.userMemory.length) {
    system += `

Known user preferences/facts:
${data.userMemory.slice(0, 10).map((m) => `- ${m.key}: ${m.value}`).join("\n")}`;
  }
  system += data.voiceMode ? "\n\nCommunication style: Respond in simple, natural spoken Hindi. Keep replies short, direct, and useful. Avoid headings, lists, and long explanations unless the user asks for detail. Use English only for necessary technical terms or proper names." : "\n\nCommunication style: Reply in simple Hinglish by default. Keep answers short, direct, and useful. Avoid unnecessary long explanations; add detail only when needed or requested.";
  system += `

Response formatting:
- Do not include programming source code, code fences, or code-style formatting in ordinary answers or school solutions just to present information.
- For Maths and Accountancy, show calculations, formulas, journal entries, ledger accounts, and working notes as readable text, equations, or Markdown tables, never as programming code.
- Only provide programming code when the user explicitly requests code or asks a software-development question that needs code. This rule does not prohibit normal formulas, accounting notation, or short examples.`;
  if (data.studyTutorMode === true) {
    system += `

Maharashtra HSC Class 12 Commerce study-tutor mode:
- Teach the requested chapter as a personal tutor for the Maharashtra State Board. Use simple Hinglish by default; use English or Hindi when the student asks. The student runs the Green Basket spice business (turmeric powder, red chilli powder, Makhana) and uses Tally Prime and Excel; use these as practical examples only when they clarify the syllabus concept.
- Follow this exact session sequence: (1) Previous Topic Revision, (2) Active Recall, (3) New Topic Teaching, (4) Practice, (5) 10-Question Quiz. Teach each new concept in Beginner, Intermediate, then Board/Expert levels. For Maths and Accountancy, show board-style steps, formulas, workings, and formats.
- Never move to the next stage, new topic, or quiz question until the student explicitly replies YES. Start with stage 1 only and wait. If the previous topic is unknown, ask which topic to revise or accept FIRST SESSION; do not silently skip ahead. During the final quiz, ask exactly one question, wait for the answer, give feedback, and ask for YES before the next question.
- Cover the requested stage without dumping the entire chapter at once. At the end of the topic session, include Key Points, 80/20 Core Concepts, and a Quick Revision Summary, while still pausing for YES before progressing.
- Keep content faithful to the Maharashtra State Board syllabus and textbook. Do not invent textbook facts, official weightage, paper blueprints, marking schemes, or past-paper questions. Clearly label generated questions as board-style practice. Call a PYQ verified only when a reliable source or the paper text is available; otherwise say verification is unavailable and ask the student to share the paper. Treat an 80-mark practice blueprint as a self-assessment model unless an official chapter-wise blueprint is provided.
- When asked for a complete chapter module, include revision notes, all relevant formulas/formats/principles, five 1-mark objectives, 3-4 short-answer questions, an 8-mark board-style long answer or solved practical, PYQs with verification caveats, and an 80-mark weighted self-assessment blueprint. Do not present all quiz questions at once.
- Adapt explanations to the student's technical background when useful, but keep board terminology and expected answer formats primary.`;
  }
  const modelRequested = normalizeModel(data.settings?.selectedModel || data.settings?.aiModel);
  const candidates = Array.from(/* @__PURE__ */ new Set([
    modelRequested,
    DEFAULT_MODEL,
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite"
  ])).filter(Boolean);
  let lastError = null;
  for (const model of candidates) {
    if (model.includes("/") || model.includes(":free")) {
      const orKey = getOpenRouterKey(req);
      if (!orKey) continue;
      try {
        return await openRouterChat(orKey, model, data, system);
      } catch (err) {
        lastError = err;
        continue;
      }
    }
    try {
      const payload = {
        contents: toGeminiContents(data.messages, data.attachedImage),
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          maxOutputTokens: Number(data.settings?.maxTokens) || 2048
        }
      };
      if (data.settings?.enableSearch === true) payload.tools = [{ googleSearch: {} }];
      if (model !== "gemini-3.6-flash" && model !== "gemini-3.5-flash") payload.tools = [...payload.tools || [], ...toolDeclarations()];
      else payload.tools = [...payload.tools || [], ...toolDeclarations()];
      const result = await geminiGenerate(apiKey, model, payload);
      const candidate = result?.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const text = parts.filter((p) => typeof p.text === "string").map((p) => p.text).join("");
      const functionCalls = parts.filter((p) => p.functionCall).map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const groundingSources = groundingChunks.map((c) => c?.web ? { title: c.web.title || "Web Source", url: c.web.uri } : null).filter(Boolean);
      return {
        text: text || "Response received.",
        groundingSources,
        toolExecutions: functionCalls,
        modelUsed: model,
        wasFallback: model !== modelRequested
      };
    } catch (err) {
      lastError = err;
      console.error(`[Alpha AI] Gemini model ${model} failed:`, err?.message || err);
    }
  }
  const groqKey = getGroqKey();
  if (groqKey) {
    try {
      console.warn("[Alpha AI] All Gemini models failed, falling back to Groq.");
      return await groqChat(groqKey, data, system);
    } catch (err) {
      lastError = err;
      console.error("[Alpha AI] Groq fallback also failed:", err?.message || err);
    }
  }
  throw lastError || new Error("All configured AI models failed.");
}
async function groqChat(apiKey, data, system) {
  const messages = [{ role: "system", content: system }];
  for (const msg of Array.isArray(data.messages) ? data.messages.slice(-12) : []) {
    messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: String(msg.content || "") });
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "openai/gpt-oss-20b", messages, max_tokens: Number(data.settings?.maxTokens) || 2048 })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result?.error?.message || `Groq error ${response.status}`), { status: response.status });
  return {
    text: result?.choices?.[0]?.message?.content || "Response received.",
    groundingSources: [],
    toolExecutions: [],
    modelUsed: "groq/openai-gpt-oss-20b",
    wasFallback: true
  };
}
async function openRouterChat(apiKey, model, data, system) {
  const messages = [{ role: "system", content: system }];
  for (const msg of Array.isArray(data.messages) ? data.messages.slice(-12) : []) {
    messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: String(msg.content || "") });
  }
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: Number(data.settings?.maxTokens) || 2048 })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result?.error?.message || `OpenRouter error ${response.status}`), { status: response.status });
  return { text: result?.choices?.[0]?.message?.content || "Response received.", groundingSources: [], toolExecutions: [], modelUsed: model, wasFallback: true };
}
async function analyze(req, data) {
  const taskType = data.taskType || "general_task";
  const system = taskType === "code_analysis" || taskType === "complex_reasoning" ? "You are Alpha AI Senior Code and Systems Analyst. Find bugs, edge cases, security issues and practical fixes." : taskType === "fast_edit" || taskType === "auto_category" ? "You are Alpha AI rapid editor. Return clean, accurate, polished output." : "You are Alpha AI. Provide clear, useful, structured analysis.";
  const result = await chatWithGemini(req, {
    messages: [{ role: "user", content: data.context ? `Context:
${data.context}

Input:
${data.text}` : data.text }],
    persona: { systemPrompt: system },
    settings: { selectedModel: taskType === "code_analysis" ? "gemini-3.1-pro-preview" : "gemini-3.6-flash", enableSearch: false, maxTokens: 4096 }
  });
  return { result: result.text, modelUsed: result.modelUsed };
}
async function generateImage(req, data) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY is not configured on Vercel."), { status: 500 });
  if (!data.prompt) throw Object.assign(new Error("Prompt is required"), { status: 400 });
  const payload = {
    contents: [{ parts: [{ text: String(data.prompt) }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: data.aspectRatio || "1:1" }
    }
  };
  const result = await geminiGenerate(apiKey, IMAGE_MODEL, payload);
  const parts = result?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part?.inlineData?.data);
  if (!imagePart?.inlineData?.data) throw new Error("No image data returned by the image model.");
  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return { imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}` };
}
async function tts(req, data) {
  const apiKey = getGeminiKey(req);
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY is not configured on Vercel."), { status: 500 });
  if (!data.text) throw Object.assign(new Error("Text is required"), { status: 400 });
  const payload = {
    contents: [{ parts: [{ text: String(data.text).slice(0, 800) }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: data.voiceName || "Kore" }
        }
      }
    }
  };
  const result = await geminiGenerate(apiKey, TTS_MODEL, payload);
  const audioPart = result?.candidates?.[0]?.content?.parts?.find((part) => part?.inlineData?.data);
  const audio = audioPart?.inlineData?.data;
  if (!audio) throw new Error("No audio data returned by the TTS model.");
  const mimeType = audioPart.inlineData.mimeType || "audio/L16;codec=pcm;rate=24000";
  return { audioData: `data:${mimeType};base64,${audio}` };
}
async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return json(res, 204, {});
  const route = Array.isArray(req.query?.route) ? req.query.route.join("/") : String(req.url || "").split("?")[0].replace(/^\/api\/?/, "");
  try {
    if (req.method === "GET" && route === "health") return json(res, 200, { status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    if (req.method === "GET" && route === "security/status") {
      const key = getGeminiKey(req);
      const orKey = getOpenRouterKey(req);
      return json(res, 200, {
        configured: !!key,
        activeSource: key ? "environment_variable" : "missing",
        maskedKey: maskKey(key),
        storageMechanism: "Vercel Environment Variables (recommended for serverless)",
        encryptionActive: true,
        vaultHasCustomKey: false,
        envHasKey: !!process.env.GEMINI_API_KEY,
        openRouterConfigured: !!orKey,
        maskedOpenRouterKey: maskKey(orKey),
        lastValidated: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (req.method === "GET" && route === "models") {
      return json(res, 200, {
        models: MODEL_LIST,
        defaultModel: DEFAULT_MODEL,
        geminiConfigured: !!getGeminiKey(req),
        openRouterConfigured: !!getOpenRouterKey(req),
        autoFallbackAvailable: true
      });
    }
    if (Object.hasOwn(ROUTE_LIMITS, route)) {
      const authBudget = consumeAuthAttemptBudget(req);
      if (!authBudget.allowed) {
        res.setHeader("Retry-After", String(authBudget.retryAfterSeconds));
        return json(res, 429, {
          error: "Too many authentication attempts. Please wait before trying again.",
          isRateLimit: true,
          retryable: false
        });
      }
      const user = await verifyFirebaseUser(req);
      if (!user) return json(res, 401, { error: "Please sign in to use this service." });
      const budget = consumeRequestBudget(user.uid, route);
      if (!budget.allowed) {
        res.setHeader("Retry-After", String(budget.retryAfterSeconds));
        return json(res, 429, {
          error: "Request limit reached. Please wait before trying again.",
          isRateLimit: true,
          retryable: false
        });
      }
    }
    const data = await body(req);
    if (req.method === "POST" && route === "security/validate") {
      const apiKey = String(data.apiKey || "").trim();
      if (!apiKey) return json(res, 200, { valid: false, message: "API key is required." });
      try {
        await geminiGenerate(apiKey, DEFAULT_MODEL, { contents: [{ role: "user", parts: [{ text: "Reply with OK." }] }], generationConfig: { maxOutputTokens: 8 } });
        return json(res, 200, { valid: true, message: "Gemini API key validated successfully." });
      } catch (err) {
        return json(res, 200, { valid: false, message: err?.message || "API key validation failed." });
      }
    }
    if (req.method === "POST" && route === "security/update-key") {
      return json(res, 400, { success: false, message: "For Vercel, add GEMINI_API_KEY in Project Settings \u2192 Environment Variables. Runtime file storage is not persistent on serverless functions." });
    }
    if (req.method === "POST" && route === "security/reset-key") {
      return json(res, 400, { success: false, message: "Keys are managed through Vercel Environment Variables." });
    }
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    if (route === "chat") return json(res, 200, await chatWithGemini(req, data));
    if (route === "analyze") return json(res, 200, await analyze(req, data));
    if (route === "generate-image") return json(res, 200, await generateImage(req, data));
    if (route === "tts") return json(res, 200, await tts(req, data));
    return json(res, 404, { error: `API route POST /api/${route} not found` });
  } catch (err) {
    console.error("[Alpha AI Vercel API]", err);
    const status = Number(err?.status) || errorStatus(String(err?.message || err));
    const isRateLimit = status === 429;
    return json(res, status, {
      error: err?.message || "Server error",
      isRateLimit,
      text: isRateLimit ? "\u26A0\uFE0F Rate limit reached. Please try again shortly." : "\u26A0\uFE0F Alpha AI server error. Check the Vercel function logs and environment variables.",
      groundingSources: [],
      toolExecutions: []
    });
  }
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = 3e3;
app.all("/api*", (req, res) => {
  handler(req, res);
});
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});
app.use((err, req, res, next) => {
  console.error("[Express API Global Error]", err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || err.statusCode || (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") ? 429 : 500);
  res.status(statusCode).json({
    error: err.message || "An unexpected server error occurred",
    isRateLimit: statusCode === 429
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Personal AI Agent Server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map
