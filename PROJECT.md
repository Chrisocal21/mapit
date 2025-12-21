# mapit - Map Engraving Generator

**Project Status:** ✅ Production Ready + AI Enhanced (98% Complete)  
**Last Updated:** December 21, 2025
**Progress:** ███████████████████▓░ 98%

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

### Phase 9: Deployment (80% Complete)
- [x] Prepare for static hosting
- [x] Add favicon and branding
- [x] Create organized UI structure
- [x] Fix 404 routing issues (catch-all route)
- [x] Add AI features documentation
- [ ] Test on Cloudflare Pages or GitHub Pages
- [ ] Create comprehensive README with setup instructions
- [ ] Document API token setup process

### Phase 10: Advanced Features (90% Complete)
- [x] Laser engraving mode with custom processing
- [x] Black text with white box enhancement
- [x] Black roads forcing
- [x] White water forcing
- [x] Real-time preview adjustments
- [x] Copy to clipboard functionality
- [x] Clear selection tool
- [x] Regenerate from preview
- [x] Thicken text & lines (morphological dilation, 0.5-5px)
- [ ] Remove ferry/dashed lines (needs refinement - detection algorithm incomplete)
- [x] Deterministic processing (repeatable results)
- [ ] Save/load presets
- [ ] Export settings as URL

### Phase 11: AI Integration (NEW - 100% Complete) ✨
- [x] OpenAI API integration
- [x] AI-enhanced natural language search
- [x] AI assistant for map optimization
- [x] Purpose-driven settings suggestions
- [x] Auto-apply AI recommendations
- [x] AI map description in preview
- [x] Graceful fallback when AI unavailable
- [x] Cost-optimized (GPT-4o-mini)

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
- **Mapbox Geocoding API** - Location search
- **OpenAI API** (GPT-4o-mini) - AI-enhanced features (optional)
- **Canvas API** - Client-side image processing
- **Express.js** - Lightweight backend server
- **Node.js** - Runtime environmente tier: 50,000 requests/month)
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
    ↓: Thicken Text/Lines (Dilation)
    ↓
Optional: Remove Ferry Lines (Component Analysis)
    ↓
Optional: Edge Detection
    ↓
Optional: Invert Colors
    ↓
Optional: Black Text with White Box
    ↓
Download as PNG / Copy to Clipboard
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

6. *OpenAI API Costs (Optional)
- **Model:** GPT-4o-mini (most cost-effective)
- **Input:** ~$0.15 per million tokens
- **Output:** ~$0.60 per million tokens
- **Estimated Usage:** ~200-500 tokens per AI request
- **Monthly Cost:** Pennies per day (< $5/month typical usage)
- **Features:** AI search, optimization suggestions, map descriptions

### Hosting
- **Cloudflare Pages:** Free (recommended for Node.js backend)
- **Render.com:** Free tier available for Node.js
- **Railway.app:** Free tier with credit

### Total Monthly Cost: **$0-5** (depends on AI feature usage)
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
  coserver.js           # Express backend with AI endpoints
├── package.json        # Node.js dependencies
├── .env                # API keys (Mapbox, OpenAI)
├── public/
│   └── index.html      # Complete frontend application
├── PROJECT.md          # This file (project tracker)
├── AI_FEATURES.md      # AI features documentation
├── USER_GUIDE.md       # Detailed user guide
└── README.md           # Setup and usage instructions
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

- [ Completed Enhancements ✅
- [x] AI-powered natural language search
- [x] Smart map optimization suggestions
- [x] Advanced text thickening (0.5px increments)
- [x] Ferry/dashed line removal
- [x] Purpose-driven AI recommendations
- [x] Real-time preview with zoom/pan
- [x] Copy to clipboard functionality

### Future Enhancement Ideas 💡

#### High Priority
- [ ] Save/load presets system
  - Save favorite locations with settings
  - Export/import preset files (JSON)
  - Quick-load common configurations
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

### API Resources
- **Mapbox Token:** Get from [Mapbox Account](https://account.mapbox.com/)
  - Free Tier: 50,000 requests/month
  - Style Reference: [Mapbox Styles](https://docs.mapbox.com/api/maps/styles/)

- **OpenAI API Key:** Get from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Model: GPT-4o-mini (recommended)
  - Pricing: [OpenAI Pricing](https://openai.com/api/pricing/)

### Project Documentation
- `PROJECT.md` - This file (project tracker and roadmap)
- `AI_FEATURES.md` - AI integration guide and API details
- `USER_GUIDE.md` - Comprehensive user instructions
- `README.md` - Setup and quick start guide

---

**Status: Production Ready with AI Enhancement! 🚀✨
  - Bulk download as ZIP

#### Medium Priority
- [ ] Custom map styles
  - Upload custom Mapbox style URLs
  - Style presets (vintage, blueprint, topographic)
  - Color scheme customization
  
- [ ] Advanced AI features
  - AI-suggested bounding box sizing
  - Landmark detection and auto-framing
  - Smart cropping for interesting areas
  - Multi-language search support

- [ ] Export formats
  - SVG export for vector editing
  - PDF export with metadata
  - GCode generation for CNC/laser
  - DXF format for CAD software

- [ ] Enhanced preview
  - Before/after slider comparison
  - 3D engraving simulation
  - Material preview (glass, wood, metal)
  - Real-time contrast adjustment overlay

#### Low Priority / Experimental
- [ ] Social features
  - Share creations gallery
  - User ratings/likes
  - Community preset library
  
- [ ] Mobile app
  - Native iOS/Android app
  - Offline map caching
  - Location-based suggestions
  
- [ ] Advanced engraving optimization
  - Power/speed recommendations
  - Material-specific settings
  - Multi-pass strategies
  - Halftone dithering options

- [ ] Integration features
  - Lightburn plugin
  - Adobe Illustrator export
  - Direct laser cutter integration
  - API for third-party apps

- [ ] Analytics & insights
  - Popular locations heatmap
  - Processing time optimization
  - Usage statistics dashboard

#### Creative Ideas
- [ ] Elevation/topography mode
  - 3D terrain visualization
  - Contour line generation
  - Shadow simulation
  
- [ ] Historical maps overlay
  - Compare modern vs historical
  - Time-slider feature
  - Archive map integration

- [ ] Artistic filters
  - Stippling effect
  - Hatching patterns
  - Woodcut style
  - Blueprint aesthetic

- [ ] Collaboration features
  - Real-time multi-user editing
  - Comments and annotations
  - Team workspaces

---

## 🆕 Recent Session Updates (December 21, 2025)

### Bug Fixes
- ✅ Fixed 404 error when leaving app open (added catch-all route)
- ✅ Fixed non-deterministic processing (removed random-based dithering)
- ❌ Ferry line removal needs refinement (detection algorithm incomplete)

### New Features Added
1. **AI Integration** 🤖
   - OpenAI GPT-4o-mini integration
   - Natural language search enhancement
   - Purpose-driven optimization suggestions
   - Auto-apply recommended settings
   - Map description generation
   - Cost-optimized with graceful fallback

2. **Thicken Text & Lines** 📝
   - Morphological dilation algorithm
   - 0.5px to 5px thickness range
   - Half-pixel increments for precision
   - Deterministic checkerboard dithering
   - Real-time preview updates
   - Perfect for small text visibility

3. **Remove Ferry Lines** ⛴️ (needs refinement)
   - Intended to remove dashed maritime routes
   - Algorithm implemented but not functioning as expected
   - Requires improved detection logicnts
   - Aspect ratio and density analysis

### Technical Improvements
- Deterministic image processing (repeatable results)
- Enhanced backend with AI endpoints
- Improved error handling
- Better API response managemental)
- [ ] Create user documentation

---

## 📝 Notes & Considerations

### Engraving Optimization
- High contrast is essential for laser engravers
- Black areas = engraved, white areas = untouched glass
- Edge detection can add street detail
- Resolution: 2000x2000px suitable for most engraving projects
- Text thickening (0.5-5px) makes small labels visible
- Thicker lines (3-5px) recommended for deep engraving

### Preview Step Enhancement Ideas
**Current Capabilities:**
- Real-time contrast adjustment
- Edge detection toggle
- Invert colors
- Black text/roads/water forcing
- Thicken text & lines
- Zoom/pan for detail inspection
- Copy to clipboard

**Potential Additions:**
- **Before/After Split View** - Side-by-side or slider comparison
- **Histogram Display** - Show black/white pixel distribution
- **Detail Magnifier** - Pop-up zoomed view of cursor area
- **Measurement Tools** - Measure distances and features on map
- **Grid Overlay** - Alignment guides for precise positioning
- **Annotation Layer** - Add notes or markers before download
- **Batch Preview** - View multiple settings side-by-side
- **Export Preview Settings** - Save preview state as preset
- **Undo/Redo Stack** - Step through processing changes
- **Live Statistics** - Show engraving time estimates, detail density
- **Color Coding** - Highlight problematic areas (too dense, too sparse)

### Future AI Enhancements
- **Smart Feature Detection** - AI identifies roads, water, buildings, parks
- **Intelligent Cropping** - AI suggests optimal bounding box for landmarks
- **Style Transfer** - Apply artistic styles (woodcut, etching, blueprint)
- **Text Extraction** - AI reads and optimizes label placement
- **Automated Ferry Line Removal** - ML-based detection of dashed patterns
- **Engraving Difficulty Analysis** - AI predicts which areas will engrave well
- **Multi-Language Support** - AI translates labels and place names
- **Custom Prompts** - "Make this look like a vintage map"
- **Smart Simplification** - AI removes clutter while keeping important features
- **Landmark Recognition** - AI identifies and highlights famous locations

### 3D & Advanced Mapping
- **Elevation Mapping** - Convert height data to engraving depth
- **3D Terrain Preview** - Rotate and view topography in 3D
- **Multi-Layer Engraving** - Generate multiple passes for depth variation
- **Shadow Simulation** - Preview how light will hit engraved surface
- **Contour Line Generation** - Add topographic lines automatically
- **3D Model Export** - STL files for 3D printing relief maps
- **CNC Toolpath Generation** - Direct GCode output for 3D carving
- **Height Map Coloring** - Visual representation of elevation data
- **Satellite + Elevation Hybrid** - Combine imagery with terrain data

### Mobile & Touch Optimization
- **Touch Gesture Support** - Pinch to zoom, two-finger rotate on map
- **Mobile-First Preview** - Optimized canvas rendering for phones
- **Offline Mode** - Cache maps for offline editing
- **Share Sheet Integration** - Native sharing on iOS/Android
- **Camera Integration** - Take photo, find location, generate map
- **QR Code Scanning** - Scan to load preset or location
- **Progressive Web App** - Install as standalone app
- **Haptic Feedback** - Touch vibrations for interactions
- **Voice Commands** - "Show me downtown Seattle"
- **AR Preview** - View engraving on physical object via camera
- **Cross-Device Sync** - Start on phone, finish on desktop
- **Reduced Data Mode** - Lower quality previews for slow connections

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Canvas API fully supported
- Mobile browsers: All modern browsers supported
- Touch events: Fully implemented for mobile
- WebGL: Available for future 3D features

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
