import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'
import { generateMapImage } from '../utils/api'
import './MapSelectionPage.css'

function MapSelectionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [bounds, setBounds] = useState(null)
  const [mapStyle, setMapStyle] = useState('streets-v12')
  const [imageSize, setImageSize] = useState(2000)

  const handleGenerate = async () => {
    if (!bounds) {
      alert('Please select a location on the map')
      return
    }

    setLoading(true)
    
    try {
      const imageUrl = await generateMapImage({
        bounds,
        style: mapStyle,
        width: imageSize,
        height: imageSize
      })
      
      navigate('/editor', {
        state: {
          imageUrl,
          mapSettings: {
            style: mapStyle,
            width: imageSize,
            height: imageSize,
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
          
          <div className="toolbar-group">
            <span className="toolbar-label">Style</span>
            <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)} className="toolbar-select">
              <option value="streets-v12">Streets</option>
              <option value="light-v11">Light</option>
              <option value="dark-v11">Dark</option>
              <option value="outdoors-v12">Outdoors</option>
            </select>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Size</span>
            <select value={imageSize} onChange={(e) => setImageSize(parseInt(e.target.value))} className="toolbar-select">
              <option value="1000">1000px</option>
              <option value="2000">2000px</option>
              <option value="3000">3000px</option>
              <option value="4000">4000px</option>
            </select>
          </div>

          <div className="toolbar-group">
            <button 
              className="toolbar-button" 
              onClick={handleGenerate}
              disabled={loading || !bounds}
            >
              {loading ? '⚙️ Generating...' : '⚡ Generate'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <MapComponent 
          onBoundsChange={setBounds}
          onLocationSelect={setSelectedLocation}
        />
      </main>

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
