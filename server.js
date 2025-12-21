const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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

// Catch-all route to serve index.html for any non-API routes
// This prevents 404 errors when refreshing or navigating
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Mapbox token configured:', !!process.env.MAPBOX_TOKEN);
});
