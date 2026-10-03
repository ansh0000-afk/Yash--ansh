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

## 3. Enable Firebase sign-in on Vercel

After the first Vercel deployment, copy its hostname (for example,
`your-project.vercel.app`). In Firebase Console, open the `alpha-ai-881d8`
project and go to **Authentication → Settings → Authorized domains**. Select
**Add domain** and enter the hostname without `https://` or a path. Repeat for
each production/custom domain used to open the app. For preview deployments,
add each preview hostname that needs sign-in; preview hostnames may change.

Also confirm **Authentication → Sign-in method → Google** is enabled and add
`yash-ansh.vercel.app` under **Authentication → Settings → Authorized domains**.
The app uses `yash-ansh.vercel.app` as its `authDomain`; Vercel proxies
`/__/auth/*` to `alpha-ai-881d8.firebaseapp.com` so Firebase's auth helper is
served from the app's domain. After deployment, verify that
`https://yash-ansh.vercel.app/__/auth/handler` returns Firebase's auth helper,
not the app's `index.html`.

## 4. Test the backend

Open:

`/api/health`

It should return JSON with `status: "ok"`.

Then open the app and send a chat message.

## Important

Do not put API keys in `src/`, `public/`, `.env` files committed to GitHub, or the browser bundle. Vercel Environment Variables are the intended server-side location.
