# mapit - Map Engraving Generator

**Project Status:** ✅ Production Ready (95% Complete)  
**Last Updated:** December 21, 2025
**Progress:** ████████████████████░ 95%

## 📋 Project Overview

A web application for generating laser engraving-ready map images. Users can select any location on an interactive map, adjust a bounding box to capture the desired area, and download a high-contrast black/white image optimized for glass laser engraving.

---

## ✅ Progression Tracker

### Phase 1: Project Setup
- [x] Create project directory structure
- [x] Set up version control
- [x] Create main HTML file
- [x] Add Mapbox API token placeholder

### Phase 2: Core Map Functionality
- [x] Integrate Leaflet.js library
- [x] Implement interactive map with pan/zoom
- [x] Add location search functionality
- [x] Configure Mapbox tile layers

### Phase 3: Bounding Box Selection
- [x] Create adjustable bounding box overlay
- [x] Add drag handles for box resizing
- [x] Display current coordinates/dimensions
- [x] Implement map pan while dragging

### Phase 4: Image Generation
- [x] Set up Mapbox Static Images API integration
- [x] Build API URL with bounding box parameters
- [x] Configure monochrome style (light-v11 or dark-v11)
- [x] Handle API response and error states

### Phase 5: Image Processing
- [x] Load image into Canvas API
- [x] Implement grayscale conversion
- [x] Apply high contrast threshold adjustment
- [x] Add optional edge detection filter
- [x] Preview processed image

### Phase 6: User Interface
- [x] Design clean, minimal UI layout
- [x] Add search bar component
- [x] Create control panel for adjustments
- [x] Add "Generate Engraving Image" button
- [x] Implement download functionality
- [x] Add loading states and progress indicators

### Phase 7: Responsive Design
- [x] Mobile-friendly layout
- [x] Touch controls for bounding box
- [x] Responsive map sizing
- [x] Mobile-optimized controls

### Phase 8: Polish & Testing (90% Complete)
- [x] Add user instructions/help text
- [x] Implement error handling
- [x] Optimize performance
- [x] Add comments to code
- [x] Add dropdown menu system
- [x] Implement preview with zoom/pan
- [x] Add laser mode with text/road/water controls
- [ ] Test across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices

### Phase 9: Deployment (60% Complete)
- [x] Prepare for static hosting
- [x] Add favicon and branding
- [x] Create organized UI structure
- [ ] Test on Cloudflare Pages or GitHub Pages
- [ ] Create README with setup instructions
- [ ] Document API token setup process

### Phase 10: Advanced Features (NEW - 75% Complete)
- [x] Laser engraving mode with custom processing
- [x] Black text with white box enhancement
- [x] Black roads forcing
- [x] White water forcing
- [x] Real-time preview adjustments
- [x] Copy to clipboard functionality
- [x] Clear selection tool
- [x] Regenerate from preview
- [ ] Save/load presets
- [ ] Export settings as URL

---

## 🎯 Functional Requirements

### Core Features
1. **Interactive Map Interface**
   - Pan and zoom controls
   - Location search with autocomplete
   - Click-to-center functionality

2. **Bounding Box Selection**
   - Visual rectangle overlay
   - Draggable resize handles
   - Coordinate display
   - Size constraints

3. **Image Generation**
   - Single API call per generation
   - High-resolution output (suitable for engraving)
   - Black/white high-contrast result
   - PNG format download

4. **Client-Side Processing**
   - No server required
   - Browser-based image manipulation
   - Instant preview

---

## 🔧 Technical Stack

### Libraries & APIs
- **Leaflet.js** (v1.9+) - Interactive map (MIT License, free)
- **Mapbox Static Images API** - Final map capture (free tier: 50,000 requests/month)
- **Canvas API** - Client-side image processing
- **Mapbox Geocoding API** - Location search (optional)

### Map Styles
- `mapbox://styles/mapbox/light-v11` - Light monochrome
- `mapbox://styles/mapbox/dark-v11` - Dark monochrome

### Image Processing Pipeline
```
Mapbox Static Image
    ↓
Load to Canvas
    ↓
Convert to Grayscale
    ↓
Apply Contrast Threshold
    ↓
Optional Edge Detection
    ↓
Download as PNG
```

---

## 👤 User Flow

1. **Land on Page**
   - See interactive map centered on default location
   - See default bounding box overlay
   - See instructions

2. **Select Location**
   - Search for address/place name, OR
   - Pan/zoom to desired location, OR
   - Click on map to center

3. **Adjust Bounding Box**
   - Drag corners/edges to resize
   - Drag center to reposition
   - View real-time dimensions

4. **Configure Settings** (Optional)
   - Choose light/dark style
   - Adjust contrast threshold
   - Enable/disable edge detection

5. **Generate Image**
   - Click "Generate Engraving Image"
   - Wait for processing (with progress indicator)
   - Preview result

6. **Download**
   - Click "Download PNG"
   - Save to device

---

## 💰 Budget & Cost Optimization

### Mapbox API Costs
- **Free Tier:** 50,000 Static Images requests/month
- **Strategy:** One API call per generation only
- **Estimated Usage:** ~1,000 requests/month (well within free tier)

### Hosting
- **Cloudflare Pages:** Free
- **GitHub Pages:** Free
- **No backend required**

### Total Monthly Cost: **$0**

---

## 📐 Technical Specifications

### Image Processing Parameters
```javascript
// Default settings for laser engraving optimization
const PROCESSING_CONFIG = {
  contrastThreshold: 128,      // 0-255, adjust for engraving depth
  outputWidth: 2000,            // pixels
  outputHeight: 2000,           // pixels
  edgeDetection: false,         // optional enhancement
  invertColors: false           // for dark backgrounds
};
```

### Mapbox Static Images API Format
```
https://api.mapbox.com/styles/v1/{username}/{style_id}/static/
  [{bbox}]/
  {width}x{height}
  ?access_token={token}
```

### File Structure
```
mapit/
├── index.html          # Complete single-file application
├── PROJECT.md          # This file
└── README.md           # User documentation
```

---

## 🎨 UI/UX Design Guidelines

### Visual Style
- **Color Scheme:** Minimal - grays, white, one accent color
- **Typography:** System fonts, clear hierarchy
- **Layout:** Single column on mobile, sidebar on desktop
- **Aesthetic:** "Boring, fast, and trustworthy"

### Key UI Components
1. Map viewport (75% of screen)
2. Control panel (sidebar or bottom sheet)
3. Search bar (prominent, top)
4. Generate button (primary CTA)
5. Download button (appears after generation)

---

## 🚀 Deployment Checklist

- [ ] Replace Mapbox API token placeholder
- [ ] Test all functionality
- [ ] Optimize image sizes
- [ ] Add meta tags for SEO
- [ ] Add favicon
- [ ] Test on target hosting platform
- [ ] Add analytics (optional)
- [ ] Create user documentation

---

## 📝 Notes & Considerations

### Engraving Optimization
- High contrast is essential for laser engravers
- Black areas = engraved, white areas = untouched glass
- Edge detection can add street detail
- Resolution: 2000x2000px suitable for most engraving projects

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Canvas API fully supported
- Mobile browsers: All modern browsers supported

### Future Enhancements (Post-MVP)
- [ ] Save favorite locations
- [ ] Custom style configurations
- [ ] Batch processing
- [ ] Export to SVG format
- [ ] 3D preview of engraving result
- [ ] Sharing functionality

---

## 📞 Support & Resources

### Documentation Links
- [Leaflet.js Docs](https://leafletjs.com/)
- [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Mapbox Resources
- API Token: Get from [Mapbox Account](https://account.mapbox.com/)
- Free Tier: 50,000 requests/month
- Style Reference: [Mapbox Styles](https://docs.mapbox.com/api/maps/styles/)

---

**Ready to start building! 🔨**
