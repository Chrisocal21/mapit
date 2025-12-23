// Canvas processing utilities - ported from public/index.html

export function loadImageToCanvas(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('Image loaded, dimensions:', img.width, 'x', img.height)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      resolve({ canvas, ctx, width: img.width, height: img.height })
    }
    
    img.onerror = (error) => {
      console.error('Image load error:', error)
      reject(new Error('Failed to load image - check network and CORS settings'))
    }
    
    img.src = imageSrc
    console.log('Started loading image from:', imageSrc)
  })
}

export function applyContrast(imageData, threshold = 128) {
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
    const newValue = brightness > threshold ? 255 : 0
    
    data[i] = newValue     // R
    data[i + 1] = newValue // G
    data[i + 2] = newValue // B
    // Alpha stays the same
  }
  
  return imageData
}

export function applyEdgeDetection(imageData) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  // Sobel operator
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ]
  
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ]
  
  const output = new Uint8ClampedArray(data)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          
          gx += gray * sobelX[ky + 1][kx + 1]
          gy += gray * sobelY[ky + 1][kx + 1]
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const idx = (y * width + x) * 4
      const value = magnitude > 50 ? 0 : 255
      
      output[idx] = value
      output[idx + 1] = value
      output[idx + 2] = value
    }
  }
  
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i]
  }
  
  return imageData
}

export function invertColors(imageData) {
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]       // R
    data[i + 1] = 255 - data[i + 1] // G
    data[i + 2] = 255 - data[i + 2] // B
  }
  
  return imageData
}

export function thickenLines(imageData, amount = 1) {
  if (amount === 0) return imageData
  
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new Uint8ClampedArray(data)
  
  // Morphological dilation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      
      if (data[idx] === 0) { // Black pixel (line/text)
        // Thicken by marking surrounding pixels as black
        for (let dy = -amount; dy <= amount; dy++) {
          for (let dx = -amount; dx <= amount; dx++) {
            const nx = x + dx
            const ny = y + dy
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4
              output[nidx] = 0
              output[nidx + 1] = 0
              output[nidx + 2] = 0
            }
          }
        }
      }
    }
  }
  
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i]
  }
  
  return imageData
}

export function forceBlackText(imageData) {
  // Force text areas to pure black (detect gray areas that are likely text)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
    
    // If pixel is dark-ish (likely text), make it pure black
    if (brightness < 180) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
    }
  }
  
  return imageData
}

export function forceBlackRoads(imageData) {
  // Similar to forceBlackText but targets road colors
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Detect yellowish/orange (highways) or gray (roads)
    const isRoad = (r > 200 && g > 150 && b < 100) || // Yellow/orange
                   (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r < 200) // Gray
    
    if (isRoad) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
    }
  }
  
  return imageData
}

export function forceWhiteWater(imageData) {
  // Force water areas to pure white
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Detect blue/cyan (water)
    const isWater = b > r + 20 && b > g + 20 && b > 150
    
    if (isWater) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
    }
  }
  
  return imageData
}

export function processImage(canvas, settings) {
  const ctx = canvas.getContext('2d')
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  // Apply contrast first
  if (settings.contrast !== undefined) {
    imageData = applyContrast(imageData, settings.contrast)
  }
  
  // Apply color forcing
  if (settings.forceBlackText) {
    imageData = forceBlackText(imageData)
  }
  
  if (settings.forceBlackRoads) {
    imageData = forceBlackRoads(imageData)
  }
  
  if (settings.forceWhiteWater) {
    imageData = forceWhiteWater(imageData)
  }
  
  // Apply thickening
  if (settings.thickenAmount > 0) {
    imageData = thickenLines(imageData, settings.thickenAmount)
  }
  
  // Apply edge detection
  if (settings.edgeDetection) {
    imageData = applyEdgeDetection(imageData)
  }
  
  // Apply invert
  if (settings.invertColors) {
    imageData = invertColors(imageData)
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  return canvas
}

export function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png')
  })
}

export function downloadCanvas(canvas, filename = 'maprdy-map.png') {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

export async function copyCanvasToClipboard(canvas) {
  try {
    const blob = await canvasToBlob(canvas)
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch (error) {
    console.error('Clipboard error:', error)
    return false
  }
}
