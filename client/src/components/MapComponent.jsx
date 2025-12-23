import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapComponent({ onBoundsChange, onLocationSelect, selectedLocation, mapStyle = 'streets-v12', aspectRatio = '1:1' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const rectangleRef = useRef(null)
  const tileLayerRef = useRef(null)
  const cornerMarkersRef = useRef([])
  const [selectionInfo, setSelectionInfo] = useState({
    center: '--',
    dimensions: '--',
    bounds: '--'
  })
  const [spacebarDown, setSpacebarDown] = useState(false)
  const [isDraggingRect, setIsDraggingRect] = useState(false)
  const dragStartRef = useRef(null)
  const spacebarDownRef = useRef(false)
  const isDraggingRectRef = useRef(false)
  
  // Keep refs in sync with state
  useEffect(() => {
    spacebarDownRef.current = spacebarDown
  }, [spacebarDown])
  
  useEffect(() => {
    isDraggingRectRef.current = isDraggingRect
  }, [isDraggingRect])

  // Update map style when it changes
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      // Remove old tile layer
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
      
      // Map Mapbox style names to tile URLs
      let tileUrl
      if (mapStyle === 'satellite-v9') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' // OSM doesn't have satellite, fallback
      } else if (mapStyle === 'dark-v11') {
        tileUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
      } else if (mapStyle === 'light-v11') {
        tileUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
      } else {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      }
      
      // Add new tile layer
      const newTileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)
      
      tileLayerRef.current = newTileLayer
    }
  }, [mapStyle])

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: [40.7128, -74.0060], // NYC default
        zoom: 13,
        zoomControl: true,
        keyboard: false // Disable Leaflet keyboard handlers to prevent spacebar interference
      })

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)
      
      tileLayerRef.current = tileLayer
      mapInstanceRef.current = map

      // Create draggable and resizable rectangle
      const bounds = map.getBounds()
      const rectangle = L.rectangle(bounds, {
        color: '#0d6efd',
        weight: 3,
        fillOpacity: 0.15
      }).addTo(map)

      rectangleRef.current = rectangle
      
      // Custom drag handling for rectangle with spacebar
      rectangle.on('mousedown', (e) => {
        if (spacebarDownRef.current && !isDraggingRectRef.current) {
          e.originalEvent.preventDefault()
          setIsDraggingRect(true)
          dragStartRef.current = {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            bounds: rectangle.getBounds()
          }
          map.dragging.disable()
        }
      })
      
      map.on('mousemove', (e) => {
        if (isDraggingRectRef.current && dragStartRef.current && spacebarDownRef.current) {
          const latDiff = e.latlng.lat - dragStartRef.current.lat
          const lngDiff = e.latlng.lng - dragStartRef.current.lng
          
          const oldBounds = dragStartRef.current.bounds
          const ne = oldBounds.getNorthEast()
          const sw = oldBounds.getSouthWest()
          
          const newBounds = L.latLngBounds(
            [sw.lat + latDiff, sw.lng + lngDiff],
            [ne.lat + latDiff, ne.lng + lngDiff]
          )
          
          rectangle.setBounds(newBounds)
          updateCornerMarkers(newBounds)
          onBoundsChange && onBoundsChange(newBounds)
          updateSelectionInfo(newBounds)
        }
      })
      
      map.on('mouseup', () => {
        if (isDraggingRectRef.current) {
          setIsDraggingRect(false)
          dragStartRef.current = null
          map.dragging.enable()
        }
      })

      rectangleRef.current = rectangle
      
      // Create custom corner handles for resizing
      const createCornerMarkers = (bounds) => {
        // Clear old markers
        cornerMarkersRef.current.forEach(marker => map.removeLayer(marker))
        cornerMarkersRef.current = []
        
        const corners = [
          bounds.getNorthWest(),
          bounds.getNorthEast(),
          bounds.getSouthEast(),
          bounds.getSouthWest()
        ]
        
        const cornerIcon = L.divIcon({
          className: 'corner-handle',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        })
        
        corners.forEach((corner, index) => {
          const marker = L.marker(corner, {
            icon: cornerIcon,
            draggable: true
          }).addTo(map)
          
          marker.on('drag', (e) => {
            const newPos = e.target.getLatLng()
            const rectBounds = rectangle.getBounds()
            const ne = rectBounds.getNorthEast()
            const sw = rectBounds.getSouthWest()
            
            let newBounds
            if (index === 0) { // NW
              newBounds = L.latLngBounds([sw.lat, newPos.lng], [newPos.lat, ne.lng])
            } else if (index === 1) { // NE
              newBounds = L.latLngBounds([sw.lat, sw.lng], [newPos.lat, newPos.lng])
            } else if (index === 2) { // SE
              newBounds = L.latLngBounds([newPos.lat, sw.lng], [ne.lat, newPos.lng])
            } else { // SW
              newBounds = L.latLngBounds([newPos.lat, newPos.lng], [ne.lat, ne.lng])
            }
            
            rectangle.setBounds(newBounds)
            updateCornerMarkers(newBounds)
            onBoundsChange && onBoundsChange(newBounds)
            updateSelectionInfo(newBounds)
          })
          
          cornerMarkersRef.current.push(marker)
        })
      }
      
      const updateCornerMarkers = (bounds) => {
        const corners = [
          bounds.getNorthWest(),
          bounds.getNorthEast(),
          bounds.getSouthEast(),
          bounds.getSouthWest()
        ]
        
        cornerMarkersRef.current.forEach((marker, index) => {
          marker.setLatLng(corners[index])
        })
      }
      
      // Initialize corner markers
      createCornerMarkers(bounds)

      // Function to update selection info
      const updateSelectionInfo = (bounds) => {
        const center = bounds.getCenter()
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        
        // Calculate dimensions in km
        const widthKm = (ne.lng - sw.lng) * 111.32 * Math.cos(center.lat * Math.PI / 180)
        const heightKm = (ne.lat - sw.lat) * 110.574
        
        setSelectionInfo({
          center: `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`,
          dimensions: `${widthKm.toFixed(2)}km × ${heightKm.toFixed(2)}km`,
          bounds: `[${sw.lat.toFixed(4)}, ${sw.lng.toFixed(4)}] to [${ne.lat.toFixed(4)}, ${ne.lng.toFixed(4)}]`
        })
      }

      // Send initial bounds immediately
      onBoundsChange && onBoundsChange(bounds)
      updateSelectionInfo(bounds)

      // Handle rectangle edit (resize corners)
      rectangle.on('edit', () => {
        const bounds = rectangle.getBounds()
        updateCornerMarkers(bounds)
        onBoundsChange && onBoundsChange(bounds)
        updateSelectionInfo(bounds)
      })

      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        tileLayerRef.current = null
        rectangleRef.current = null
      }
    }
  }, []) // Only initialize once
  
  // Spacebar key handlers
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === 'Space' && !spacebarDown && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        e.stopPropagation()
        setSpacebarDown(true)
      }
    }
    
    function handleKeyUp(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        e.stopPropagation()
        setSpacebarDown(false)
        setIsDraggingRect(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
    }
  }, [spacebarDown])

  // Adjust rectangle aspect ratio when it changes
  useEffect(() => {
    if (rectangleRef.current && mapInstanceRef.current && cornerMarkersRef.current.length > 0) {
      const currentBounds = rectangleRef.current.getBounds()
      const center = currentBounds.getCenter()
      
      // Calculate new bounds based on aspect ratio
      const ne = currentBounds.getNorthEast()
      const sw = currentBounds.getSouthWest()
      const currentLatDiff = ne.lat - sw.lat
      const currentLngDiff = ne.lng - sw.lng
      
      let newLatDiff, newLngDiff
      
      if (aspectRatio === '1:1') {
        // Square: use the larger dimension
        const maxDiff = Math.max(currentLatDiff, currentLngDiff)
        newLatDiff = maxDiff
        newLngDiff = maxDiff
      } else if (aspectRatio === '16:9') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (16 / 9)
      } else if (aspectRatio === '21:9') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (21 / 9)
      } else if (aspectRatio === '4:3') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (4 / 3)
      } else if (aspectRatio === '3:2') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (3 / 2)
      } else if (aspectRatio === '3:1') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * 3
      } else if (aspectRatio === '2:1') {
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * 2
      } else if (aspectRatio === '9:16') {
        // Portrait
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (9 / 16)
      } else if (aspectRatio === '4:5') {
        // Instagram portrait
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (4 / 5)
      } else if (aspectRatio === '3:4') {
        // Portrait 4:3
        newLatDiff = currentLatDiff
        newLngDiff = currentLatDiff * (3 / 4)
      } else if (aspectRatio.includes(':')) {
        // Parse custom ratio like "5:3"
        const parts = aspectRatio.split(':').map(p => parseFloat(p.trim()))
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          newLatDiff = currentLatDiff
          newLngDiff = currentLatDiff * (parts[0] / parts[1])
        } else {
          // Invalid ratio, default to square
          const maxDiff = Math.max(currentLatDiff, currentLngDiff)
          newLatDiff = maxDiff
          newLngDiff = maxDiff
        }
      } else {
        // Default to square
        const maxDiff = Math.max(currentLatDiff, currentLngDiff)
        newLatDiff = maxDiff
        newLngDiff = maxDiff
      }
      
      const newBounds = L.latLngBounds(
        [center.lat - newLatDiff / 2, center.lng - newLngDiff / 2],
        [center.lat + newLatDiff / 2, center.lng + newLngDiff / 2]
      )
      
      rectangleRef.current.setBounds(newBounds)
      
      // Update corner markers
      const corners = [
        newBounds.getNorthWest(),
        newBounds.getNorthEast(),
        newBounds.getSouthEast(),
        newBounds.getSouthWest()
      ]
      cornerMarkersRef.current.forEach((marker, index) => {
        marker.setLatLng(corners[index])
      })
      
      // Update info and notify parent
      const ne2 = newBounds.getNorthEast()
      const sw2 = newBounds.getSouthWest()
      const widthKm = (ne2.lng - sw2.lng) * 111.32 * Math.cos(center.lat * Math.PI / 180)
      const heightKm = (ne2.lat - sw2.lat) * 110.574
      
      onBoundsChange && onBoundsChange(newBounds)
    }
  }, [aspectRatio])

  // Fly to selected location when it changes
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      const [lng, lat] = selectedLocation.center
      // Just set the view instantly - no animation to avoid flashing/black screens
      mapInstanceRef.current.setView([lat, lng], 13)
    }
  }, [selectedLocation])

  return (
    <div className="map-component-wrapper">
      <div ref={mapRef} className="map-container" />
      
      <div className="selection-info-panel">
        <div className="info-header">Selection Info</div>
        <div className="info-item">
          <span className="info-label">Center:</span>
          <span className="info-value">{selectionInfo.center}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Dimensions:</span>
          <span className="info-value">{selectionInfo.dimensions}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Bounds:</span>
          <span className="info-value" style={{fontSize: '10px'}}>{selectionInfo.bounds}</span>
        </div>
      </div>
    </div>
  )
}

export default MapComponent
