// API utility functions for backend communication

const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function generateMapImage({ bounds, style, width, height, retina = true }) {
  const { _southWest, _northEast } = bounds
  const bbox = `${_southWest.lng},${_southWest.lat},${_northEast.lng},${_northEast.lat}`
  
  const params = new URLSearchParams({
    style: style || 'streets-v12',
    bbox,
    width: width || 2000,
    height: height || 2000,
    retina: retina ? '1' : '0'
  })

  const response = await fetch(`${API_BASE}/api/mapbox/static?${params}`)
  if (!response.ok) {
    throw new Error('Failed to generate map image')
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function searchLocation(query) {
  const params = new URLSearchParams({ q: query })
  const url = `${API_BASE}/api/mapbox/geocoding?${params}`
  console.log('Fetching search from:', url)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Search API error:', response.status, errorText)
    throw new Error(`Search failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  console.log('Search API response:', data)
  // Return just the features array, not the whole FeatureCollection
  return data.features || data
}

export async function getAISearchSuggestion(query) {
  const response = await fetch(`${API_BASE}/api/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error('AI search failed')
  }

  return response.json()
}

export async function getAIOptimizationSuggestions(purpose, mapType) {
  const response = await fetch(`${API_BASE}/api/ai/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose, mapType })
  })

  if (!response.ok) {
    throw new Error('AI suggestions failed')
  }

  return response.json()
}

export async function getAIMapDescription(location, features) {
  const response = await fetch(`${API_BASE}/api/ai/describe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, features })
  })

  if (!response.ok) {
    throw new Error('AI description failed')
  }

  return response.json()
}
