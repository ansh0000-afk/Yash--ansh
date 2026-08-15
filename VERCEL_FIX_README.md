# Alpha AI — Vercel Error Fix

This version fixes the old `@google/generative-ai` / `GoogleGenerativeAI` mismatch and keeps a compatibility `api/index.ts` that forwards to `api/[...route].ts`.

Required Vercel environment variable:
- `GEMINI_API_KEY`

Do not commit API keys to GitHub.
