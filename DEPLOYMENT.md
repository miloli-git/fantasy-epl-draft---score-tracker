# Deployment Guide

This guide explains how to deploy the Fantasy EPL Draft Score Tracker.

## Architecture

The app consists of two parts:
1. **Frontend** - React app (deployed to GitHub Pages)
2. **Backend API** - Node.js proxy server (deployed to Vercel)

## Step 1: Deploy the Backend API to Vercel

The backend API is required to proxy requests to the FPL API (avoiding CORS issues).

### Prerequisites
- Vercel account (free tier works fine)
- Vercel CLI installed: `npm install -g vercel`

### Deployment Steps

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Deploy to Vercel:
```bash
vercel
```

4. Follow the prompts:
   - Select your Vercel account
   - Link to existing project or create new one
   - Accept default settings

5. After deployment, you'll receive a URL like: `https://your-api-name.vercel.app`

6. **Save this URL** - you'll need it for the frontend configuration!

### Test the API

Visit `https://your-api-name.vercel.app/health` to verify it's working.

## Step 2: Configure the Frontend

1. Create a `.env.local` file in the root directory:
```bash
VITE_API_URL=https://your-api-name.vercel.app
```

Replace `https://your-api-name.vercel.app` with your actual Vercel deployment URL from Step 1.

## Step 3: Deploy the Frontend to GitHub Pages

1. Install dependencies (if not already done):
```bash
npm install
```

2. Build and deploy:
```bash
npm run deploy
```

This will:
- Build the production app
- Create a `gh-pages` branch
- Push the built files to GitHub Pages

3. Enable GitHub Pages in your repository:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

4. Your app will be live at:
```
https://miloli-git.github.io/fantasy-epl-draft---score-tracker/
```

## Environment Variables

### Frontend (.env.local)
- `VITE_API_URL` - Your Vercel API URL (required for production)

### Backend (optional)
- `PORT` - Server port (default: 3001)

## Local Development

### Run the Backend
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

Make sure your `.env.local` points to `http://localhost:3001` for local development.

## Updating the Deployment

### Update Backend
```bash
cd api
vercel --prod
```

### Update Frontend
```bash
npm run deploy
```

## Troubleshooting

### Frontend can't connect to backend
- Verify your `VITE_API_URL` in `.env.local` is correct
- Test the backend health endpoint: `https://your-api.vercel.app/health`
- Check browser console for CORS errors

### GitHub Pages shows 404
- Verify GitHub Pages is enabled for the `gh-pages` branch
- Check that `base` in `vite.config.ts` matches your repo name
- Wait a few minutes for GitHub Pages to update

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify all imports are correct

## Cost

Both services are **FREE**:
- Vercel: Free tier includes 100GB bandwidth, serverless functions
- GitHub Pages: Free for public repositories

## Support

For issues:
1. Check browser console for errors
2. Verify API is responding: `/health` endpoint
3. Check GitHub Actions for deployment logs
