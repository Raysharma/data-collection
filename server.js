import 'dotenv/config'; // Load environment variables
import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';

const app = express();

app.use(express.json());

// Enhanced CORS configuration (still useful for non-proxied requests or production)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url} with query:`, req.query);
  next();
});

// Endpoint to generate roadmap data using Google Custom Search API
app.get('/roadmap', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      console.log('Missing query parameter "q"');
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Log environment variables (without exposing sensitive data)
    console.log('Using Search Engine ID:', process.env.SEARCH_ENGINE_ID ? 'Set' : 'Not set');
    console.log('Using API Key:', process.env.GOOGLE_API_KEY ? 'Set' : 'Not set');

    const customSearch = google.customsearch('v1');
    const response = await customSearch.cse.list({
      cx: process.env.SEARCH_ENGINE_ID,
      key: process.env.GOOGLE_API_KEY,
      q: `${q} tutorial course learn`,
      num: 10,
    });

    console.log('Google API response received:', response.data);

    const items = response.data.items || [];
    const roadmapData = items.map(item => ({
      title: item.title,
      snippet: item.snippet || 'Explore this resource for your learning journey.',
      link: item.link,
    }));

    res.json(roadmapData);
  } catch (error) {
    console.error('Error in /roadmap endpoint:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to fetch roadmap data', details: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));