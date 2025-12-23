import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'
import { generateMapImage, searchLocation } from '../utils/api'
import './MapSelectionPage.css'

function MapSelectionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [bounds, setBounds] = useState(null)
  const [mapStyle, setMapStyle] = useState('streets-v12')
  const [imageSize, setImageSize] = useState('2000')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [customRatio, setCustomRatio] = useState('')
  const [dimensionMode, setDimensionMode] = useState('preset') // 'preset' or 'custom'
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [dimensionUnit, setDimensionUnit] = useState('px') // 'px', 'in', 'cm', 'mm'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Calculate dimensions and info based on aspect ratio or custom dimensions
  const dimensionInfo = useMemo(() => {
    let width, height, useCase, printSize
    const DPI = 300 // Standard print DPI
    
    // Custom dimensions mode
    if (dimensionMode === 'custom' && customWidth && customHeight) {
      const w = parseFloat(customWidth)
      const h = parseFloat(customHeight)
      
      if (dimensionUnit === 'px') {
        width = Math.round(w)
        height = Math.round(h)
      } else if (dimensionUnit === 'in') {
        width = Math.round(w * DPI)
        height = Math.round(h * DPI)
      } else if (dimensionUnit === 'cm') {
        width = Math.round((w / 2.54) * DPI)
        height = Math.round((h / 2.54) * DPI)
      } else if (dimensionUnit === 'mm') {
        width = Math.round((w / 25.4) * DPI)
        height = Math.round((h / 25.4) * DPI)
      }
      
      useCase = 'Custom dimensions'
      printSize = `${w}${dimensionUnit} × ${h}${dimensionUnit}`
      
    } else if (aspectRatio === 'custom' && customRatio) {
      // Parse custom ratio like "5:3"
      const parts = customRatio.split(':').map(p => parseFloat(p.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const size = parseInt(imageSize)
        width = size
        height = Math.round(size * parts[1] / parts[0])
        useCase = `Custom ${customRatio} ratio`
        printSize = 'Varies'
      } else {
        width = height = parseInt(imageSize)
        useCase = 'Invalid custom ratio'
        printSize = 'N/A'
      }
      
    } else {
      // Preset ratios
      const size = parseInt(imageSize)
      
      if (aspectRatio === '1:1') {
        width = height = size
        useCase = 'Instagram, Profile pics, Album covers'
        printSize = size >= 2000 ? '8"×8" poster' : '4"×4" print'
      } else if (aspectRatio === '16:9') {
        width = size
        height = Math.round(size * 9 / 16)
        useCase = 'HD Video, Presentations, Monitors'
        printSize = size >= 2000 ? '24"×13.5" banner' : '8"×4.5" photo'
      } else if (aspectRatio === '21:9') {
        width = size
        height = Math.round(size * 9 / 21)
        useCase = 'Ultrawide monitors, Cinema'
        printSize = size >= 2000 ? '28"×12" panoramic' : '12"×5" print'
      } else if (aspectRatio === '4:3') {
        width = size
        height = Math.round(size * 3 / 4)
        useCase = 'Standard displays, Presentations'
        printSize = size >= 2000 ? '20"×15" poster' : '8"×6" photo'
      } else if (aspectRatio === '3:2') {
        width = size
        height = Math.round(size * 2 / 3)
        useCase = 'DSLR photos, Photo prints'
        printSize = size >= 2000 ? '18"×12" print' : '6"×4" photo'
      } else if (aspectRatio === '3:1') {
        width = size
        height = Math.round(size / 3)
        useCase = 'Ultra panoramic, Banners'
        printSize = size >= 2000 ? '36"×12" banner' : '15"×5" print'
      } else if (aspectRatio === '2:1') {
        width = size
        height = Math.round(size / 2)
        useCase = 'Panoramic, Banners'
        printSize = size >= 2000 ? '24"×12" panoramic' : '10"×5" print'
      } else if (aspectRatio === '9:16') {
        width = Math.round(size * 9 / 16)
        height = size
        useCase = 'Phone wallpapers, Stories'
        printSize = size >= 2000 ? '13.5"×24" poster' : '4.5"×8" photo'
      } else if (aspectRatio === '4:5') {
        width = Math.round(size * 4 / 5)
        height = size
        useCase = 'Instagram portrait, Mobile'
        printSize = size >= 2000 ? '16"×20" poster' : '4"×5" print'
      } else if (aspectRatio === '3:4') {
        width = Math.round(size * 3 / 4)
        height = size
        useCase = 'Portrait displays, Mobile'
        printSize = size >= 2000 ? '15"×20" poster' : '6"×8" photo'
      }
    }
    
    return { width, height, useCase, printSize }
  }, [imageSize, aspectRatio, customRatio, dimensionMode, customWidth, customHeight, dimensionUnit])

  async function handleSearch(e) {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      console.log('Searching for:', query)
      const results = await searchLocation(query)
      console.log('Search results:', results)
      if (results.length > 0) {
        console.log('First result full:', JSON.stringify(results[0], null, 2))
      }
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      alert(`Search failed: ${error.message}`)
    }
  }

  function handleSelectResult(result) {
    setSelectedLocation(result)
    setSearchResults([])
    setSearchQuery(result.place_name)
  }

  const handleGenerate = async () => {
    if (!bounds) {
      alert('Please select a location on the map')
      return
    }

    setLoading(true)
    
    try {
      // Use calculated dimensions from dimensionInfo
      const width = dimensionInfo.width
      const height = dimensionInfo.height
      
      if (!width || !height || width <= 0 || height <= 0) {
        alert('Invalid dimensions. Please check your settings.')
        setLoading(false)
        return
      }
      
      // Cap at 1280px max for Mapbox API
      let finalWidth = width
      let finalHeight = height
      if (Math.max(width, height) > 1280) {
        const scale = 1280 / Math.max(width, height)
        finalWidth = Math.round(width * scale)
        finalHeight = Math.round(height * scale)
      }
      
      // Generate map image
      const imageUrl = await generateMapImage({
        bounds,
        style: mapStyle,
        width: finalWidth,
        height: finalHeight
      })
      
      // Navigate to editor with image and settings
      navigate('/editor', {
        state: {
          imageUrl,
          mapSettings: {
            style: mapStyle,
            width: finalWidth,
            height: finalHeight,
            aspectRatio,
            location: selectedLocation,
            bounds
          }
        }
      })
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate image: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <div className="header-top">
          <h1>maprdy</h1>

          <div className="search-container">
            <input
              type="text"
              id="searchInput"
              placeholder="Search location..."
              value={searchQuery}
              onChange={handleSearch}
              autoComplete="off"
            />
            {searchResults.length > 0 && (
              <div id="searchResults">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    className="search-result-item"
                    onClick={() => handleSelectResult(result)}
                  >
                    {result.place_name || result.text || 'Unknown location'}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="toolbar-group">
            <button 
              className="toolbar-button" 
              onClick={handleGenerate}
              disabled={loading || !bounds}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </header>
      <div className="workspace">
        {/* Left Settings Panel */}
        <aside className="settings-panel">
          <div className="panel-section">
            <h3>Map Style</h3>
            <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)} className="panel-select">
              <option value="streets-v12">Streets</option>
              <option value="light-v11">Light</option>
              <option value="dark-v11">Dark</option>
              <option value="outdoors-v12">Outdoors</option>
              <option value="satellite-v9">Satellite</option>
              <option value="satellite-streets-v12">Satellite Streets</option>
              <option value="navigation-day-v1">Navigation Day</option>
              <option value="navigation-night-v1">Navigation Night</option>
            </select>
          </div>

          <div className="panel-section">
            <h3>Output Size</h3>
            <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="panel-select">
              <option value="800">800px</option>
              <option value="1000">1000px</option>
              <option value="1280">1280px (max)</option>
              <option value="2000">2000px (retina)</option>
            </select>
            <div className="size-preview">
              {dimensionInfo.width} × {dimensionInfo.height}px
            </div>
          </div>

          <div className="panel-section">
            <h3>Aspect Ratio</h3>
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${dimensionMode === 'preset' ? 'active' : ''}`}
                onClick={() => setDimensionMode('preset')}
              >
                Preset
              </button>
              <button 
                className={`mode-btn ${dimensionMode === 'custom' ? 'active' : ''}`}
                onClick={() => setDimensionMode('custom')}
              >
                Custom
              </button>
            </div>

            {dimensionMode === 'preset' ? (
              <>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="panel-select">
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Wide</option>
                  <option value="21:9">21:9 Ultrawide</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="3:2">3:2 Photo</option>
                  <option value="3:1">3:1 Ultra Panoramic</option>
                  <option value="2:1">2:1 Panoramic</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="4:5">4:5 Instagram</option>
                  <option value="3:4">3:4 Portrait</option>
                  <option value="custom">Custom Ratio...</option>
                </select>
                
                {aspectRatio === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g., 5:3 or 7:2"
                    value={customRatio}
                    onChange={(e) => setCustomRatio(e.target.value)}
                    className="custom-input"
                  />
                )}
              </>
            ) : (
              <div className="custom-dimensions">
                <div className="dimension-row">
                  <input
                    type="number"
                    placeholder="Width"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="dimension-input"
                    min="0.1"
                    step="0.1"
                  />
                  <span className="dimension-separator">×</span>
                  <input
                    type="number"
                    placeholder="Height"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="dimension-input"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <select value={dimensionUnit} onChange={(e) => setDimensionUnit(e.target.value)} className="panel-select" style={{marginTop: '8px'}}>
                  <option value="px">Pixels (px)</option>
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                </select>
              </div>
            )}

            <div className="aspect-info">
              <div className="info-row">
                <span className="info-label">Dimensions:</span>
                <span className="info-value">{dimensionInfo.width} × {dimensionInfo.height}px</span>
              </div>
              <div className="info-row">
                <span className="info-label">Best for:</span>
                <span className="info-value">{dimensionInfo.useCase}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Print size:</span>
                <span className="info-value">{dimensionInfo.printSize}</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3>Selection</h3>
            <button className="panel-button" disabled={!bounds} onClick={() => setBounds(null)}>
              Clear Selection
            </button>
          </div>
        </aside>
      <main className="main-content">
        <MapComponent 
          onBoundsChange={setBounds}
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
          mapStyle={mapStyle}
          aspectRatio={aspectRatio}
        />
      </main>
    </div>"

      {loading && (
        <div className="loading-overlay" style={{ display: 'flex' }}>
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Generating your map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapSelectionPage
