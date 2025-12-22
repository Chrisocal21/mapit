# 🗺️ maprdy - Map to Laser Ready

**Generate laser engraving-ready map images from any location worldwide.**

Perfect for creating custom gifts, artwork, and personalized engravings on glass, wood, or metal.

---

## 🚀 Quick Start

**Option 1: Use Hosted Version** (Recommended)
- Visit [maprdy.com](https://maprdy.com)
- No installation required!

**Option 2: Run Locally**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/maprdy.git
cd maprdy

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Add your API keys to .env
MAPBOX_TOKEN=your_mapbox_token_here
OPENAI_API_KEY=your_openai_key_here  # Optional for AI features

# 5. Start the server
npm start

# 6. Open browser
# Visit http://localhost:3000
```

---

## ✨ Key Features

### 🗺️ Interactive Map Selection
- **Global Coverage**: Search any location worldwide
- **Precise Selection**: Draggable bounding box with rotation
- **Multiple Styles**: Light, Dark, Streets, Outdoors, Laser

### 🎨 Professional Editor
- **Live Preview**: See changes in real-time
- **Dark Theme**: Adobe/Lightburn-inspired professional UI
- **Advanced Controls**: Contrast, invert, edge detection, thickening
- **Canvas Processing**: All editing client-side (fast & free)

### 🤖 AI-Powered Features
- **Smart Search**: Natural language location finding
- **Optimization Suggestions**: AI recommends best settings
- **Map Descriptions**: Automatic generation of engraving context

### ⚡ Performance
- **Budget-Friendly**: ONE API call per map, unlimited edits
- **Fast Processing**: Client-side Canvas operations
- **High Resolution**: Up to 2560×2560px for detailed engravings

---

## 🎛️ Usage Guide

### Map Style
- **Light Monochrome**: Best for general engraving, clean minimal style
- **Dark Monochrome**: Inverted style, good with "Invert Colors" option
- **Streets**: More detailed road network
- **Outdoors**: Topographic features and terrain

### Contrast Threshold (0-255)
Controls what becomes black vs white in the final image:
- **Lower values** (50-100): More black, bolder result
- **Medium values** (128): Balanced (default)
- **Higher values** (180-230): More white, subtle result

### Edge Detection
Applies Sobel edge detection to emphasize lines and boundaries. Great for:
- Street maps with lots of roads
- Architectural layouts
- Detailed urban areas

### Invert Colors
Swaps black and white in the output:
- **OFF**: Black = engraved areas, white = untouched glass (standard)
- **ON**: White = engraved areas, black = untouched glass (inverted)

### Output Size
Choose resolution based on your engraving project:
- **1000x1000**: Small projects, faster processing
- **1500x1500**: Medium projects
- **2000x2000**: Large projects (recommended)
- **2500x2500**: Maximum detail, larger file size

## 🔧 Technical Details

### Built With
- **Leaflet.js** - Interactive map library (MIT License)
- **Mapbox APIs** - Static Images + Geocoding
- **Canvas API** - Client-side image processing
- **Pure HTML/CSS/JS** - No build tools required

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### API Costs
- **Mapbox Free Tier**: 50,000 Static Image requests/month
- **One request per image generation**
- **Estimated usage**: ~1,000 requests/month for typical use
- **Total cost**: $0/month

## 📁 Project Structure

```
mapit/
├── index.html      # Complete single-file application
├── PROJECT.md      # Development roadmap and specs
└── README.md       # This file
```

## 🛠️ Development

The entire application is contained in a single HTML file for easy deployment:
- Embedded CSS for styling
- Embedded JavaScript for functionality
- CDN-linked libraries (Leaflet.js)
- No build process required

To modify:
1. Open `index.html` in your code editor
2. Make changes
3. Refresh browser to test

## 🚀 Deployment

### Cloudflare Pages
1. Push to GitHub repository
2. Connect to Cloudflare Pages
3. Deploy from `main` branch
4. Done! (No build command needed)

### GitHub Pages
1. Push to GitHub repository
2. Go to Settings > Pages
3. Select branch and root directory
4. Your site will be live at `username.github.io/mapit`

### Self-Hosting
Simply upload `index.html` to any web server. No server-side processing required.

## 💡 Usage Tips

### For Best Results
1. **Choose the right map style**: Light monochrome works best for most projects
2. **Start with default threshold**: Adjust only if needed
3. **Use edge detection sparingly**: Best for detailed street maps
4. **Test different sizes**: Preview before committing to large exports

### Engraving Recommendations
- **Black areas** = laser engraves these areas (creates frosted effect)
- **White areas** = glass remains clear/smooth
- Use **high contrast** (threshold adjustment) for clean results
- **Edge detection** can add fine detail but may complicate simpler designs

### Location Tips
- Search by address, city, or landmark name
- Or manually pan/zoom to your location
- Click anywhere on the map to center the bounding box there
- Drag corners to resize, drag center to move

## ⚠️ Troubleshooting

**"Failed to fetch map image" error**
- Check that your Mapbox token is valid
- Ensure token has public scopes enabled
- Verify your free tier quota hasn't been exceeded

**Image looks too dark/light**
- Adjust the contrast threshold slider
- Try different map styles
- Use invert colors option

**Bounding box not moving**
- Make sure Leaflet editing is enabled (should be by default)
- Try clicking and dragging the edges or corners
- Refresh the page if stuck

---

## 🚢 Deployment

### Deploy to Vercel (Recommended - Free)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# MAPBOX_TOKEN=your_token
# OPENAI_API_KEY=your_key (optional)

# 5. Deploy to production
vercel --prod
```

### Deploy to Other Platforms

**Netlify**: Works with same setup as Vercel  
**Render**: Use `npm start` as start command  
**Railway**: Auto-detects Node.js, add env vars in dashboard

---

## 💰 Cost & API Limits

**Mapbox** (Required)
- Free tier: 50,000 map loads/month
- Static Images: 750,000 free requests/month
- **Your cost: $0-5/month**

**OpenAI** (Optional - AI features only)
- GPT-4o-mini: $0.15 per 1M input tokens
- Typical usage: ~500 tokens per AI interaction
- **Your cost: $0-2/month for moderate use**

**Hosting**: $0 (Vercel/Netlify free tier)

**Total monthly cost: $0-7** 🎉

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects!

---

## 🙏 Credits

Built with:
- [Leaflet.js](https://leafletjs.com/) - Interactive maps
- [Mapbox](https://www.mapbox.com/) - Map tiles and Static Images API
- [OpenAI](https://openai.com/) - GPT-4o-mini for AI features
- [Express.js](https://expressjs.com/) - Lightweight backend

---

**Questions? Issues? Open a GitHub issue or PR!** 🚀

**Search not working**
- Ensure Mapbox token is entered
- Check internet connection
- Type at least 3 characters

## 📝 License

This project is open source and available for personal and commercial use.

### Dependencies
- Leaflet.js: BSD 2-Clause License
- Mapbox: Check [Mapbox Terms](https://www.mapbox.com/legal/tos) for API usage

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share your engraving results!

## 📧 Support

For issues or questions:
- Check the troubleshooting section above
- Review [Mapbox documentation](https://docs.mapbox.com/)
- Review [Leaflet documentation](https://leafletjs.com/)

---

**Happy Engraving! 🔧✨**
