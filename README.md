# Fantasy EPL Draft & Score Tracker

> **Historical archive.** This is the first thing I ever vibe coded. Leaving it
> public for posterity, warts and all. I don't intend to touch it again — I'll
> build a fresh version next season with everything I've learned in the year
> since. Read it as a starting point, not a reference.

A React app for managing a fantasy English Premier League draft league: set up
manager rosters, track live scores from the official FPL data, execute trades
with cash, and review historical performance with weekly breakdowns and
comparison charts.

Originally generated in Google AI Studio.

## Stack

- React 19 + TypeScript, Vite
- React Router (hash routing), Recharts
- Tailwind (via CDN)
- Live data from the public Fantasy Premier League API (`bootstrap-static`),
  fetched through a CORS proxy and cached in `localStorage`

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. _(Optional)_ Set `GEMINI_API_KEY` in `.env.local` — scaffolded by AI Studio
   but not actually used by the app.
3. Run the app:
   `npm run dev`

## Notes for anyone reading

- This is unofficial and not affiliated with the Premier League or FPL.
- The FPL data is fetched client-side through a public CORS proxy
  (`corsproxy.io`); expect it to break when that proxy or the FPL API changes.
- No tests, no error boundaries, plenty of rough edges. That's the point of
  keeping it — it's the baseline I'm measuring the next build against.
