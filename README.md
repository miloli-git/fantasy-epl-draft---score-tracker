# Fantasy EPL Draft & Score Tracker

> First thing I ever vibed, after hearing about Google AI Studio at a DAW talk.
> Leaving it up for posterity. We'll look to build out a better version,
> hopefully, for next season, with a year's worth of lessons and experience.

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
