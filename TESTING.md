# MapIt Testing Guide

Comprehensive testing phases to validate all functionality before launch.

---

## Pre-Testing Setup

- [ ] Server running: `npm run dev` or `npm start`
- [ ] Browser console open (F12 → Console tab)
- [ ] Clear localStorage: `localStorage.clear()` in console
- [ ] Fresh browser session (or hard refresh with Ctrl+Shift+R)

---

## Phase 1: Map Generation & Navigation

### Test 1.1: Map Search & Selection
- [ ] Open http://localhost:3000
- [ ] Search for a location (e.g., "New York")
- [ ] Verify map appears with Leaflet controls
- [ ] Pan around the map
- [ ] Zoom in/out
- [ ] Adjust bounding box (if available)

### Test 1.2: Map Style Selection
- [ ] Select "Streets" style (default)
- [ ] Verify preview updates
- [ ] Try other styles if available

### Test 1.3: Map Generation
- [ ] Click "Generate Map" button
- [ ] Verify loading overlay appears
- [ ] Check console for API calls
- [ ] Wait for processing to complete
- [ ] Verify navigation to `/editor.html`
- [ ] Console should show: "Processing complete!" and navigation

**Expected Result**: Automatically navigates to editor page with processed image

**Known Issues**:
- If editor doesn't open: Check console for localStorage errors
- If image blank: Check threshold value in console logs

---

## Phase 2: Editor Page Load

### Test 2.1: Initial Load
- [ ] Editor page loads successfully
- [ ] Image appears in canvas area
- [ ] Console shows: "loadImageFromStorage called"
- [ ] Console shows: "Image loaded successfully! [width] x [height]"
- [ ] No errors in console

### Test 2.2: UI Elements Present
- [ ] Menu bar visible (File, Edit, View, Image, AI, Help)
- [ ] Canvas area centered with image
- [ ] Zoom controls overlay (+ - Fit buttons)
- [ ] Right toolbar visible with sections:
  - [ ] 🎨 Tools (expanded by default)
  - [ ] ✨ Advanced (expanded by default)
  - [ ] 🤖 AI Suggestions
  - [ ] 📋 Properties
- [ ] Status bar at bottom showing "Ready"
- [ ] Image dimensions displayed in Properties

### Test 2.3: Initial Image Quality
- [ ] Text labels visible and readable
- [ ] Roads visible (if threshold 248 applied)
- [ ] Coastlines visible
- [ ] No ferry dashed lines (they should be removed)
- [ ] Image is black & white (threshold applied)

**Expected Result**: Clean map with text, roads, coastlines visible

**Known Issues**:
- If roads missing: Check threshold - should be ~248 for streets-v12
- If everything black: Threshold too low
- If only text visible: Initial processing threshold issue

---

## Phase 3: Tools Section Controls

### Test 3.1: Contrast Threshold Slider
- [ ] **Initial Value**: 248 (displayed in both slider and number input)
- [ ] Drag slider left (decrease to ~200)
  - [ ] Preview updates immediately
  - [ ] More elements become white
  - [ ] Console shows: "Processing..."
- [ ] Drag slider right (increase to ~250)
  - [ ] Preview updates immediately
  - [ ] More elements become black
- [ ] Type value in number input (e.g., 245)
  - [ ] Slider position updates
  - [ ] Preview updates
- [ ] Test extreme values:
  - [ ] 0: Everything black
  - [ ] 255: Everything white

**Expected Result**: Live preview updates as slider moves

**Known Issues**:
- If no update: Check console for errors
- If delayed: Processing might be slow on large images

### Test 3.2: Edge Detection
- [ ] Check "Edge Detection" checkbox
  - [ ] Preview updates showing edge-detected version
  - [ ] Sobel algorithm applied (console: "Applying edge detection...")
  - [ ] Image shows outlines/edges only
- [ ] Uncheck "Edge Detection"
  - [ ] Preview returns to normal threshold mode

**Expected Result**: Toggle between normal and edge-detected views

### Test 3.3: Invert Colors
- [ ] Check "Invert Colors" checkbox
  - [ ] Preview inverts: black→white, white→black
  - [ ] Text becomes white on black background
- [ ] Uncheck "Invert Colors"
  - [ ] Preview returns to normal

**Expected Result**: Color inversion works instantly

### Test 3.4: Laser Mode
- [ ] Check "Laser Mode" checkbox
  - [ ] Preview shows aggressive threshold (pure black/white)
  - [ ] Console: "Laser mode: converting to pure black roads/text..."
  - [ ] Road lines more defined
- [ ] Uncheck "Laser Mode"
  - [ ] Returns to normal processing

**Expected Result**: High-contrast laser engraving mode

---

## Phase 4: Advanced Section Controls

### Test 4.1: Thicken Text & Lines
- [ ] Check "Thicken Text & Lines" checkbox
  - [ ] Amount slider/input appears (default: 2)
  - [ ] Preview shows thicker lines and text
  - [ ] Console: "Applying dilation..."
- [ ] Adjust amount slider (0.5 to 5)
  - [ ] Preview updates with different thickness
  - [ ] Higher values = thicker lines
- [ ] Uncheck "Thicken Text & Lines"
  - [ ] Amount controls hide
  - [ ] Preview returns to normal thickness

**Expected Result**: Morphological dilation thickens all black elements

### Test 4.2: Black Text with Box
- [ ] Check "Black Text with Box" checkbox
  - [ ] Console: "Applying black text with white box outline"
  - [ ] Text labels get white 3px border/halo
  - [ ] Text stands out against background
- [ ] Uncheck
  - [ ] White boxes disappear

**Expected Result**: Text gets white outline for readability

**Known Issues to Debug**:
- If nothing happens: Check console for errors
- May need to work independently or with invert mode

### Test 4.3: Black Roads
- [ ] Check "Black Roads" checkbox
  - [ ] Roads forced to pure black
  - [ ] Only works with Laser Mode + Invert (check both first)
  - [ ] Console: "Forcing roads to solid black"
- [ ] Uncheck
  - [ ] Roads return to normal processing

**Expected Result**: Roads guaranteed to be solid black

### Test 4.4: White Water
- [ ] Check "White Water" checkbox
  - [ ] Water areas forced to white
  - [ ] Only works with Laser Mode + Invert
  - [ ] Console: "Forcing water to white"
- [ ] Uncheck
  - [ ] Water returns to normal

**Expected Result**: Water areas pure white

### Test 4.5: Thicken Coastlines
- [ ] Check "Thicken Coastlines" checkbox
  - [ ] Amount slider appears (default: 2)
  - [ ] Console: "Thickening coastlines with amount: 2"
  - [ ] Coastal boundaries become more prominent
- [ ] Adjust amount (1-5)
  - [ ] Preview updates with different thickness
- [ ] Uncheck
  - [ ] Controls hide
  - [ ] Coastlines return to normal

**Expected Result**: Water boundaries enhanced and thickened

---

## Phase 5: Zoom & Navigation Controls

### Test 5.1: Zoom Buttons (Overlay)
- [ ] Click "+" button
  - [ ] Image zooms in (canvas scales up)
  - [ ] Status bar updates: "110%", "120%", etc.
- [ ] Click "−" button
  - [ ] Image zooms out
  - [ ] Status bar updates: "90%", "80%", etc.
- [ ] Click "Fit" button
  - [ ] Image resets to 100% (fit to canvas)
  - [ ] Status bar: "100%"

### Test 5.2: Keyboard Shortcuts
- [ ] Press `+` or `=` key
  - [ ] Zooms in by 10%
- [ ] Press `−` key
  - [ ] Zooms out by 10%
- [ ] Press `0` key
  - [ ] Resets to 100%
- [ ] Press `Ctrl+S` (or `Cmd+S` on Mac)
  - [ ] Downloads image (saveImage() called)

**Expected Result**: Keyboard shortcuts work as expected

---

## Phase 6: Menu Bar Actions

### Test 6.1: File Menu
- [ ] Click "File" menu
  - [ ] Dropdown appears
- [ ] Click "Save Image"
  - [ ] PNG downloads with filename: `mapit-[location]-[timestamp].png`
  - [ ] Check Downloads folder
- [ ] Click "Copy to Clipboard"
  - [ ] Console: "Copied to clipboard" or similar
  - [ ] Paste into image editor to verify

### Test 6.2: Back to Map
- [ ] Click "Back to Map" button (if available) OR
- [ ] Navigate back to http://localhost:3000
  - [ ] Returns to map selection page
  - [ ] Can generate new map

**Expected Result**: Navigation works both directions

---

## Phase 7: AI Suggestions (Future)

### Test 7.1: Get Suggestions Button
- [ ] Click "Get Suggestions" button
- [ ] Loading state appears
- [ ] AI suggestions appear in panel
- [ ] Can apply suggestions

**Status**: Not yet implemented - placeholder UI only

---

## Phase 8: Image Export & Quality

### Test 8.1: Download Image
- [ ] Adjust controls to desired settings
- [ ] Click "Save Image" or press Ctrl+S
- [ ] Check downloaded PNG file:
  - [ ] Opens correctly in image viewer
  - [ ] Dimensions match original (e.g., 2560×852)
  - [ ] Quality good (no compression artifacts)
  - [ ] Processing applied correctly

### Test 8.2: Copy to Clipboard
- [ ] Process image with settings
- [ ] Click "Copy to Clipboard"
- [ ] Open image editor (Paint, Photoshop, etc.)
- [ ] Paste (Ctrl+V)
- [ ] Verify image appears correctly

**Expected Result**: Export maintains quality and processing

---

## Phase 9: Edge Cases & Stress Tests

### Test 9.1: Rapid Control Changes
- [ ] Rapidly toggle checkboxes on/off
  - [ ] No crashes
  - [ ] Preview keeps up (or queues properly)
  - [ ] No console errors

### Test 9.2: Extreme Settings
- [ ] Set threshold to 0
  - [ ] All black (or nearly all)
- [ ] Set threshold to 255
  - [ ] All white (or nearly all)
- [ ] Enable ALL controls at once
  - [ ] Processing completes
  - [ ] No conflicts

### Test 9.3: Multiple Maps
- [ ] Generate map 1 → edit → back
- [ ] Generate map 2 → edit
  - [ ] Correct image loads
  - [ ] localStorage updated properly
- [ ] Generate map 3 → edit
  - [ ] Still works

### Test 9.4: Large Images
- [ ] Generate large area map (4096px width)
  - [ ] Loads successfully
  - [ ] Processing not too slow
  - [ ] Controls responsive

**Expected Result**: App handles edge cases gracefully

---

## Phase 10: Browser Compatibility

### Test 10.1: Chrome/Edge
- [ ] All features work
- [ ] Performance acceptable
- [ ] No console errors

### Test 10.2: Firefox
- [ ] All features work
- [ ] Module imports work
- [ ] Canvas API works

### Test 10.3: Safari (if available)
- [ ] All features work
- [ ] ES6 modules load
- [ ] No webkit-specific issues

**Expected Result**: Works in all modern browsers

---

## Phase 11: Mobile Responsive (Future)

### Test 11.1: Mobile Browser
- [ ] Open on phone/tablet
- [ ] UI adapts to small screen
- [ ] Controls usable
- [ ] Touch gestures work

**Status**: Desktop-first, mobile optimization pending

---

## Phase 12: Performance & Console

### Test 12.1: Console Health Check
- [ ] Open console (F12)
- [ ] Generate map → edit → adjust controls
- [ ] Review console for:
  - [ ] No red errors (except expected)
  - [ ] Processing logs present
  - [ ] No memory leaks warnings
  - [ ] Module loading successful

### Test 12.2: Network Tab
- [ ] Open Network tab (F12)
- [ ] Generate map
- [ ] Verify API calls:
  - [ ] `/api/mapbox/static` returns 200
  - [ ] Image size reasonable
  - [ ] No failed requests

**Expected Result**: Clean console, successful API calls

---

## Pre-Launch Checklist

### Critical Bugs Fixed
- [ ] Roads visible (threshold 248)
- [ ] Coastlines visible
- [ ] Text visible
- [ ] All controls update preview in real-time
- [ ] Black Text with Box works
- [ ] Thicken Coastlines works
- [ ] Image downloads correctly
- [ ] Copy to clipboard works
- [ ] Navigation works (index → editor → index)

### Features Working
- [ ] Map search & selection
- [ ] Map generation with Mapbox API
- [ ] Editor loads with image
- [ ] All Tools section controls functional
- [ ] All Advanced section controls functional
- [ ] Zoom controls work
- [ ] Keyboard shortcuts work
- [ ] Menu bar actions work
- [ ] Image export (download & clipboard)

### Performance
- [ ] Processing completes in <3 seconds for typical image
- [ ] No lag when adjusting sliders
- [ ] No browser crashes or freezes
- [ ] Memory usage acceptable

### Documentation
- [ ] README.md up to date
- [ ] USER_GUIDE.md covers all features
- [ ] PROJECT.md reflects current state
- [ ] AI_FEATURES.md accurate
- [ ] TESTING.md (this file) complete

### Deployment Ready
- [ ] Environment variables set (.env file)
- [ ] Vercel configuration correct (vercel.json)
- [ ] Build succeeds locally
- [ ] No console errors on production build
- [ ] API keys secured

---

## Known Issues Log

### Current Issues
1. **Black Text with Box not working** - Added separate logic for non-inverted mode (testing needed)
2. **Controls may not update preview** - Need to verify event listeners wired correctly
3. **Ferry lines removal** - May not be working (test with coastal areas)

### Fixed Issues
1. ~~Roads disappearing~~ - Fixed: Threshold increased to 248
2. ~~Module loading errors~~ - Fixed: Added `type="module"` to script tags
3. ~~Canvas processing return type~~ - Fixed: Returns ImageData directly

---

## Testing Notes & Observations

### Session 1: [Date/Time]
**Tester**: 
**Environment**: 
**Results**:
- 

### Session 2: [Date/Time]
**Tester**: 
**Environment**: 
**Results**:
- 

---

## Debug Commands

### Clear localStorage
```javascript
localStorage.clear();
```

### Check stored data
```javascript
console.log('Image data length:', localStorage.getItem('mapitImageData')?.length);
console.log('Metadata:', JSON.parse(localStorage.getItem('mapitMetadata')));
```

### Force reload image
```javascript
location.reload();
```

### Check canvas context
```javascript
const canvas = document.getElementById('previewCanvas');
console.log('Canvas:', canvas.width, 'x', canvas.height);
console.log('Context:', canvas.getContext('2d'));
```

---

## Success Criteria

### Minimum Viable Product (MVP)
- [x] Map generation works
- [ ] Editor loads successfully
- [ ] Threshold slider adjusts contrast
- [ ] Image can be downloaded
- [ ] Roads and text visible

### Full Feature Set
- [ ] All Tools controls work
- [ ] All Advanced controls work
- [ ] Zoom and navigation smooth
- [ ] Keyboard shortcuts functional
- [ ] Export options work (download + clipboard)
- [ ] No critical console errors

### Production Ready
- [ ] All MVP + Full Feature Set complete
- [ ] Performance acceptable on typical hardware
- [ ] Works in Chrome, Firefox, Safari
- [ ] Documentation complete
- [ ] Deployed successfully to Vercel
- [ ] API keys secured
- [ ] No security vulnerabilities

---

**Last Updated**: Phase 14 Implementation (December 21, 2025)
**Next Review**: After fixing current control issues
