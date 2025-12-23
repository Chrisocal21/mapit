# MapFrame Deployment Guide

## 🚀 React App is Now the Main Site!

The new React-based professional editor is now the primary application. The old HTML/JS version has been archived to `/old` for reference.

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Mapbox API token (get from https://mapbox.com)
- Optional: OpenAI API key for AI features

### Environment Variables
Create a `.env` file in the root directory:
```env
MAPBOX_TOKEN=your_mapbox_token_here
PORT=3000
OPENAI_API_KEY=your_openai_key_here  # Optional
```

### Running in Development

**Start Backend Server (Terminal 1):**
```bash
npm start
# or for auto-reload:
npm run dev
```
Backend runs on: http://localhost:3000

**Start Frontend Dev Server (Terminal 2):**
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:5176

### File Structure
```
mapframe/
├── server.js           # Express backend with API routes
├── client/             # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MapSelectionPage.jsx  # Main map selection
│   │   │   └── EditorPage.jsx         # Professional editor
│   │   └── components/
│   │       └── MapComponent.jsx       # Leaflet integration
│   └── package.json
├── public/             # Legacy files (archived)
│   ├── index.html.old
│   └── editor.html.old
└── package.json        # Root package.json
```

## Production Deployment

### Build the React App
```bash
npm run build
```
This creates an optimized production build in `client/dist/`

### Run Production Server
```bash
NODE_ENV=production npm start
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy! Vercel auto-detects the setup

#### Heroku
```bash
heroku create your-app-name
heroku config:set MAPBOX_TOKEN=your_token
git push heroku main
```

#### VPS (DigitalOcean, AWS, etc.)
```bash
# Build the app
npm run build

# Install PM2 for process management
npm install -g pm2

# Start with PM2
NODE_ENV=production pm2 start server.js --name mapframe

# Save PM2 config
pm2 save
pm2 startup
```

## API Endpoints

### Mapbox Static Images
```
GET /api/mapbox/static?style=streets-v12&bbox=-74,40,-73,41&width=1280&height=1280
```

### Geocoding Search
```
GET /api/mapbox/geocoding?q=Los Angeles
```

### AI Style Suggestions (Optional - requires OpenAI key)
```
POST /api/ai/suggest-style
Body: { "description": "vintage city map" }
```

## Features

### Map Selection Page
- ✅ Search locations worldwide
- ✅ Blue selection box with spacebar + drag
- ✅ 4 corner resize handles
- ✅ 10 aspect ratio presets + custom ratios
- ✅ Custom dimensions (px, in, cm, mm) at 300 DPI
- ✅ 8 map styles (streets, satellite, outdoors, etc.)
- ✅ Quick preset buttons (A4, Letter, 8×10, 11×14)

### Professional Editor
- ✅ Adobe Photoshop/Illustrator aesthetic
- ✅ Zoom: 0.1-5x with Ctrl+Plus/Minus/0/1 and mouse wheel
- ✅ Pan: Spacebar + drag
- ✅ Status bar with dimensions and cursor position
- ✅ Layer visibility with SVG eye icons
- ✅ Export formats: PNG, JPG, WebP with quality slider
- ✅ Canvas backgrounds: white, gray, transparent, checkerboard
- ✅ Custom borders: 0-50px thickness, color picker, overlap
- ✅ Keyboard shortcuts modal (Ctrl+/)
- ✅ Rulers with tick marks
- ✅ Grid overlay
- ✅ Contrast adjustment
- ✅ Edge detection (OpenCV, disabled for performance)
- ✅ Invert colors
- ✅ Undo/Redo (Ctrl+Z/Ctrl+Shift+Z)

### Accessibility
- ⚡ No animations (instant transitions for epilepsy safety)
- 🖱️ Full keyboard navigation
- 🎨 High contrast Adobe color scheme
- 📐 Precise dimension displays

## Troubleshooting

### Port Already in Use
```bash
# Windows
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort -eq 3000 } | Stop-Process -Force

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### React Router 404s in Production
Make sure the catch-all route in `server.js` is serving `client/dist/index.html` correctly.

### Mapbox Images Not Loading
1. Check `.env` file has `MAPBOX_TOKEN`
2. Verify token is valid on mapbox.com dashboard
3. Check browser console for CORS errors

## Old Version Access

The original HTML/JS version is archived and accessible at:
```
http://localhost:3000/old/
```

## License

MIT - See LICENSE file for details

## Support

For issues or questions, open a GitHub issue or contact the development team.

---

**Made with ❤️ for laser engraving enthusiasts**
