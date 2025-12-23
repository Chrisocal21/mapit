// OpenCV.js loader and initialization

let cvReady = false
let cvPromise = null

export function loadOpenCV() {
  if (cvReady) {
    return Promise.resolve(window.cv)
  }

  if (cvPromise) {
    return cvPromise
  }

  cvPromise = new Promise((resolve, reject) => {
    // Check if OpenCV is already loaded
    if (window.cv && window.cv.Mat) {
      cvReady = true
      resolve(window.cv)
      return
    }

    // Set timeout to prevent infinite hanging
    const timeout = setTimeout(() => {
      reject(new Error('OpenCV.js loading timed out after 30 seconds'))
    }, 30000)

    // Set up Module configuration before loading script
    window.Module = {
      onRuntimeInitialized: () => {
        clearTimeout(timeout)
        cvReady = true
        console.log('OpenCV.js loaded successfully')
        resolve(window.cv)
      }
    }

    // Create script tag
    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
    script.async = true

    script.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('Failed to load OpenCV.js'))
    }

    document.head.appendChild(script)
  })

  return cvPromise
}

export function isOpenCVReady() {
  return cvReady
}

// Helper to convert ImageData to OpenCV Mat
export function imageDataToMat(imageData) {
  const cv = window.cv
  const mat = cv.matFromImageData(imageData)
  return mat
}

// Helper to convert OpenCV Mat to ImageData
export function matToImageData(mat) {
  const cv = window.cv
  const canvas = document.createElement('canvas')
  canvas.width = mat.cols
  canvas.height = mat.rows
  cv.imshow(canvas, mat)
  const ctx = canvas.getContext('2d')
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

// Clean up OpenCV Mat objects
export function cleanupMat(...mats) {
  mats.forEach(mat => {
    if (mat && typeof mat.delete === 'function') {
      mat.delete()
    }
  })
}
