import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Cache for FPL data (1 hour TTL)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Helper function to get cached data
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// FPL Bootstrap endpoint
app.get('/api/bootstrap-static', async (req, res) => {
  try {
    const cacheKey = 'bootstrap-static';
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log('Serving bootstrap data from cache');
      return res.json(cachedData);
    }

    console.log('Fetching bootstrap data from FPL API...');
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');

    if (!response.ok) {
      throw new Error(`FPL API returned ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);

    res.json(data);
  } catch (error) {
    console.error('Error fetching bootstrap data:', error);
    res.status(500).json({ error: 'Failed to fetch FPL data', message: error.message });
  }
});

// FPL Draft League Details endpoint
app.get('/api/league/:leagueId/details', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const cacheKey = `league-${leagueId}-details`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`Serving league ${leagueId} details from cache`);
      return res.json(cachedData);
    }

    console.log(`Fetching league ${leagueId} details from FPL API...`);
    const response = await fetch(`https://draft.premierleague.com/api/league/${leagueId}/details`);

    if (!response.ok) {
      throw new Error(`FPL API returned ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);

    res.json(data);
  } catch (error) {
    console.error('Error fetching league details:', error);
    res.status(500).json({ error: 'Failed to fetch league details', message: error.message });
  }
});

// FPL Draft Element Status endpoint
app.get('/api/league/:leagueId/element-status', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const cacheKey = `league-${leagueId}-element-status`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`Serving league ${leagueId} element status from cache`);
      return res.json(cachedData);
    }

    console.log(`Fetching league ${leagueId} element status from FPL API...`);
    const response = await fetch(`https://draft.premierleague.com/api/league/${leagueId}/element-status`);

    if (!response.ok) {
      throw new Error(`FPL API returned ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);

    res.json(data);
  } catch (error) {
    console.error('Error fetching element status:', error);
    res.status(500).json({ error: 'Failed to fetch element status', message: error.message });
  }
});

// FPL Player Summary endpoint
app.get('/api/element-summary/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const cacheKey = `player-${playerId}-summary`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log(`Serving player ${playerId} summary from cache`);
      return res.json(cachedData);
    }

    console.log(`Fetching player ${playerId} summary from FPL API...`);
    const response = await fetch(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`);

    if (!response.ok) {
      throw new Error(`FPL API returned ${response.status}`);
    }

    const data = await response.json();
    setCachedData(cacheKey, data);

    res.json(data);
  } catch (error) {
    console.error('Error fetching player summary:', error);
    res.status(500).json({ error: 'Failed to fetch player summary', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clear cache endpoint (useful for development)
app.post('/api/cache/clear', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

app.listen(PORT, () => {
  console.log(`FPL Draft API proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
