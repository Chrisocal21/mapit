# mapit - User Guide

## What is mapit?

**mapit** is a web-based tool for creating laser engraving-ready map images. Generate high-contrast, customizable map images optimized for engraving on glass, wood, metal, and other materials.

### Key Capabilities
- Search and select any location worldwide
- Draw precise bounding boxes with rotation support
- Specialized processing for laser engraving with black/white output
- Fine-tune text visibility, road rendering, and water features
- Real-time preview with adjustable parameters
- Export up to 2560×2560px high-resolution images

---

## Quick Start Guide

### Step 1: Find Your Location

**Using Search:**
- Type an address, city, or landmark in the search bar
- Select a result from the dropdown to navigate to that location
- Search supports full text input including spaces

**Manual Navigation:**
- Click and drag to pan the map
- Use mouse wheel or map controls to zoom
- Click any location to re-center the view

### Step 2: Define Your Selection Area

The blue rectangle indicates the area that will be captured.

**Adjusting Selection:**
- Hold SPACEBAR to enable selection mode
- While holding SPACEBAR: drag to move, scroll to rotate
- Release SPACEBAR to return to map navigation

**Locking Selection (Optional):**
- Tools menu > Lock Shape: Prevents accidental resizing
- Tools menu > Lock Zoom: Maintains dimensions when zooming

### Step 3: Configure Settings

Open the Settings dropdown menu:
- Style: Choose base map style (Streets, Light, Dark, Outdoors)
- Size: Set output resolution (800px to 2560px)
- Aspect Ratio: Select dimensions (1:1, 4:3, 16:9, etc.)
- Contrast: Adjust black/white separation threshold (0-255)

### Step 4: Apply Effects (Optional)

Open the Effects dropdown menu:
- Laser: Enable laser engraving mode with optimized black/white processing
- Edge Detection: Emphasize edges and boundaries
- Invert Colors: Swap black and white areas
- Warp: Apply envelope warp effect (-1% to -4%)

### Step 5: Generate Your Image

1. Click Generate (blue button on the right)
2. Wait for processing to complete
3. Preview and Download buttons will become active

### Step 6: Fine-Tune in Preview

**Zoom and Pan:**
- Use +/- buttons or Reset to adjust view
- Click and drag to pan around the image

**Adjust Processing in Real-Time:**
- Contrast Threshold slider: See instant changes as you adjust
- Black Text toggles: Enhance text visibility
- Black Roads toggle: Force roads to solid black
- White Water toggle: Force water features to white

**Actions:**
- Download PNG: Save to your computer
- Copy Image: Copy directly to clipboard
- Regenerate: Generate new image with current settings

---

## Complete Features Overview

### Map Navigation
| Action | Method |
|--------|--------|
| Pan map | Click and drag (when spacebar is NOT pressed) |
| Zoom in/out | Mouse wheel or map zoom controls |
| Re-center | Click any location on the map |
| Search location | Type in search bar at top |

### Selection Controls
| Action | Method |
|--------|--------|
| Move selection | Hold SPACEBAR + drag the blue box |
| Rotate selection | Hold SPACEBAR + mouse wheel |
| Lock shape | Tools menu → 🔒 Lock Shape |
| Lock zoom | Tools menu → 📏 Lock Zoom |
| Clear selection | Tools menu → 🗑️ Clear Selection |
| Set exact dimensions | Tools menu → Enter Width/Height + Set Dimensions |

### Settings Menu
**Map Style Options:**
- Streets (default): Standard map with roads, labels, and features
- Light: Minimalist light background
- Dark: Dark mode style
- Outdoors: Terrain and natural features emphasized

**Output Size:**
- 800px - 2560px (higher = more detail for engraving)
- Recommended: 2000px for most engraving projects

**Aspect Ratio:**
- 1:1 (Square) - Perfect for coasters, tiles
- 4:3, 3:2, 16:9 - Landscape formats
- 3:4, 2:3, 1:2 - Portrait formats

**Contrast Threshold:**
- Range: 0-255
- Lower values: More areas become black
- Higher values: More areas stay white
- Default: 215 (good starting point for laser engraving)

### Effects Menu
**Laser Mode** (Recommended for Engraving):
- Converts map to pure black and white
- Optimized for laser engraving applications
- Works best with "Streets" style
- See Preview settings for advanced laser controls

**Edge Detection:**
- Emphasizes boundaries and edges
- Creates line-art style output
- Good for architectural details

**Invert Colors:**
- Swaps black and white areas
- Useful for different engraving techniques

**Envelope Warp:**
- Adds perspective distortion
- Cycles through: Off → -1% → -2% → -3% → -4%

### Tools Menu
**Selection Controls:**
- 🔒 Lock Shape: Prevents accidental resizing of selection
- 📏 Lock Zoom: Maintains dimensions when zooming map
- 🗑️ Clear Selection: Resets to default selection at current view

**Dimension Controls:**
- Set precise Width and Height
- Choose units: inches, mm, cm, meters, km, feet, miles
- Click "Set Dimensions" to apply

### Preview Modal
**Zoom Controls:**
- **+** button: Zoom in
- **-** button: Zoom out  
- **Reset** button: Fit to window
- **Click and drag**: Pan around zoomed image

**Real-Time Processing:**
- **Contrast Threshold Slider**: Adjust and see changes instantly
- **Edge Detection**: Toggle on/off with live preview
- **Laser Mode Enhancements** (when Laser mode is active):
  - ☐ Black Text (simple): Forces text to black
  - ☐ Black Text with White Box: Adds white padding around text for visibility
  - ☐ Black Roads: Forces all roads to solid black
  - ☐ White Water: Forces water features to white

**Action Buttons:**
- **📥 Download PNG**: Save high-resolution image
- **📋 Copy Image**: Copy to clipboard (paste into any app)
- **🔄 Regenerate**: Generate new image with updated settings

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **SPACEBAR** (hold) | Enable selection manipulation mode |
| SPACEBAR + Drag | Move the bounding box |
| SPACEBAR + Scroll | Rotate the selection |

**Note:** Keyboard shortcuts are automatically disabled when typing in input fields.

---

## Best Practices

### For Laser Engraving:
1. **Always use Laser Mode** - Provides optimal black/white separation
2. **Start with Streets style** - Best detail for laser engraving
3. **Use 2000px or higher** - Ensures crisp, detailed engravings
4. **Enable "Black Text with White Box"** - Makes labels clearly visible
5. **Adjust contrast threshold** - Lower values (180-200) capture more detail
6. **Lock your selection** - Prevents accidental changes before generating

### For Best Results:
1. **Zoom in close** for detailed street-level engravings
2. **Use landscape ratios** for wide area coverage
3. **Enable Black Roads** for emphasis on street networks
4. **Preview before downloading** - Adjust settings in real-time
5. **Use Copy Image** for quick transfer to design software

### Workflow Recommendations:
**Detailed Street Map:**
- Style: Streets
- Size: 2560px
- Laser Mode: ON
- Black Text with White Box: ON
- Black Roads: ON
- Contrast: 200

**Minimalist Design:**
- Style: Light
- Size: 2000px
- Laser Mode: ON
- Black Roads: ON
- White Water: ON
- Contrast: 220

**Coastline/Water Focus:**
- Style: Outdoors
- Size: 2000px
- Laser Mode: ON
- White Water: ON
- Contrast: 210

---

## Common Use Cases

### 1. Custom City Map Coaster
- **Size**: 2000px, 1:1 ratio
- **Settings**: Laser Mode, Black Text with Box, Black Roads
- **Area**: Downtown area, 1-2 mile radius

### 2. Large Wall Art
- **Size**: 2560px, 16:9 ratio
- **Settings**: Laser Mode, Edge Detection OFF, White Water ON
- **Area**: Entire city or region

### 3. Address Marker
- **Size**: 1280px, 3:2 ratio
- **Settings**: Laser Mode, Black Text with Box ON, zoom to street level
- **Area**: Few blocks around specific address

### 4. Coastline Artwork
- **Size**: 2560px, 2:1 ratio
- **Settings**: Laser Mode, White Water ON, Outdoors style
- **Area**: Coastal region showing water boundaries

### 5. Gift Location Marker
- **Size**: 2000px, 1:1 ratio
- **Settings**: Laser Mode, all enhancements ON
- **Area**: Special location (proposal spot, first home, etc.)

---

## Technical Details

### Laser Mode Processing
When Laser Mode is enabled, the image goes through specialized processing:
1. **Grayscale Conversion**: Colors converted to grayscale values
2. **Threshold Detection**: Separates image into black/white regions
3. **Feature Detection**: Identifies text, roads, and water separately
4. **Selective Enhancement**: Applies user-selected enhancements
5. **Output**: Pure black and white PNG optimized for engraving

### Detection Thresholds
- **Text Detection**: Gray values < 200 (catches labels and text)
- **Road Detection**: Gray values between 200-245 (street networks)
- **Water Detection**: Gray values > 240 (bodies of water)
- **White Box Padding**: 3-pixel dilation in all directions

### Resolution Guidelines
| Size | Best For | File Size |
|------|----------|-----------|
| 800px | Testing/previews | ~200KB |
| 1280px | Small items (< 4") | ~500KB |
| 2000px | Medium items (4-8") | ~1MB |
| 2560px | Large items (> 8") | ~2MB |

### Supported Map Styles
- **streets-v12**: Street-level detail, labels, POIs
- **light-v11**: Minimal design, light background
- **dark-v11**: Dark theme, high contrast
- **outdoors-v12**: Topography, hiking trails, terrain

---

## Troubleshooting

### "Can't type spaces in search bar"
- Make sure you click inside the search input first
- Spacebar is disabled when focus is outside input fields

### "Selection keeps moving when I scroll"
- Release the SPACEBAR key before scrolling the map
- Spacebar enables selection manipulation mode

### "Text is hard to see in laser output"
- Enable "Black Text with White Box" in Preview
- Lower the contrast threshold to 180-200
- Zoom in closer to get larger text

### "Water appears black instead of white"
- Enable "White Water" toggle in Preview
- Make sure Laser Mode is enabled
- Adjust contrast threshold above 215

### "Downloaded image is blank"
- Click Generate first before downloading
- Check that the selection area isn't too large
- Try reducing output size to 2000px

### "Copy to Clipboard doesn't work"
- Some browsers don't support clipboard API
- Use Download button instead
- Try using Chrome or Edge for best compatibility

### "Generation takes too long"
- Large areas take longer to process
- Reduce output size temporarily for testing
- Smaller selections process faster

---

## Advanced Techniques

### Creating Layered Engravings
1. Generate with **Laser + Black Roads** only → Save as Layer 1
2. Generate with **Laser + Black Text** only → Save as Layer 2
3. Combine in image editor for multi-depth engraving

### Perfect Text Visibility
1. Start with default settings in Laser Mode
2. Open Preview and adjust contrast slider until text appears
3. Enable "Black Text with White Box"
4. Fine-tune threshold (typically 190-210)

### Matching Physical Dimensions
1. Measure your engraving surface
2. Use Tools → Dimensions to set exact size
3. Choose matching aspect ratio
4. Lock selection to prevent changes

### Creating Templates
1. Set up your preferred settings
2. Lock shape and zoom
3. Use search to find different locations
4. Generate quickly with consistent settings

---

## File Formats & Compatibility

### Output Format
- Format: PNG (Portable Network Graphics)
- Color Space: Grayscale or Binary (Laser Mode)
- Bit Depth: 8-bit per channel
- Transparency: None (opaque white background)

### Compatible With
- All laser engraving software (LightBurn, RDWorks, LaserGRBL, etc.)
- Image editors (Photoshop, GIMP, etc.)
- Design software (Illustrator, Inkscape, CorelDRAW)
- Direct printing to laser engravers
- CNC machines and vinyl cutters (after conversion)

---

## Learning Resources

### Understanding Map Projections
- mapit uses Web Mercator projection (standard for web maps)
- Distortion increases near poles (minimal for most use cases)
- Best accuracy for locations between 60°N and 60°S

### Laser Engraving Basics
- **Black areas** = Engraved (laser burns material)
- **White areas** = Untouched (no engraving)
- Higher contrast = clearer engraving
- Test settings on scrap material first

### Map Data Attribution
- Maps powered by Mapbox and OpenStreetMap
- Data © OpenStreetMap contributors
- Please credit if sharing publicly

---

## Tips for Sharing Your Work

When posting your engraved maps:
1. Credit: "Map generated with mapit"
2. Include location name
3. Share your settings for others to recreate
4. Tag laser engraving communities
5. Show before/after (digital preview vs. physical engraving)

---

## Version & Updates

**Current Version**: 1.0 (Production Ready)  
**Last Updated**: December 21, 2025

**Recent Features**:
- Dropdown menu system for cleaner UI
- Copy to clipboard functionality
- Regenerate from preview
- Clear selection tool
- Real-time preview adjustments
- Advanced laser mode controls

---

## Need Help?

If you encounter issues or have questions:
1. Review this guide thoroughly
2. Check the Troubleshooting section
3. Verify your internet connection (required for map data)
4. Try different browsers (Chrome/Edge recommended)
5. Reduce complexity (smaller area, lower resolution) for testing
