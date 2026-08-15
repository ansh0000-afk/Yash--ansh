# Alpha AI — Vercel error fixes

This build keeps the existing Alpha AI frontend and replaces the broken Express-style Vercel API entrypoint with a Vercel-compatible Node serverless function at `api/[...route].ts`.

Fixed:
- Removed the old `api/index.ts` Express function entrypoint.
- Removed the incompatible `GoogleGenerativeAI({ apiKey, httpOptions })` path from the Vercel backend.
- Vercel backend now calls the Gemini REST API directly.
- Fixed Gemini REST tool field names (`functionDeclarations`, `googleSearch`).
- Fixed image generation to use `gemini-3.1-flash-image` via `generateContent`.
- Fixed TTS request format for `gemini-3.1-flash-tts-preview`.
- Removed shutdown-era Gemini 2.0 fallback models from the Vercel route.
- Added Vercel serverless routing in `vercel.json`.
- API key is read from `GEMINI_API_KEY` in Vercel Environment Variables.

## Deploy

1. Replace the old repository contents with this project.
2. Keep the existing Vercel project; do not create a second Alpha AI app.
3. In Vercel Project Settings → Environment Variables, add `GEMINI_API_KEY`.
4. Redeploy the project.
5. Test `/api/health`, then send `Hi` in Alpha AI.

Do not commit a real API key into GitHub or the ZIP.
