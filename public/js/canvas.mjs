/**
 * Canvas Image Processing Module
 * 
 * Modular functions for processing map images for engraving and other outputs.
 * Includes threshold, edge detection, envelope warp, and various masking operations.
 */

/**
 * Main image processing function
 * @param {HTMLImageElement} img - Source image element
 * @param {Object} options - Processing options
 * @param {number} options.threshold - Contrast threshold (0-255, default: 128)
 * @param {boolean} options.edgeDetection - Enable Sobel edge detection (default: false)
 * @param {boolean} options.invert - Invert colors (default: false)
 * @param {boolean} options.laserMode - Laser engraving mode (default: false)
 * @param {boolean} options.blackText - Preserve black text with white boxes (default: false)
 * @param {boolean} options.blackRoads - Force roads to solid black (default: false)
 * @param {boolean} options.whiteWater - Force water to white (default: false)
 * @param {number} options.envelopeWarp - Envelope warp percentage 0-4 (default: 0)
 * @param {boolean} options.thickenText - Apply morphological dilation (default: false)
 * @param {number} options.thickenAmount - Thickness amount 0.5-5 (default: 2)
 * @param {boolean} options.removeFerryLines - Remove dashed ferry lines (default: false)
 * @returns {Object} { canvas, dataUrl } - Processed canvas and data URL
 */
export function processImage(img, options = {}) {
    // Default options
    const {
        threshold = 128,
        edgeDetection = false,
        invert = false,
        laserMode = false,
        blackText = false,
        blackRoads = false,
        whiteWater = false,
        envelopeWarp = 0,
        thickenText = false,
        thickenAmount = 2,
        removeFerryLines = false,
        thickenCoastlines = false,
        coastlineAmount = 2
    } = options;

    console.log('Starting image processing...', img.width, img.height);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    console.log('Canvas created:', canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    console.log('Image drawn to canvas');
    
    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    console.log('Image data extracted:', data.length, 'values');
    
    console.log('Processing with threshold:', threshold, 'edge:', edgeDetection, 'invert:', invert);
    
    // Store masks for text, roads, and water before processing
    let textMask = null;
    let roadMask = null;
    let waterMask = null;
    
    if (laserMode && invert && (blackText || blackRoads || whiteWater)) {
        const width = canvas.width;
        const height = canvas.height;
        
        if (blackText) {
            console.log('Laser + Invert + Black Text: marking text pixels to preserve');
            textMask = new Uint8Array(data.length / 4);
            
            // Identify text pixels (typically dark to medium gray)
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                textMask[i / 4] = (gray < 220) ? 1 : 0;
            }
        }
        
        if (blackRoads) {
            console.log('Laser + Invert + Black Roads: marking road pixels');
            roadMask = new Uint8Array(data.length / 4);
            
            // Roads are typically lighter gray on streets style (around 200-240)
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                // Detect light gray roads
                roadMask[i / 4] = (gray > 200 && gray < 245) ? 1 : 0;
            }
        }
        
        if (whiteWater) {
            console.log('Laser + Invert + White Water: marking water pixels');
            waterMask = new Uint8Array(data.length / 4);
            
            // Water is typically light colored on streets style (240-255)
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                // Detect very light areas (likely water)
                waterMask[i / 4] = (gray > 240) ? 1 : 0;
            }
        }
    }
    
    // Laser mode: uses streets style, apply aggressive threshold to get pure black/white
    if (laserMode) {
        console.log('Laser mode: converting to pure black roads/text on white background');
        
        // Convert to grayscale first
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
        
        // Apply aggressive threshold - anything darker than 220 becomes pure black
        // This captures roads, text, and water boundaries
        const laserThreshold = 220;
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i];
            // Below threshold = black (roads/text), above = white (background)
            const value = gray < laserThreshold ? 0 : 255;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
    } else {
        // Convert to grayscale and apply threshold
        for (let i = 0; i < data.length; i += 4) {
            // Grayscale conversion
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            
            // Apply threshold
            const value = gray > threshold ? 255 : 0;
            
            data[i] = value;     // Red
            data[i + 1] = value; // Green
            data[i + 2] = value; // Blue
        }
    }
    
    console.log('Threshold applied');
    
    // If invert is enabled
    if (invert) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        
        // Restore text to black in laser mode if black text is enabled
        if (laserMode && blackText && textMask) {
            console.log('Restoring text to black with white boxes around it');
            
            const width = canvas.width;
            const height = canvas.height;
            
            // First pass: create white boxes around text (dilate)
            const dilatedMask = new Uint8Array(textMask.length);
            const padding = 3; // pixels of white padding around text
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    
                    if (textMask[idx] === 1) {
                        // Mark this pixel and surrounding area
                        for (let dy = -padding; dy <= padding; dy++) {
                            for (let dx = -padding; dx <= padding; dx++) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    dilatedMask[ny * width + nx] = 1;
                                }
                            }
                        }
                    }
                }
            }
            
            // Second pass: fill dilated areas with white
            for (let i = 0; i < data.length; i += 4) {
                if (dilatedMask[i / 4] === 1) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                }
            }
            
            // Third pass: put black text on top
            for (let i = 0; i < data.length; i += 4) {
                if (textMask[i / 4] === 1) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }
        }
        
        // Force roads to black if enabled
        if (laserMode && blackRoads && roadMask) {
            console.log('Forcing roads to solid black');
            for (let i = 0; i < data.length; i += 4) {
                if (roadMask[i / 4] === 1) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }
        }
        
        // Force water to white if enabled
        if (laserMode && whiteWater && waterMask) {
            console.log('Forcing water to white');
            for (let i = 0; i < data.length; i += 4) {
                if (waterMask[i / 4] === 1) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                }
            }
        }
    }
    
    // Black Text with white box - works independently
    if (blackText && !invert) {
        console.log('Applying black text with white box outline');
        const width = canvas.width;
        const height = canvas.height;
        
        // Create text mask - detect black pixels (text)
        const textMask = new Uint8Array(data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
            // Black pixels are text
            textMask[i / 4] = (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) ? 1 : 0;
        }
        
        // Create white boxes around text
        const dilatedMask = new Uint8Array(textMask.length);
        const padding = 3; // pixels of white padding
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                if (textMask[idx] === 1) {
                    for (let dy = -padding; dy <= padding; dy++) {
                        for (let dx = -padding; dx <= padding; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                dilatedMask[ny * width + nx] = 1;
                            }
                        }
                    }
                }
            }
        }
        
        // Fill dilated areas with white
        for (let i = 0; i < data.length; i += 4) {
            if (dilatedMask[i / 4] === 1) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }
        
        // Put black text back on top
        for (let i = 0; i < data.length; i += 4) {
            if (textMask[i / 4] === 1) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
        }
    }
    
    // Apply thickening (morphological dilation) if enabled
    if (thickenText) {
        console.log('Applying text thickening:', thickenAmount + 'px');
        imageData = applyDilation(imageData, canvas.width, canvas.height, thickenAmount);
        data = imageData.data;
    }
    
    // Remove ferry lines and dashed routes if enabled
    if (removeFerryLines) {
        console.log('Removing dashed ferry lines');
        imageData = removeDashedLines(imageData, canvas.width, canvas.height);
        data = imageData.data;
    }
    
    // Put processed data back
    ctx.putImageData(imageData, 0, 0);
    
    // Apply envelope warp if enabled
    if (envelopeWarp > 0) {
        console.log('Applying envelope warp:', envelopeWarp + '%');
        const warpedCanvas = applyEnvelopeWarp(canvas, envelopeWarp);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(warpedCanvas, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    // Apply edge detection if enabled (but not if laser mode is already active)
    if (edgeDetection && !laserMode) {
        console.log('Applying edge detection...');
        imageData = applyEdgeDetection(imageData);
        // Put edge-detected data back
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Thicken coastlines/water boundaries if enabled
    if (thickenCoastlines) {
        console.log('Thickening coastlines with amount:', coastlineAmount);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const thickenedData = applyDilation(imageData, canvas.width, canvas.height, coastlineAmount);
        ctx.putImageData(thickenedData, 0, 0);
        imageData = thickenedData;
    }
    
    console.log('Processing complete!');
    
    // Return the processed imageData for use in editor
    return imageData;
}

/**
 * Apply Sobel edge detection
 * @param {ImageData} imageData - Input image data
 * @returns {ImageData} Edge-detected image data
 */
export function applyEdgeDetection(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    ctx.putImageData(imageData, 0, 0);
    
    const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dst = ctx.createImageData(canvas.width, canvas.height);
    
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    
    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                    const gray = src.data[idx];
                    pixelX += gray * sobelX[ky + 1][kx + 1];
                    pixelY += gray * sobelY[ky + 1][kx + 1];
                }
            }
            
            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            const idx = (y * canvas.width + x) * 4;
            const value = magnitude > 50 ? 0 : 255;
            
            dst.data[idx] = value;
            dst.data[idx + 1] = value;
            dst.data[idx + 2] = value;
            dst.data[idx + 3] = 255;
        }
    }
    
    return dst;
}

/**
 * Apply envelope warp (barrel distortion) to compensate for engraving curvature
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} warpLevel - Warp level 1-4 (percentage)
 * @returns {HTMLCanvasElement} Warped canvas
 */
export function applyEnvelopeWarp(sourceCanvas, warpLevel) {
    const warpCanvas = document.createElement('canvas');
    const warpCtx = warpCanvas.getContext('2d');
    
    warpCanvas.width = sourceCanvas.width;
    warpCanvas.height = sourceCanvas.height;
    
    const sourceData = sourceCanvas.getContext('2d').getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const destData = warpCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
    
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Warp strength: -1% to -4% creates barrel distortion (negative pincushion)
    const strength = -warpLevel * 0.01;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Normalize coordinates to -1 to 1
            const normX = (x - centerX) / centerX;
            const normY = (y - centerY) / centerY;
            
            // Calculate distance from center
            const distance = Math.sqrt(normX * normX + normY * normY);
            
            // Apply barrel distortion formula
            const distortionFactor = 1 + strength * distance * distance;
            
            // Calculate source coordinates
            const srcX = centerX + normX * centerX * distortionFactor;
            const srcY = centerY + normY * centerY * distortionFactor;
            
            // Bilinear interpolation for smooth results
            if (srcX >= 0 && srcX < width - 1 && srcY >= 0 && srcY < height - 1) {
                const x0 = Math.floor(srcX);
                const x1 = x0 + 1;
                const y0 = Math.floor(srcY);
                const y1 = y0 + 1;
                
                const fx = srcX - x0;
                const fy = srcY - y0;
                
                const destIndex = (y * width + x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    const i00 = (y0 * width + x0) * 4 + c;
                    const i10 = (y0 * width + x1) * 4 + c;
                    const i01 = (y1 * width + x0) * 4 + c;
                    const i11 = (y1 * width + x1) * 4 + c;
                    
                    const v0 = sourceData.data[i00] * (1 - fx) + sourceData.data[i10] * fx;
                    const v1 = sourceData.data[i01] * (1 - fx) + sourceData.data[i11] * fx;
                    
                    destData.data[destIndex + c] = v0 * (1 - fy) + v1 * fy;
                }
            } else {
                // Fill with white for out-of-bounds
                const destIndex = (y * width + x) * 4;
                destData.data[destIndex] = 255;
                destData.data[destIndex + 1] = 255;
                destData.data[destIndex + 2] = 255;
                destData.data[destIndex + 3] = 255;
            }
        }
    }
    
    warpCtx.putImageData(destData, 0, 0);
    return warpCanvas;
}

/**
 * Apply morphological dilation to thicken black features (text, lines)
 * @param {ImageData} imageData - Input image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} iterations - Number of dilation iterations (can be fractional)
 * @returns {ImageData} Dilated image data
 */
export function applyDilation(imageData, width, height, iterations) {
    const data = imageData.data;
    const result = new Uint8ClampedArray(data);
    
    // Handle fractional iterations by doing full iterations + weighted blend
    const fullIterations = Math.floor(iterations);
    const fraction = iterations - fullIterations;
    
    // Perform full dilation iterations
    for (let iter = 0; iter < fullIterations; iter++) {
        const temp = new Uint8ClampedArray(result);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Check if any neighbor is black (0)
                let hasBlackNeighbor = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        if (temp[nIdx] === 0) {
                            hasBlackNeighbor = true;
                            break;
                        }
                    }
                    if (hasBlackNeighbor) break;
                }
                
                // If any neighbor is black, make this pixel black
                if (hasBlackNeighbor) {
                    result[idx] = 0;
                    result[idx + 1] = 0;
                    result[idx + 2] = 0;
                }
            }
        }
    }
    
    // If there's a fractional part, apply partial dilation deterministically
    if (fraction > 0) {
        const temp = new Uint8ClampedArray(result);
        const partialResult = new Uint8ClampedArray(result);
        
        // Do one more full dilation
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                let hasBlackNeighbor = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        if (temp[nIdx] === 0) {
                            hasBlackNeighbor = true;
                            break;
                        }
                    }
                    if (hasBlackNeighbor) break;
                }
                
                if (hasBlackNeighbor) {
                    partialResult[idx] = 0;
                    partialResult[idx + 1] = 0;
                    partialResult[idx + 2] = 0;
                }
            }
        }
        
        // Deterministically blend based on pixel position and fraction
        // Use checkerboard pattern for 0.5, and denser patterns for other fractions
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Only process pixels that would change in the next iteration
                if (result[idx] === 255 && partialResult[idx] === 0) {
                    // Use deterministic pattern based on coordinates
                    // This creates a consistent dithering pattern
                    const pattern = ((x % 2) + (y % 2) * 2); // 0, 1, 2, 3 pattern
                    const threshold = pattern / 4; // 0, 0.25, 0.5, 0.75
                    
                    if (fraction > threshold) {
                        result[idx] = 0;
                        result[idx + 1] = 0;
                        result[idx + 2] = 0;
                    }
                }
            }
        }
    }
    
    // Copy result back to imageData
    for (let i = 0; i < data.length; i++) {
        data[i] = result[i];
    }
    
    return imageData;
}

/**
 * Remove ferry lines and dashed routes by detecting small isolated segments
 * @param {ImageData} imageData - Input image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {ImageData} Processed image data
 */
export function removeDashedLines(imageData, width, height) {
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const result = new Uint8ClampedArray(data);
    
    // Find all connected components of black pixels
    function floodFill(startX, startY) {
        const stack = [[startX, startY]];
        const component = [];
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const idx = y * width + x;
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (visited[idx]) continue;
            
            const pixelIdx = idx * 4;
            if (data[pixelIdx] !== 0) continue; // Not black
            
            visited[idx] = 1;
            component.push([x, y]);
            
            // Check 8-connected neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
            stack.push([x + 1, y + 1]);
            stack.push([x - 1, y - 1]);
            stack.push([x + 1, y - 1]);
            stack.push([x - 1, y + 1]);
        }
        
        return component;
    }
    
    // Analyze each connected component
    const componentsToRemove = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const pixelIdx = idx * 4;
            
            if (!visited[idx] && data[pixelIdx] === 0) {
                const component = floodFill(x, y);
                
                if (component.length > 0) {
                    // Calculate component characteristics
                    const minX = Math.min(...component.map(p => p[0]));
                    const maxX = Math.max(...component.map(p => p[0]));
                    const minY = Math.min(...component.map(p => p[1]));
                    const maxY = Math.max(...component.map(p => p[1]));
                    
                    const compWidth = maxX - minX + 1;
                    const compHeight = maxY - minY + 1;
                    const area = component.length;
                    const boundingArea = compWidth * compHeight;
                    const density = area / boundingArea;
                    
                    // Remove small isolated segments likely to be dashed lines
                    // Criteria: small area, low density (sparse), elongated
                    const maxDimension = Math.max(compWidth, compHeight);
                    const minDimension = Math.min(compWidth, compHeight);
                    const aspectRatio = maxDimension / (minDimension + 1);
                    
                    // Remove if:
                    // - Very small (< 100 pixels) and sparse (density < 0.3)
                    // - Small (< 500 pixels) and very elongated (aspect ratio > 10) and sparse
                    if ((area < 100 && density < 0.3) ||
                        (area < 500 && aspectRatio > 10 && density < 0.4)) {
                        componentsToRemove.push(component);
                    }
                }
            }
        }
    }
    
    // Remove the identified components
    for (const component of componentsToRemove) {
        for (const [x, y] of component) {
            const pixelIdx = (y * width + x) * 4;
            result[pixelIdx] = 255;
            result[pixelIdx + 1] = 255;
            result[pixelIdx + 2] = 255;
        }
    }
    
    // Copy result back to imageData
    for (let i = 0; i < data.length; i++) {
        data[i] = result[i];
    }
    
    return imageData;
}
