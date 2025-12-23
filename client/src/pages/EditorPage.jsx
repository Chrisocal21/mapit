import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  loadImageToCanvas, 
  processImage, 
  downloadCanvas, 
  copyCanvasToClipboard 
} from '../utils/canvasProcessing'
import { loadOpenCV } from '../utils/opencv'
import { 
  detectWaterLayer, 
  detectRoadsLayer, 
  detectBuildingsLayer, 
  detectParksLayer, 
  detectLandLayer 
} from '../utils/layerDetection'
import './EditorPage.css'

function EditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const originalCanvasRef = useRef(null)
  
  // Get image data from navigation state
  const { imageUrl, mapSettings } = location.state || {}
  
  // Layers state (Phase 15a - now with actual detection!)
  const [layers, setLayers] = useState([
    { id: 'water', name: 'Water', visible: true, color: '#4a90e2', detected: false, imageData: null },
    { id: 'roads', name: 'Roads', visible: true, color: '#e2a04a', detected: false, imageData: null },
    { id: 'buildings', name: 'Buildings', visible: true, color: '#9c4ae2', detected: false, imageData: null },
    { id: 'parks', name: 'Parks', visible: true, color: '#4ae27a', detected: false, imageData: null },
    { id: 'land', name: 'Land', visible: true, color: '#e2d04a', detected: false, imageData: null }
  ])
  
  // Processing settings
  const [settings, setSettings] = useState({
    contrast: 128,
    thickenAmount: 1,
    edgeDetection: false,
    invertColors: false,
    forceBlackText: true,
    forceBlackRoads: true,
    forceWhiteWater: true
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [openCVLoaded, setOpenCVLoaded] = useState(false)
  const [detectionProgress, setDetectionProgress] = useState(0)
  const loadingStartedRef = useRef(false)
  
  // UI toggles
  const [showRulers, setShowRulers] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [gridSize, setGridSize] = useState(50)
  
  // Undo/Redo state
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(240)
  const [rightPanelWidth, setRightPanelWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(null)
  
  // Zoom state
  const [zoom, setZoom] = useState(1)
  const canvasAreaRef = useRef(null)
  
  // Pan state
  const [spacebarDown, setSpacebarDown] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })

  // Load image on mount
  useEffect(() => {
    if (!imageUrl) {
      // If no image, redirect back to map selection
      navigate('/')
      return
    }
    
    // Prevent double-loading in React Strict Mode
    if (loadingStartedRef.current) return
    loadingStartedRef.current = true
    
    // Load OpenCV first, then load image
    loadOpenCVAndImage()
  }, [imageUrl])

  // Keyboard shortcuts and mouse wheel zoom
  useEffect(() => {
    if (!imageLoaded) return

    const handleKeyDown = (e) => {
      // Arrow keys for contrast (when not focused on input)
      if (!e.target.matches('input, textarea')) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSettings(prev => ({ ...prev, contrast: Math.min(255, prev.contrast + 1) }))
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSettings(prev => ({ ...prev, contrast: Math.max(0, prev.contrast - 1) }))
        }
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's':
            e.preventDefault()
            handleDownload()
            break
          case '+':
          case '=':
            e.preventDefault()
            setZoom(z => Math.min(5, z + 0.1))
            break
          case '-':
            e.preventDefault()
            setZoom(z => Math.max(0.1, z - 0.1))
            break
          case '0':
            e.preventDefault()
            handleFitToWindow()
            break
          case '1':
            e.preventDefault()
            setZoom(1)
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
        }
      }
    }

    const handleWheel = (e) => {
      if (canvasAreaRef.current && canvasAreaRef.current.contains(e.target)) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(z => Math.max(0.1, Math.min(5, z + delta)))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const canvasArea = canvasAreaRef.current
    if (canvasArea) {
      canvasArea.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (canvasArea) {
        canvasArea.removeEventListener('wheel', handleWheel)
      }
    }
  }, [imageLoaded, navigate])

  async function loadOpenCVAndImage() {
    try {
      // Skip OpenCV - load image directly for faster startup
      console.log('Skipping OpenCV, loading image directly...')
      setProcessingMessage('Loading image...')
      setIsProcessing(true)
      
      await loadImage()
      
      // Optionally load OpenCV in background after image loads
      // loadOpenCV().then(() => {
      //   setOpenCVLoaded(true)
      //   detectAllLayers()
      // }).catch(err => console.log('OpenCV failed:', err))
    } catch (error) {
      console.error('Failed to load image:', error)
      setProcessingMessage('Failed to load image: ' + error.message)
      setIsProcessing(false)
    }
  }

  async function loadImage() {
    try {
      if (!imageUrl) {
        setProcessingMessage('No image loaded. Please generate a map first.')
        setIsProcessing(false)
        return
      }
      
      console.log('Loading image from:', imageUrl)
      setProcessingMessage('Loading image...')
      setIsProcessing(true)
      
      const { canvas, ctx } = await loadImageToCanvas(imageUrl)
      
      console.log('Image loaded successfully:', canvas.width, 'x', canvas.height)
      
      // Store original canvas
      originalCanvasRef.current = canvas
      
      // Create display canvas
      if (canvasRef.current) {
        const displayCanvas = canvasRef.current
        displayCanvas.width = canvas.width
        displayCanvas.height = canvas.height
        
        const displayCtx = displayCanvas.getContext('2d')
        displayCtx.drawImage(canvas, 0, 0)
      }
      
      setImageLoaded(true)
      setProcessingMessage('')
      setIsProcessing(false)
      
      // Start layer detection if OpenCV is loaded
      if (openCVLoaded) {
        detectAllLayers()
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      setProcessingMessage(`Failed to load image: ${error.message}`)
      setIsProcessing(false)
    }
  }

  async function detectAllLayers() {
    if (!originalCanvasRef.current) return
    
    try {
      setProcessingMessage('Detecting layers...')
      setIsProcessing(true)
      setDetectionProgress(0)
      
      const ctx = originalCanvasRef.current.getContext('2d')
      const imageData = ctx.getImageData(0, 0, originalCanvasRef.current.width, originalCanvasRef.current.height)
      
      const detectedLayers = []
      
      // Detect water (20%)
      setProcessingMessage('Detecting water layer...')
      setDetectionProgress(20)
      const waterData = detectWaterLayer(imageData)
      detectedLayers.push({ id: 'water', imageData: waterData })
      
      // Detect roads (40%)
      setProcessingMessage('Detecting roads layer...')
      setDetectionProgress(40)
      const roadsData = detectRoadsLayer(imageData)
      detectedLayers.push({ id: 'roads', imageData: roadsData })
      
      // Detect buildings (60%)
      setProcessingMessage('Detecting buildings layer...')
      setDetectionProgress(60)
      const buildingsData = detectBuildingsLayer(imageData)
      detectedLayers.push({ id: 'buildings', imageData: buildingsData })
      
      // Detect parks (80%)
      setProcessingMessage('Detecting parks layer...')
      setDetectionProgress(80)
      const parksData = detectParksLayer(imageData)
      detectedLayers.push({ id: 'parks', imageData: parksData })
      
      // Detect land (100%)
      setProcessingMessage('Detecting land layer...')
      setDetectionProgress(100)
      const landData = detectLandLayer(imageData, [waterData, roadsData, buildingsData, parksData])
      detectedLayers.push({ id: 'land', imageData: landData })
      
      // Update layers state
      setLayers(prevLayers => 
        prevLayers.map(layer => {
          const detected = detectedLayers.find(d => d.id === layer.id)
          return detected 
            ? { ...layer, detected: true, imageData: detected.imageData }
            : layer
        })
      )
      
      setProcessingMessage('Layer detection complete!')
      setTimeout(() => {
        setProcessingMessage('')
        setIsProcessing(false)
      }, 1500)
      
    } catch (error) {
      console.error('Layer detection failed:', error)
      setProcessingMessage('Layer detection failed: ' + error.message)
      setIsProcessing(false)
    }
  }

  function toggleLayer(id) {
    setLayers(layers.map(layer => 
          {processingMessage && (
            <span className="processing-msg">
              {processingMessage}
              {detectionProgress > 0 && ` (${detectionProgress}%)`}
            </span>
          )}
    ))
  }

  async function applyProcessing() {
    if (!originalCanvasRef.current || !canvasRef.current) return
    
    try {
      setProcessingMessage('Processing image...')
      setIsProcessing(true)
      
      // Clone original canvas
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = originalCanvasRef.current.width
      tempCanvas.height = originalCanvasRef.current.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.drawImage(originalCanvasRef.current, 0, 0)
      
      // Apply processing
      const processedCanvas = processImage(tempCanvas, settings)
      
      // Update display canvas
      const displayCtx = canvasRef.current.getContext('2d')
      displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      displayCtx.drawImage(processedCanvas, 0, 0)
      
      setProcessingMessage('')
      setIsProcessing(false)
    } catch (error) {
      console.error('Processing failed:', error)
      setProcessingMessage('Processing failed')
      setIsProcessing(false)
    }
  }

  function handleDownload() {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, `maprdy-${Date.now()}.png`)
    }
  }

  async function handleCopy() {
    if (canvasRef.current) {
      const success = await copyCanvasToClipboard(canvasRef.current)
      if (success) {
        setProcessingMessage('Copied to clipboard!')
        setTimeout(() => setProcessingMessage(''), 2000)
      } else {
        setProcessingMessage('Failed to copy')
        setTimeout(() => setProcessingMessage(''), 2000)
      }
    }
  }

  function updateSetting(key, value) {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      
      // Add to history
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1)
        newHistory.push({ type: 'settings', data: newSettings })
        return newHistory.slice(-50) // Keep last 50 states
      })
      setHistoryIndex(i => Math.min(i + 1, 49))
      
      return newSettings
    })
  }

  function toggleLayer(layerId) {
    setLayers(prevLayers => {
      const newLayers = prevLayers.map(layer => 
        layer && layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
      
      // Add to history
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1)
        newHistory.push({ type: 'layers', data: newLayers })
        return newHistory.slice(-50)
      })
      setHistoryIndex(i => Math.min(i + 1, 49))
      
      return newLayers
    })
  }
  
  function undo() {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      if (prevState.type === 'settings') {
        setSettings(prevState.data)
      } else if (prevState.type === 'layers') {
        setLayers(prevState.data)
      }
      setHistoryIndex(historyIndex - 1)
    }
  }
  
  function redo() {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      if (nextState.type === 'settings') {
        setSettings(nextState.data)
      } else if (nextState.type === 'layers') {
        setLayers(nextState.data)
      }
      setHistoryIndex(historyIndex + 1)
    }
  }

  function handleFitToWindow() {
    if (canvasAreaRef.current && canvasRef.current) {
      const areaWidth = canvasAreaRef.current.clientWidth - 40
      const areaHeight = canvasAreaRef.current.clientHeight - 40
      const scaleX = areaWidth / canvasRef.current.width
      const scaleY = areaHeight / canvasRef.current.height
      const optimalZoom = Math.min(scaleX, scaleY, 1)
      setZoom(optimalZoom)
    }
  }
  
  // Pan handlers
  function handleMouseDown(e) {
    if (!spacebarDown) return
    
    setIsPanning(true)
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    }
  }
  
  function handleMouseMove(e) {
    if (!isPanning) return
    
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    })
  }
  
  function handleMouseUp() {
    setIsPanning(false)
  }

  // Auto-apply processing when settings change
  useEffect(() => {
    if (imageLoaded) {
      applyProcessing()
    }
  }, [settings, layers])

  // Resize handlers
  const handleResizeMouseDown = (panel) => (e) => {
    e.preventDefault()
    setIsResizing(panel)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      if (isResizing === 'left') {
        const newWidth = Math.max(100, Math.min(500, e.clientX))
        setLeftPanelWidth(newWidth)
      } else if (isResizing === 'right') {
        const newWidth = Math.max(180, Math.min(500, window.innerWidth - e.clientX))
        setRightPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="header-main">
          <div className="header-left">
            <h2>Professional Editor</h2>
            {processingMessage && <span className="processing-msg">{processingMessage}</span>}
          </div>
          <div className="header-right">
            <button onClick={handleCopy} className="btn-secondary" disabled={!imageLoaded}>
              Copy
            </button>
            <button onClick={handleDownload} className="btn-primary" disabled={!imageLoaded}>
              Download
            </button>
          </div>
        </div>
        
        <div className="menu-bar">
          <button className="menu-item" onClick={() => navigate('/')}>
            ← Back
          </button>
          <button className="menu-item">File</button>
          <button className="menu-item">Edit</button>
          <button className="menu-item">Object</button>
          <button className="menu-item">Type</button>
          <button className="menu-item">Select</button>
          <button className="menu-item view-menu">
            View
            <div className="menu-dropdown">
              <label className="menu-dropdown-item">
                <input type="checkbox" checked={showRulers} onChange={(e) => setShowRulers(e.target.checked)} />
                Rulers
              </label>
              <label className="menu-dropdown-item">
                <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                Grid
              </label>
              {showGrid && (
                <label className="menu-dropdown-item">
                  <span style={{fontSize: '10px'}}>Grid Size:</span>
                  <input 
                    type="number" 
                    value={gridSize} 
                    onChange={(e) => setGridSize(Math.max(10, parseInt(e.target.value) || 50))}
                    style={{width: '50px', marginLeft: '8px', padding: '2px 4px', fontSize: '10px'}}
                  />
                </label>
              )}
            </div>
          </button>
          <button className="menu-item">Window</button>
          <button className="menu-item">Help</button>
        </div>
      </header>

      <div className="editor-layout">
        {/* Left Panel - Layers */}
        <aside className="layers-panel" style={{ width: `${leftPanelWidth}px` }}>
          <div className="resize-handle left" onMouseDown={handleResizeMouseDown('left')} />
          <h3>Layers</h3>
          <div className="layers-list">
            {layers.filter(layer => layer).map(layer => (
              <div key={layer.id} className="layer-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={layer.visible}
                    onChange={() => toggleLayer(layer.id)}
                  />
                  <span>{layer.name}</span>
                </label>
              </div>
            ))}
          </div>

          <h3>Presets</h3>
          <div className="presets-section">
            <select onChange={(e) => {
              const preset = e.target.value
              if (preset === 'roads-only') {
                setLayers(layers.filter(l => l).map(l => ({ ...l, visible: l.id === 'roads' })))
              } else if (preset === 'no-water') {
                setLayers(layers.filter(l => l).map(l => ({ ...l, visible: l.id !== 'water' })))
              } else if (preset === 'natural') {
                setLayers(layers.filter(l => l).map(l => ({ ...l, visible: ['water', 'parks', 'land'].includes(l.id) })))
              } else if (preset === 'urban') {
                setLayers(layers.filter(l => l).map(l => ({ ...l, visible: ['roads', 'buildings'].includes(l.id) })))
              } else {
                setLayers(layers.filter(l => l).map(l => ({ ...l, visible: true })))
              }
            }}>
              <option value="all">All Layers</option>
              <option value="roads-only">Roads Only</option>
              <option value="no-water">No Water</option>
              <option value="natural">Natural Features</option>
              <option value="urban">Urban Only</option>
            </select>
            
            <small>
              {!openCVLoaded && 'Loading OpenCV for layer detection...'}
              {openCVLoaded && !imageLoaded && 'Image loading...'}
              {openCVLoaded && imageLoaded && layers.every(l => l.detected) && 'All layers detected successfully!'}
              {openCVLoaded && imageLoaded && !layers.every(l => l.detected) && 'Detecting layers...'}
            </small>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main 
          className="canvas-area" 
          ref={canvasAreaRef}
          style={{ cursor: spacebarDown ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="canvas-controls">
            <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} title="Zoom In (Ctrl++)">+</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} title="Zoom Out (Ctrl+-)">−</button>
            <button onClick={handleFitToWindow} title="Fit to Window (Ctrl+0)">Fit</button>
            <button onClick={() => setZoom(1)} title="Actual Size (Ctrl+1)">100%</button>
          </div>
          <div className="canvas-wrapper">
            {!imageLoaded && !isProcessing && (
              <div className="canvas-placeholder">
                <p>No image loaded</p>
                <p style={{fontSize: '11px', marginTop: '8px', color: '#999'}}>Generate a map from the main page first</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="canvas-placeholder">
                <p>{processingMessage}</p>
              </div>
            )}
            
            <canvas 
              ref={canvasRef}
              style={{ 
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: 'center',
                display: imageLoaded ? 'block' : 'none'
              }}
            />
            
            {/* Rulers */}
            {showRulers && imageLoaded && canvasRef.current && (
              <>
                <div className="ruler ruler-horizontal" />
                <div className="ruler ruler-vertical" />
              </>
            )}
            
            {/* Grid */}
            {showGrid && imageLoaded && canvasRef.current && (
              <svg className="grid-overlay" style={{
                width: canvasRef.current.width * zoom,
                height: canvasRef.current.height * zoom,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
              }}>
                <defs>
                  <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                    <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}
          </div>
        </main>

        {/* Right Panel - Properties */}
        <aside className="properties-panel" style={{ width: `${rightPanelWidth}px` }}>
          <div className="resize-handle right" onMouseDown={handleResizeMouseDown('right')} />
          <h3>Properties</h3>
          
          <h3>Processing</h3>
          <div className="property-section">
            
            <label>
              <span>Contrast: {settings.contrast}</span>
              <input 
                type="range" 
                min="0" 
                max="255" 
                value={settings.contrast}
                onInput={(e) => updateSetting('contrast', parseInt(e.target.value))}
                onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
              />
            </label>
            
            <label>
              <span>Thicken Lines: {settings.thickenAmount}px</span>
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={settings.thickenAmount}
                onChange={(e) => updateSetting('thickenAmount', parseInt(e.target.value))}
              />
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={settings.invertColors}
                onChange={(e) => updateSetting('invertColors', e.target.checked)}
              />
              <span>Invert Colors</span>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={settings.edgeDetection}
                onChange={(e) => updateSetting('edgeDetection', e.target.checked)}
              />
              <span>Edge Detection</span>
            </label>
          </div>

          <h3>Color Forcing</h3>
          <div className="property-section">
            
            <label>
              <input 
                type="checkbox" 
                checked={settings.forceBlackText}
                onChange={(e) => updateSetting('forceBlackText', e.target.checked)}
              />
              <span>Force Black Text</span>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={settings.forceBlackRoads}
                onChange={(e) => updateSetting('forceBlackRoads', e.target.checked)}
              />
              <span>Force Black Roads</span>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={settings.forceWhiteWater}
                onChange={(e) => updateSetting('forceWhiteWater', e.target.checked)}
              />
              <span>Force White Water</span>
            </label>
          </div>

          <h3>Map Info</h3>
          <div className="property-section">
            {mapSettings && (
              <div className="map-info">
                <p><strong>Style:</strong> {mapSettings.style}</p>
                <p><strong>Size:</strong> {mapSettings.width}x{mapSettings.height}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          {imageLoaded ? 'Ready' : 'Loading...'}
        </div>
        <div className="status-right">
          {Math.round(zoom * 100)}%
        </div>
      </footer>
    </div>
  )
}

export default EditorPage
