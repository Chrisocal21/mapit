# 🗺️ Map Engraving Image Generator

A web application for generating laser engraving-ready map images. Select any location, adjust the bounding box, and download high-contrast black/white PNG images optimized for glass laser engraving.

## 🚀 Quick Start

1. **Get a Mapbox API Token**
   - Sign up for free at [mapbox.com](https://account.mapbox.com/)
   - Create a new token with default public scopes
   - Free tier includes 50,000 requests/month

2. **Open the Application**
   - Open `index.html` in any modern web browser
   - Or deploy to Cloudflare Pages / GitHub Pages

3. **Use the App**
   - Enter your Mapbox API token in the control panel
   - Search for a location or pan the map
   - Adjust the blue rectangle to frame your desired area
   - Click "Generate Engraving Image"
   - Download your processed PNG

## ✨ Features

- **Interactive Map**: Pan, zoom, and search for any location worldwide
- **Adjustable Selection**: Drag and resize the bounding box to capture exactly what you need
- **High-Contrast Processing**: Automatic conversion to black/white for optimal engraving
- **Multiple Styles**: Choose from Light, Dark, Streets, or Outdoors map styles
- **Edge Detection**: Optional edge enhancement for detailed street maps
- **No Server Required**: 100% client-side processing
- **Mobile Friendly**: Works on desktop, tablet, and phone

## 🎛️ Settings Explained

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
