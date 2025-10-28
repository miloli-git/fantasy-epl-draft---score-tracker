# FPL Draft API Proxy Server

A backend API proxy server for the Fantasy EPL Draft Score Tracker that handles requests to the official Fantasy Premier League API.

## Features

- CORS-enabled proxy for FPL API endpoints
- Built-in caching (1 hour TTL) to reduce API calls
- Supports all FPL endpoints used by the app

## Local Development

1. Install dependencies:
```bash
cd api
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd api
vercel
```

3. Copy the deployment URL (e.g., `https://your-api.vercel.app`)

4. Update the frontend `.env.local` file with your API URL:
```
VITE_API_URL=https://your-api.vercel.app
```

## Endpoints

- `GET /api/bootstrap-static` - FPL bootstrap data
- `GET /api/league/:leagueId/details` - Draft league details
- `GET /api/league/:leagueId/element-status` - Player ownership
- `GET /api/element-summary/:playerId` - Player historical data
- `GET /health` - Health check
- `POST /api/cache/clear` - Clear cache (development)

## Environment Variables

- `PORT` - Server port (default: 3001)
