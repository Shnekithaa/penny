# Penny

Penny is a modern personal finance tracker built with React + Vite. It helps you track transactions, view analytics, and get AI-powered insights. It supports Google sign-in with Firebase Auth and includes a demo mode for quick exploration.

## Live app

- Production: [https://penny-ob9xh3wqx-shnekithaas-projects.vercel.app/](https://penny-rouge.vercel.app/)

## Features

- Google authentication with Firebase
- Demo mode without login
- Add/delete income and expense transactions
- Analytics dashboard with charts and key stats
- AI assistant for finance guidance (Gemini)
- Responsive UI for desktop and mobile
- Light/dark theme toggle

## Tech stack

- React 19
- Vite 7
- Firebase (Auth + Firestore)
- Recharts

## Project structure

```text
src/
	components/      # Reusable UI blocks
	hooks/           # App state hooks (transactions, analytics, toast)
	pages/           # Main app screens
	aiService.js     # Gemini integration
	firebase.js      # Firebase initialization
	services.js      # Auth and data services
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill all Firebase values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GEMINI_API_KEY=...
```

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Firebase auth setup notes

- In Firebase console, add your deployed domain under Authentication -> Settings -> Authorized domains.
- For this app, include:
	- `localhost`
	- `penny-ob9xh3wqx-shnekithaas-projects.vercel.app`
- Keep env values clean: no trailing spaces or hidden new lines.

## Deployment

This app is deployed on Vercel.

- Build command: `npm run build`
- Output directory: `dist`

After updating environment variables in Vercel, trigger a redeploy so the new values are picked up.

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
