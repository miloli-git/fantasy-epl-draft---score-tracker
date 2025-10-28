# Fantasy EPL Draft & Score Tracker

A comprehensive web application for managing Fantasy Premier League draft leagues with live scoring, trade management, and historical performance analysis.

## Features

- **League Import** - Auto-import from FPL Draft API by league ID
- **Live Scoring** - Real-time points from official FPL API
- **Roster Management** - View and manage team rosters
- **Trade System** - Execute player + cash trades between managers
- **Historical Analysis** - Gameweek-by-gameweek performance tracking with sortable tables
- **Player Details** - Comprehensive stats modal with ICT metrics
- **Price Import** - Bulk import auction prices from spreadsheet

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS
- React Router
- Recharts
- FPL Official API

## Quick Start - Local Development

### Prerequisites
- Node.js (v16 or higher)

### Run the Backend API

```bash
cd api
npm install
npm start
```

Backend runs on: `http://localhost:3001`

### Run the Frontend

```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions to:
- Backend API → Vercel (free)
- Frontend → GitHub Pages (free)

## Configuration

Create a `.env.local` file:
```
VITE_API_URL=http://localhost:3001  # For local dev
# or
VITE_API_URL=https://your-api.vercel.app  # For production
```

## Project Structure

```
├── api/                # Backend API proxy server
├── components/         # React components
├── contexts/          # State management contexts
├── pages/             # Main app pages
├── types.ts           # TypeScript definitions
├── App.tsx            # Main app component
└── index.tsx          # Entry point
```

## Usage

1. **Setup Page**: Import your FPL Draft league by ID or add managers manually
2. **Leaderboard**: View live scores and rankings
3. **Rosters**: See all team rosters with player stats
4. **Trades**: Execute trades between managers
5. **History**: Analyze weekly performance trends

## Data Storage

- All league data is stored in browser localStorage
- FPL API data is cached for 1 hour
- No database required

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive

## License

MIT

## Acknowledgments

Data from the official Fantasy Premier League API. This is an unofficial tool.
