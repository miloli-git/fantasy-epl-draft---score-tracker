# Deployment Guide - Vercel (Simplified)

This guide explains how to deploy the entire Fantasy EPL Draft Score Tracker to Vercel in one simple deployment.

## Why Vercel?

Since we already need Vercel for the backend API, we can deploy the entire app (frontend + backend) to Vercel:

✅ **One platform** - No need for GitHub Pages
✅ **Simpler setup** - Single deployment command
✅ **Better performance** - Frontend and backend on same domain (no CORS preflight)
✅ **Easier management** - One dashboard, one URL
✅ **Still FREE** - Vercel's free tier is generous

## Prerequisites

- Vercel account (sign up at vercel.com - it's free)
- Vercel CLI: `npm install -g vercel`

## One-Step Deployment

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Deploy Everything

From the project root directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (or Yes if you've deployed before)
- **What's your project's name?** → fantasy-epl-draft (or keep default)
- **In which directory is your code located?** → ./ (press Enter)
- **Want to override settings?** → No

That's it! Vercel will:
1. Build your frontend (React app)
2. Deploy your backend (API server)
3. Configure routing automatically
4. Give you a live URL like: `https://fantasy-epl-draft.vercel.app`

### 3. Production Deployment

For subsequent deployments to production:

```bash
vercel --prod
```

## How It Works

The `vercel.json` configuration tells Vercel:

1. **Frontend**: Build the React app from `package.json` → creates static files in `dist/`
2. **Backend**: Deploy `api/index.js` as a serverless function
3. **Routing**:
   - `/api/*` → Backend API
   - Everything else → Frontend static files
4. **Environment**: Automatically sets `VITE_API_URL=/api` so frontend uses relative paths

## Local Development

### Terminal 1 - Backend API
```bash
cd api
npm install
npm start
```

Backend runs on: `http://localhost:3001`

### Terminal 2 - Frontend
```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

The `.env.local` file tells the frontend to use `http://localhost:3001` during development.

## Environment Variables

### Production (Vercel)
Automatically configured via `vercel.json`:
- `VITE_API_URL=/api` (uses relative paths)

### Local Development
Configured in `.env.local`:
- `VITE_API_URL=http://localhost:3001`

## Project Structure

```
.
├── api/              # Backend API (serverless function)
│   ├── index.js      # API server
│   └── package.json  # API dependencies
├── src/              # Frontend source code
├── dist/             # Built frontend (auto-generated)
├── vercel.json       # Vercel configuration
└── package.json      # Frontend dependencies
```

## Updating Your Deployment

Just run:
```bash
vercel --prod
```

Vercel will rebuild and redeploy everything automatically.

## Custom Domain (Optional)

1. Go to your Vercel dashboard
2. Select your project
3. Settings → Domains
4. Add your custom domain
5. Follow DNS setup instructions

## Vercel Dashboard

View your deployment at: https://vercel.com/dashboard

Here you can:
- See deployment logs
- View analytics
- Manage domains
- Configure environment variables
- Roll back to previous deployments

## Cost

**Completely FREE** with Vercel's Hobby plan:
- Unlimited bandwidth
- Automatic HTTPS
- CDN included
- 100GB monthly bandwidth
- Serverless functions included

## Troubleshooting

### Build fails
```bash
# Test build locally first
npm run build
```

### API not working
Check logs in Vercel dashboard → Your Project → Deployments → Latest → Logs

### Frontend shows errors
- Check browser console
- Verify API endpoints are working: `https://your-app.vercel.app/api/health`

### Need to clear cache
Redeploy with:
```bash
vercel --prod --force
```

## Preview Deployments

Every git branch you push gets its own preview URL automatically! Perfect for testing before production.

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
