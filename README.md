<p align="center">
  <img src="public/icon-512.png" alt="Alpha AI logo" width="120" height="120" />
</p>

<h1 align="center">Alpha AI</h1>

<p align="center"><strong>Think Smarter. Build Faster. Learn Better.</strong></p>

<p align="center">
  A next-generation personal AI assistant — AI chat, voice conversation, image generation
  and a dedicated Maharashtra HSC Class 12 Commerce study hub, powered by Google Gemini.
</p>

<p align="center">
  <a href="https://yash-ansh.vercel.app"><strong>Live App</strong></a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#run-locally">Run Locally</a> ·
  <a href="#deploy-on-vercel">Deploy</a>
</p>

---

## Features

- **AI Chat** — multi-model chat (Google Gemini, plus optional OpenRouter free models) with personas, a smart prompt library and long-term memory.
- **Voice Conversation** — talk to Alpha AI with live voice input and text-to-speech replies.
- **Image Generation & Analysis** — generate images and analyse uploaded files and PDFs.
- **HSC Commerce Study Hub** — Maharashtra Board Class 12 Commerce notes, question bank, MCQs and previous-year questions for Book Keeping & Accountancy, Economics, OCM, Maths & Statistics, English and Hindi.
- **Workspace Tools** — task board, knowledge base and document export (PDF).
- **Secure Sign-in** — Google sign-in with Firebase Authentication, an app lock and on-device security checks.
- **PWA + Android** — installable web app (add to home screen) and a Capacitor Android app built by GitHub Actions.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Vercel Serverless Functions (`api/[...route].ts`) + Express for local dev |
| AI | Google Gemini API (chat, image, TTS), OpenRouter (optional free models) |
| Auth & Data | Firebase Authentication |
| Mobile | Capacitor 7 (Android), GitHub Actions APK build |
| Hosting | Vercel |

## Project Structure

```text
api/            Vercel serverless API (single catch-all route)
src/
  components/   Chat, study hub, auth, settings and workspace UI
  data/         Model list, personas, HSC Commerce content
  lib/          API client, Firebase, voice, PDF and security helpers
public/         PWA manifest, service worker and the Alpha AI logo / icon set
android/        Capacitor Android project (icons and splash live here)
```

## Run Locally

```bash
npm ci
cp .env.example .env   # add your GEMINI_API_KEY
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server (Express + Vite) |
| `npm run build:web` | Web build only — this is what Vercel runs |
| `npm run build` | Web build + bundled local server |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |

## Deploy on Vercel

1. Import this repository into Vercel (framework preset: **Vite** — already set in `vercel.json`).
2. In **Project → Settings → Environment Variables**, add `GEMINI_API_KEY` (your Google AI Studio key). Optional: `GEMINI_MODEL`, `GEMINI_IMAGE_MODEL`, `GEMINI_TTS_MODEL`.
3. Redeploy, then verify `https://<your-domain>/api/health` returns `{"status":"ok"}`.
4. For Google sign-in, add your Vercel domain under **Firebase Console → Authentication → Settings → Authorized domains** (project `alpha-ai-881d8`).

Full step-by-step notes: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md).

> Never commit a real API key to GitHub. Keys belong only in Vercel Environment Variables or your local `.env` (which is git-ignored).

## Android App

Pushes to `main` run the **Build Android APK** GitHub Action, which builds a debug APK.
It needs the `VITE_GOOGLE_WEB_CLIENT_ID` repository secret/variable for Google sign-in.

---

<p align="center">Alpha AI — built with React, Gemini and Firebase.</p>
