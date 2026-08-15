# Alpha AI — Vercel deployment

## 1. Deploy

Import this project into Vercel and deploy with the default Node/Vite settings.

## 2. Add the Gemini key

In Vercel: Project → Settings → Environment Variables, add:

- `GEMINI_API_KEY` = your Google AI Studio / Gemini API key
- `GEMINI_MODEL` = `gemini-3.6-flash` (optional)
- `GEMINI_IMAGE_MODEL` = `gemini-3.1-flash-image` (optional)
- `GEMINI_TTS_MODEL` = `gemini-3.1-flash-tts-preview` (optional)

Then redeploy.

## 3. Test the backend

Open:

`/api/health`

It should return JSON with `status: "ok"`.

Then open the app and send a chat message.

## Important

Do not put API keys in `src/`, `public/`, `.env` files committed to GitHub, or the browser bundle. Vercel Environment Variables are the intended server-side location.
