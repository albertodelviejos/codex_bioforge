# BioForge

BioForge is a mobile-first Next.js app that generates 5 short bios (each up to 160 characters) based on profession, three personality keywords, and selected tone.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI API (`gpt-4o-mini`)

## Features

- Dark mode by default with modern, mobile-first UI
- Profession + 3 keyword + tone inputs
- One-click copy for each generated bio
- Loading skeletons and API/client error handling
- Structured JSON generation to reliably return exactly 5 bios

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your key in `.env.local`:
   ```env
   OPENAI_API_KEY=...
   ```
4. Run:
   ```bash
   npm run dev
   ```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add environment variable `OPENAI_API_KEY` in Vercel project settings.
4. Deploy.
