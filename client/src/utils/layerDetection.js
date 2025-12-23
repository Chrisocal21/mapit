// Layer detection algorithms using OpenCV.js
import { imageDataToMat, matToImageData, cleanupMat } from './opencv'

/**
 * Detect water layer from map image
 * Target accuracy: 90%+
 * Detection method: Blue color range detection + morphological operations
 */
export function detectWaterLayer(imageData) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const src = imageDataToMat(imageData)
  const hsv = new cv.Mat()
  const mask = new cv.Mat()
  const result = new cv.Mat()

  try {
    // Convert to HSV for better color detection
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB)
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV)

    // Define blue color range for water (multiple ranges for different map styles)
    // Range 1: Light blue water
    const lowerBlue1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [90, 50, 50, 0])
    const upperBlue1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [130, 255, 255, 255])
    
    cv.inRange(hsv, lowerBlue1, upperBlue1, mask)

    // Morphological operations to clean up detection
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5))
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel)
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel)

    // Convert mask to RGBA
    cv.cvtColor(mask, result, cv.COLOR_GRAY2RGBA)

    const output = matToImageData(result)

    cleanupMat(src, hsv, mask, result, lowerBlue1, upperBlue1, kernel)

    return output
  } catch (error) {
    cleanupMat(src, hsv, mask, result)
    throw error
  }
}

/**
 * Detect roads layer from map image
 * Target accuracy: 75-80%
 * Detection method: Edge detection + line detection + color filtering
 */
export function detectRoadsLayer(imageData) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const src = imageDataToMat(imageData)
  const gray = new cv.Mat()
  const edges = new cv.Mat()
  const result = new cv.Mat()

  try {
    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)

    // Edge detection
    cv.Canny(gray, edges, 50, 150)

    // Detect yellow/orange roads (highways)
    const hsv = new cv.Mat()
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB)
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV)

    // Yellow/orange range for highways
    const lowerYellow = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [15, 100, 100, 0])
    const upperYellow = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [35, 255, 255, 255])
    const yellowMask = new cv.Mat()
    
    cv.inRange(hsv, lowerYellow, upperYellow, yellowMask)

    // Combine edge detection with color detection
    cv.add(edges, yellowMask, result)

    // Convert to RGBA
    const rgba = new cv.Mat()
    cv.cvtColor(result, rgba, cv.COLOR_GRAY2RGBA)

    const output = matToImageData(rgba)

    cleanupMat(src, gray, edges, result, hsv, lowerYellow, upperYellow, yellowMask, rgba)

    return output
  } catch (error) {
    cleanupMat(src, gray, edges, result)
    throw error
  }
}

/**
 * Detect buildings layer from map image
 * Target accuracy: 70-75%
 * Detection method: Contour detection + shape analysis
 */
export function detectBuildingsLayer(imageData) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const src = imageDataToMat(imageData)
  const gray = new cv.Mat()
  const thresh = new cv.Mat()
  const contours = new cv.MatVector()
  const hierarchy = new cv.Mat()
  const result = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)

  try {
    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)

    // Adaptive threshold to detect building outlines
    cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)

    // Find contours
    cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // Filter contours by shape (buildings tend to be rectangular)
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i)
      const area = cv.contourArea(contour)
      
      // Filter by area (buildings have minimum size)
      if (area > 100 && area < 10000) {
        const peri = cv.arcLength(contour, true)
        const approx = new cv.Mat()
        cv.approxPolyDP(contour, approx, 0.02 * peri, true)
        
        // Buildings are roughly rectangular (4-8 corners)
        if (approx.rows >= 4 && approx.rows <= 8) {
          cv.drawContours(result, contours, i, new cv.Scalar(255), -1)
        }
        
        approx.delete()
      }
    }

    // Convert to RGBA
    const rgba = new cv.Mat()
    cv.cvtColor(result, rgba, cv.COLOR_GRAY2RGBA)

    const output = matToImageData(rgba)

    cleanupMat(src, gray, thresh, contours, hierarchy, result, rgba)

    return output
  } catch (error) {
    cleanupMat(src, gray, thresh, contours, hierarchy, result)
    throw error
  }
}

/**
 * Detect parks layer from map image
 * Target accuracy: 85%+
 * Detection method: Green color range detection
 */
export function detectParksLayer(imageData) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const src = imageDataToMat(imageData)
  const hsv = new cv.Mat()
  const mask = new cv.Mat()
  const result = new cv.Mat()

  try {
    // Convert to HSV
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB)
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV)

    // Define green color range for parks
    const lowerGreen = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [35, 40, 40, 0])
    const upperGreen = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [85, 255, 255, 255])
    
    cv.inRange(hsv, lowerGreen, upperGreen, mask)

    // Morphological operations
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5))
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel)
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel)

    // Convert to RGBA
    cv.cvtColor(mask, result, cv.COLOR_GRAY2RGBA)

    const output = matToImageData(result)

    cleanupMat(src, hsv, mask, result, lowerGreen, upperGreen, kernel)

    return output
  } catch (error) {
    cleanupMat(src, hsv, mask, result)
    throw error
  }
}

/**
 * Detect land layer (base layer - everything else)
 * Target accuracy: 100%
 * Method: Invert all other layers
 */
export function detectLandLayer(imageData, otherLayers) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const src = imageDataToMat(imageData)
  const combined = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)
  const result = new cv.Mat()

  try {
    // Combine all other layer masks
    otherLayers.forEach(layerData => {
      const layerMat = imageDataToMat(layerData)
      const gray = new cv.Mat()
      cv.cvtColor(layerMat, gray, cv.COLOR_RGBA2GRAY)
      cv.add(combined, gray, combined)
      cleanupMat(layerMat, gray)
    })

    // Invert to get land
    cv.bitwise_not(combined, result)

    // Convert to RGBA
    const rgba = new cv.Mat()
    cv.cvtColor(result, rgba, cv.COLOR_GRAY2RGBA)

    const output = matToImageData(rgba)

    cleanupMat(src, combined, result, rgba)

    return output
  } catch (error) {
    cleanupMat(src, combined, result)
    throw error
  }
}

/**
 * Composite layers based on visibility
 */
export function compositeLayers(baseImage, layers) {
  const cv = window.cv
  if (!cv) throw new Error('OpenCV not loaded')

  const result = imageDataToMat(baseImage)

  try {
    layers.forEach(({ imageData, visible, alpha = 1.0 }) => {
      if (!visible) return

      const layer = imageDataToMat(imageData)
      cv.addWeighted(result, 1.0, layer, alpha, 0, result)
      cleanupMat(layer)
    })

    const output = matToImageData(result)
    cleanupMat(result)

    return output
  } catch (error) {
    cleanupMat(result)
    throw error
  }
}
