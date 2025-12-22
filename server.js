const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (for monitoring & deployment verification)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: require('./package.json').version,
        services: {
            mapbox: !!process.env.MAPBOX_TOKEN,
            openai: !!process.env.OPENAI_API_KEY
        }
    });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve editor without .html extension
app.get('/editor', (req, res) => {
    res.sendFile(__dirname + '/public/editor.html');
});

// Proxy endpoint for Mapbox Static Images API
app.get('/api/mapbox/static', async (req, res) => {
    try {
        const { style, bbox, width, height, size, retina } = req.query;
        
        if (!process.env.MAPBOX_TOKEN) {
            return res.status(500).json({ error: 'Mapbox token not configured' });
        }

        // Support both new (width/height) and legacy (size) parameters
        const imgWidth = width || size;
        const imgHeight = height || size;
        
        // For laser mode, use streets-v12 (has best detail for engraving)
        // We'll process it client-side to get pure black/white
        const mapStyle = style === 'laser' ? 'streets-v12' : style;
        
        const retinaParam = retina === 'true' ? '@2x' : '';
        const url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/[${bbox}]/${imgWidth}x${imgHeight}${retinaParam}?access_token=${process.env.MAPBOX_TOKEN}`;
        
        console.log('Fetching from Mapbox:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mapbox API Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `Mapbox API error: ${response.statusText}`,
                details: errorText
            });
        }
        
        // Get the image as a buffer
        const buffer = await response.buffer();
        
        // Set appropriate headers
        res.set('Content-Type', 'image/png');
        res.set('Content-Length', buffer.length);
        
        // Send the image
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching from Mapbox:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for Mapbox Geocoding API
app.get('/api/mapbox/geocoding', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!process.env.MAPBOX_TOKEN) {
            return res.status(500).json({ error: 'Mapbox token not configured' });
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.MAPBOX_TOKEN}&limit=5`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching from Mapbox:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI-enhanced search endpoint
app.post('/api/ai/search', async (req, res) => {
    try {
        if (!openai) {
            return res.status(503).json({ error: 'OpenAI not configured', fallback: true });
        }

        const { query } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a location search assistant. Convert natural language queries into specific location searches.
Return ONLY a JSON object with this structure:
{
  "searchTerm": "specific location to search",
  "suggestions": ["alternative 1", "alternative 2"],
  "interpretation": "brief explanation"
}

Examples:
- "coffee shops near downtown Seattle" → {"searchTerm": "downtown Seattle", "suggestions": ["Pike Place Market, Seattle", "Capitol Hill, Seattle"], "interpretation": "Searching downtown Seattle area for coffee shops"}
- "hiking trails in Oregon" → {"searchTerm": "Oregon hiking trails", "suggestions": ["Columbia River Gorge", "Crater Lake"], "interpretation": "Searching for hiking areas in Oregon"}
- "that famous bridge in SF" → {"searchTerm": "Golden Gate Bridge San Francisco", "suggestions": ["Bay Bridge San Francisco"], "interpretation": "Identified as Golden Gate Bridge"}`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('Error with AI search:', error);
        res.status(500).json({ error: error.message, fallback: true });
    }
});

// AI map description endpoint
app.post('/api/ai/describe', async (req, res) => {
    try {
        if (!openai) {
            return res.status(503).json({ error: 'OpenAI not configured' });
        }

        const { location, bbox, style, dimensions } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a map description assistant. Provide brief, helpful descriptions of map selections.
Focus on: what's shown, interesting features, and use case suggestions.
Keep responses under 100 words and friendly.`
                },
                {
                    role: "user",
                    content: `Describe this map selection:
Location: ${location || 'Unknown'}
Bounding box: ${bbox}
Style: ${style}
Dimensions: ${dimensions}

Provide a concise description and 2-3 suggested uses (e.g., "Great for wall art", "Perfect for trail planning").`
                }
            ],
            temperature: 0.8,
            max_tokens: 200
        });

        res.json({ description: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error with AI description:', error);
        res.status(500).json({ error: error.message });
    }
});

// AI map optimization suggestions
app.post('/api/ai/suggest', async (req, res) => {
    try {
        if (!openai) {
            return res.status(503).json({ error: 'OpenAI not configured' });
        }

        const { location, style, dimensions, purpose } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a map optimization expert. Suggest optimal map settings.
Return ONLY a JSON object with:
{
  "suggestedStyle": "streets-v12|satellite-v9|outdoors-v12|light-v11|dark-v11|laser",
  "suggestedDimensions": "WIDTHxHEIGHT",
  "reasoning": "brief explanation",
  "tips": ["tip1", "tip2"]
}`
                },
                {
                    role: "user",
                    content: `Optimize map settings for:
Location: ${location}
Current style: ${style}
Current dimensions: ${dimensions}
Purpose: ${purpose || 'general use'}`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('Error with AI suggestions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Catch-all route to serve index.html for any non-API routes
// This prevents 404 errors when refreshing or navigating
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Mapbox token configured:', !!process.env.MAPBOX_TOKEN);
    console.log('OpenAI configured:', !!openai);
});
