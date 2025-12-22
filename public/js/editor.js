// Editor Page JavaScript
import { processImage } from './canvas.js';

let originalImage = null;
let currentZoom = 1;
let settings = {
    threshold: 248,
    edgeDetection: false,
    invert: false,
    laserMode: false,
    thickenText: false,
    thickenAmount: 2,
    blackText: false,
    blackRoads: false,
    whiteWater: false,
    thickenCoastlines: false,
    coastlineAmount: 2
};

// Undo/Redo history
let settingsHistory = [];
let redoHistory = [];
let maxHistoryLength = 50;

// Load image data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    setupEventListeners();
    setupDragAndDrop();
    loadImageFromStorage();
});

function initializeEditor() {
    console.log('Editor initialized');
    updateStatusBar();
    
    // Load and apply preferences
    const prefs = JSON.parse(localStorage.getItem('editorPreferences') || '{}');
    
    // Apply rulers on load if preference set
    if (prefs.showRulersOnLoad) {
        setTimeout(() => {
            const hRuler = document.getElementById('rulerHorizontal');
            const vRuler = document.getElementById('rulerVertical');
            const corner = document.getElementById('rulerCorner');
            const btn = document.getElementById('toggleRulersBtn');
            if (hRuler && vRuler && corner) {
                hRuler.classList.add('visible');
                vRuler.classList.add('visible');
                corner.classList.add('visible');
                btn?.classList.add('active');
            }
        }, 100);
    }
    
    // Apply grid on load if preference set
    if (prefs.showGridOnLoad) {
        setTimeout(() => {
            const gridOverlay = document.getElementById('gridOverlay');
            const btn = document.getElementById('toggleGridBtn');
            if (gridOverlay) {
                gridOverlay.classList.add('visible');
                btn?.classList.add('active');
            }
        }, 100);
    }
}

function loadImageFromStorage() {
    console.log('loadImageFromStorage called');
    const imageData = localStorage.getItem('mapitImageData');
    const metadata = localStorage.getItem('mapitMetadata');
    
    console.log('Image data exists:', !!imageData);
    console.log('Image data length:', imageData ? imageData.length : 0);
    console.log('Metadata:', metadata);
    
    if (!imageData) {
        showError('No image data found. Please generate a map first.');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    console.log('Creating image element...');
    const img = new Image();
    img.onload = () => {
        console.log('Image loaded successfully!', img.width, 'x', img.height);
        originalImage = img;
        renderImage();
        
        // Draw original to overlay canvas
        const originalCanvas = document.getElementById('originalCanvas');
        const originalCtx = originalCanvas.getContext('2d');
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);
        
        // Update properties panel with enhanced metadata
        if (metadata) {
            const meta = JSON.parse(metadata);
            document.getElementById('mapLocation').textContent = meta.location || '--';
            
            // Store enhanced metadata for AI context
            window.mapMetadata = {
                location: meta.location,
                timestamp: meta.timestamp,
                dimensions: meta.dimensions,
                bbox: meta.bbox,
                style: meta.style || 'streets-v12',
                zoom: meta.zoom,
                // AI will use this context for smart suggestions
                processingHistory: []
            };
        }
        
        document.getElementById('imageDimensions').textContent = `${img.width}×${img.height}px`;
        updateFileSize();
        setStatus('Ready');
        
        // Update rulers and grid if visible
        if (document.getElementById('rulerHorizontal')?.classList.contains('visible')) {
            drawRulers();
        }
        if (document.getElementById('gridOverlay')?.classList.contains('visible')) {
            drawGrid();
        }
        
        // Initialize history with current state
        saveToHistory();
    };
    
    img.onerror = (e) => {
        console.error('Image load error:', e);
        showError('Failed to load image');
    };
    
    console.log('Setting image src...');
    img.src = imageData;
    console.log('Image src set');
}

function renderImage(skipHistory = false) {
    console.log('renderImage() called with settings:', settings);
    
    if (!originalImage) {
        console.error('No originalImage - returning');
        return;
    }
    
    // Save to history before rendering (unless we're undoing)
    if (!skipHistory) {
        saveToHistory();
    }
    
    setStatus('Processing...');
    showProcessing(true);
    
    const canvas = document.getElementById('editorCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    console.log('Processing image with settings:', settings);
    
    try {
        // Apply processing using canvas.js module (pass the image, not imageData)
        const processed = processImage(originalImage, settings);
        
        console.log('Processing complete, putting imageData to canvas');
        
        // Put processed data back
        ctx.putImageData(processed, 0, 0);
    } catch (error) {
        console.error('Error during processing:', error);
        showError('Processing failed: ' + error.message);
        showProcessing(false);
        return;
    }
    
    showProcessing(false);
    setStatus('Ready');
    updateFileSize();
    
    // Update rulers and grid if visible
    if (document.getElementById('rulerHorizontal')?.classList.contains('visible')) {
        drawRulers();
    }
    if (document.getElementById('gridOverlay')?.classList.contains('visible')) {
        drawGrid();
    }
}

function setupEventListeners() {
    // Quick presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyPreset(preset);
        });
    });
    
    // Menu actions
    document.getElementById('saveBtn').addEventListener('click', saveImage);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('backToMapBtn').addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // View controls
    document.getElementById('zoomInBtn').addEventListener('click', () => adjustZoom(0.1));
    document.getElementById('zoomOutBtn').addEventListener('click', () => adjustZoom(-0.1));
    document.getElementById('zoomFitBtn').addEventListener('click', () => setZoom(1));
    document.getElementById('zoomInControl').addEventListener('click', () => adjustZoom(0.1));
    document.getElementById('zoomOutControl').addEventListener('click', () => adjustZoom(-0.1));
    
    // Tool controls
    const contrastSlider = document.getElementById('contrastSlider');
    const contrastInput = document.getElementById('contrastInput');
    
    contrastSlider.addEventListener('input', (e) => {
        console.log('Contrast slider changed to:', e.target.value);
        settings.threshold = parseInt(e.target.value);
        contrastInput.value = settings.threshold;
        renderImage();
    });
    
    contrastInput.addEventListener('input', (e) => {
        console.log('Contrast input changed to:', e.target.value);
        settings.threshold = parseInt(e.target.value);
        contrastSlider.value = settings.threshold;
        renderImage();
    });
    
    // Up/Down stepper buttons for contrast
    document.getElementById('contrastUp').addEventListener('click', () => {
        settings.threshold = Math.min(255, settings.threshold + 1);
        contrastSlider.value = settings.threshold;
        contrastInput.value = settings.threshold;
        renderImage();
    });
    
    document.getElementById('contrastDown').addEventListener('click', () => {
        settings.threshold = Math.max(0, settings.threshold - 1);
        contrastSlider.value = settings.threshold;
        contrastInput.value = settings.threshold;
        renderImage();
    });
    
    // Mouse wheel on contrast controls to adjust quickly
    [contrastSlider, contrastInput].forEach(el => {
        el.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1; // Scroll down = decrease, scroll up = increase (by 1)
            settings.threshold = Math.max(0, Math.min(255, settings.threshold + delta));
            contrastSlider.value = settings.threshold;
            contrastInput.value = settings.threshold;
            renderImage();
        });
    });
    
    document.getElementById('edgeDetectionCheck').addEventListener('change', (e) => {
        settings.edgeDetection = e.target.checked;
        renderImage();
    });
    
    document.getElementById('invertCheck').addEventListener('change', (e) => {
        settings.invert = e.target.checked;
        renderImage();
    });
    
    document.getElementById('laserCheck').addEventListener('change', (e) => {
        settings.laserMode = e.target.checked;
        renderImage();
    });
    
    document.getElementById('thickenCheck').addEventListener('change', (e) => {
        settings.thickenText = e.target.checked;
        document.getElementById('thickenControls').style.display = e.target.checked ? 'block' : 'none';
        renderImage();
    });
    
    document.getElementById('thickenSlider').addEventListener('input', (e) => {
        settings.thickenAmount = parseFloat(e.target.value);
        document.getElementById('thickenInput').value = settings.thickenAmount;
        renderImage();
    });
    
    document.getElementById('thickenInput').addEventListener('input', (e) => {
        settings.thickenAmount = parseFloat(e.target.value);
        document.getElementById('thickenSlider').value = settings.thickenAmount;
        renderImage();
    });
    
    document.getElementById('blackTextCheck').addEventListener('change', (e) => {
        console.log('Black text checkbox changed to:', e.target.checked);
        settings.blackText = e.target.checked;
        renderImage();
    });
    
    document.getElementById('blackRoadsCheck').addEventListener('change', (e) => {
        settings.blackRoads = e.target.checked;
        renderImage();
    });
    
    document.getElementById('whiteWaterCheck').addEventListener('change', (e) => {
        settings.whiteWater = e.target.checked;
        renderImage();
    });
    
    // Layer controls
    document.getElementById('showProcessedLayer').addEventListener('change', (e) => {
        const editorCanvas = document.getElementById('editorCanvas');
        editorCanvas.style.opacity = e.target.checked ? '1' : '0';
    });
    
    document.getElementById('showOriginalLayer').addEventListener('change', (e) => {
        const originalCanvas = document.getElementById('originalCanvas');
        const opacityControls = document.getElementById('originalOpacityControls');
        if (e.target.checked) {
            const opacity = document.getElementById('originalOpacitySlider').value / 100;
            originalCanvas.style.opacity = opacity;
            opacityControls.style.display = 'block';
        } else {
            originalCanvas.style.opacity = '0';
            opacityControls.style.display = 'none';
        }
    });
    
    document.getElementById('originalOpacitySlider').addEventListener('input', (e) => {
        const originalCanvas = document.getElementById('originalCanvas');
        originalCanvas.style.opacity = e.target.value / 100;
    });
    
    document.getElementById('thickenCoastlinesCheck').addEventListener('change', (e) => {
        settings.thickenCoastlines = e.target.checked;
        document.getElementById('coastlineControls').style.display = e.target.checked ? 'block' : 'none';
        renderImage();
    });
    
    document.getElementById('coastlineSlider').addEventListener('input', (e) => {
        settings.coastlineAmount = parseInt(e.target.value);
        document.getElementById('coastlineInput').value = settings.coastlineAmount;
        renderImage();
    });
    
    document.getElementById('coastlineInput').addEventListener('input', (e) => {
        settings.coastlineAmount = parseInt(e.target.value);
        document.getElementById('coastlineSlider').value = settings.coastlineAmount;
        renderImage();
    });
    
    // Collapsible sections
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't collapse when dragging
            if (e.target.classList.contains('drag-handle')) return;
            
            const content = header.nextElementSibling;
            const btn = header.querySelector('.collapse-btn');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                btn.textContent = '−';
            } else {
                content.style.display = 'none';
                btn.textContent = '+';
            }
        });
    });
    
    // Menu Bar Actions
    document.getElementById('saveBtn').addEventListener('click', saveImage);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('backToMapBtn').addEventListener('click', () => window.location.href = '/');
    document.getElementById('newMapBtn').addEventListener('click', () => {
        if (confirm('Start a new map? Current work will be lost.')) {
            localStorage.removeItem('mapitImageData');
            localStorage.removeItem('mapitMetadata');
            window.location.href = '/';
        }
    });
    
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    
    document.getElementById('zoomInBtn').addEventListener('click', () => adjustZoom(0.1));
    document.getElementById('zoomOutBtn').addEventListener('click', () => adjustZoom(-0.1));
    document.getElementById('zoomFitBtn').addEventListener('click', () => setZoom(1));
    document.getElementById('toggleToolbarBtn').addEventListener('click', toggleToolbar);
    
    document.getElementById('resetBtn').addEventListener('click', resetToDefaults);
    document.getElementById('regenerateBtn').addEventListener('click', () => {
        if (confirm('Return to map selection to regenerate? Current edits will be saved.')) {
            // Settings are automatically saved in localStorage by browser
            window.location.href = '/';
        }
    });
    
    document.getElementById('aiSuggestBtn').addEventListener('click', showAISuggestions);
    document.getElementById('aiOptimizeBtn').addEventListener('click', showAutoOptimize);
    document.getElementById('aiDescribeBtn').addEventListener('click', showAIDescribe);
    
    document.getElementById('keyboardShortcutsBtn').addEventListener('click', showKeyboardShortcuts);
    document.getElementById('aboutBtn').addEventListener('click', showAbout);
    
    // New File menu items
    document.getElementById('saveJpgBtn')?.addEventListener('click', saveAsJPG);
    document.getElementById('exportSettingsBtn')?.addEventListener('click', exportSettings);
    document.getElementById('importSettingsBtn')?.addEventListener('click', importSettings);
    
    // New Edit menu items
    document.getElementById('duplicateBtn')?.addEventListener('click', duplicateSettings);
    document.getElementById('preferencesBtn')?.addEventListener('click', showPreferences);
    
    // Help menu items
    document.getElementById('keyboardShortcutsBtn')?.addEventListener('click', showKeyboardShortcuts);
    
    // New View menu items
    document.getElementById('zoomActualBtn')?.addEventListener('click', () => setZoom(1));
    document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
        // Fit to window - calculate optimal zoom
        const canvasArea = document.querySelector('.canvas-area');
        const canvas = document.getElementById('editorCanvas');
        const areaWidth = canvasArea.clientWidth - 40;
        const areaHeight = canvasArea.clientHeight - 40;
        const scaleX = areaWidth / canvas.width;
        const scaleY = areaHeight / canvas.height;
        const optimalZoom = Math.min(scaleX, scaleY, 1);
        setZoom(optimalZoom);
    });
    document.getElementById('toggleRulersBtn')?.addEventListener('click', toggleRulers);
    document.getElementById('toggleGridBtn')?.addEventListener('click', toggleGrid);
    document.getElementById('toggleGuidesBtn')?.addEventListener('click', toggleGuides);
    document.getElementById('clearGuidesBtn')?.addEventListener('click', clearAllGuides);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Arrow keys to adjust contrast (if not focused on input)
        if (e.key === 'ArrowUp' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            settings.threshold = Math.min(255, settings.threshold + 1);
            contrastSlider.value = settings.threshold;
            contrastInput.value = settings.threshold;
            renderImage();
        } else if (e.key === 'ArrowDown' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            settings.threshold = Math.max(0, settings.threshold - 1);
            contrastSlider.value = settings.threshold;
            contrastInput.value = settings.threshold;
            renderImage();
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 's':
                    if (e.shiftKey) {
                        e.preventDefault();
                        saveAsJPG();
                    } else {
                        e.preventDefault();
                        saveImage();
                    }
                    break;
                case 'd':
                    e.preventDefault();
                    duplicateSettings();
                    break;
                case 'e':
                    e.preventDefault();
                    exportSettings();
                    break;
                case 'i':
                    e.preventDefault();
                    importSettings();
                    break;
                case 'g':
                    e.preventDefault();
                    toggleGrid();
                    break;
                case 'h':
                    e.preventDefault();
                    document.getElementById('toggleToolbarBtn')?.click();
                    break;
                case 'r':
                    e.preventDefault();
                    toggleRulers();
                    break;
                case ';':
                    e.preventDefault();
                    toggleGuides();
                    break;
                case ',':
                    e.preventDefault();
                    showPreferences();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    adjustZoom(0.1);
                    break;
                case '-':
                    e.preventDefault();
                    adjustZoom(-0.1);
                    break;
                case '0':
                    e.preventDefault();
                    // Fit to window - calculate optimal zoom
                    const canvasArea = document.querySelector('.canvas-area');
                    const canvas = document.getElementById('editorCanvas');
                    const areaWidth = canvasArea.clientWidth - 40; // padding
                    const areaHeight = canvasArea.clientHeight - 40;
                    const scaleX = areaWidth / canvas.width;
                    const scaleY = areaHeight / canvas.height;
                    const optimalZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
                    setZoom(optimalZoom);
                    break;
                case '1':
                    e.preventDefault();
                    setZoom(1); // Actual size (100%)
                    break;
            }
        }
        
        // Non-Ctrl shortcuts
        if (!e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
            switch(e.key) {
                case 'Delete':
                    e.preventDefault();
                    clearAllGuides();
                    break;
                case 'Escape':
                    e.preventDefault();
                    // Close any open modals
                    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
                    break;
                case 'F1':
                    e.preventDefault();
                    showKeyboardShortcuts();
                    break;
                case 'F11':
                    // Let browser handle fullscreen
                    break;
            }
        }
    });
    
    // Mouse wheel zoom on canvas area
    const canvasArea = document.querySelector('.canvas-area');
    canvasArea.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1; // Scroll down = zoom out, scroll up = zoom in
        adjustZoom(delta);
    });
    
    // Pan tool (spacebar + drag)
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let panOffset = { x: 0, y: 0 };
    let spacebarDown = false;
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            spacebarDown = true;
            canvasArea.style.cursor = 'grab';
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spacebarDown = false;
            isPanning = false;
            canvasArea.style.cursor = 'default';
        }
    });
    
    canvasArea.addEventListener('mousedown', (e) => {
        if (spacebarDown) {
            isPanning = true;
            panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
            canvasArea.style.cursor = 'grabbing';
        }
    });
    
    canvasArea.addEventListener('mousemove', (e) => {
        if (isPanning) {
            panOffset = {
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            };
            const canvas = document.getElementById('editorCanvas');
            canvas.style.transform = `scale(${currentZoom}) translate(${panOffset.x / currentZoom}px, ${panOffset.y / currentZoom}px)`;
        }
    });
    
    canvasArea.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            canvasArea.style.cursor = spacebarDown ? 'grab' : 'default';
        }
    });
}

function adjustZoom(delta) {
    currentZoom = Math.max(0.1, Math.min(5, currentZoom + delta));
    setZoom(currentZoom);
}

function setZoom(zoom) {
    currentZoom = zoom;
    const canvas = document.getElementById('editorCanvas');
    canvas.style.transform = `scale(${currentZoom})`;
    document.getElementById('zoomLevel').textContent = `${Math.round(currentZoom * 100)}%`;
    document.getElementById('statusZoom').textContent = `${Math.round(currentZoom * 100)}%`;
}

function saveImage() {
    const canvas = document.getElementById('editorCanvas');
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `maprdy-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    setStatus('Image saved!');
    showToast('PNG image downloaded successfully', 'success', 'Saved');
}

function copyToClipboard() {
    const canvas = document.getElementById('editorCanvas');
    canvas.toBlob(blob => {
        navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
            setStatus('Copied to clipboard!');
            showToast('Image copied to clipboard', 'success', 'Copied');
        }).catch(err => {
            showError('Failed to copy: ' + err.message);
            showToast('Failed to copy to clipboard', 'error', 'Error');
        });
    });
}

function updateFileSize() {
    const canvas = document.getElementById('editorCanvas');
    const dataURL = canvas.toDataURL('image/png');
    const sizeKB = Math.round((dataURL.length * 0.75) / 1024);
    document.getElementById('fileSize').textContent = `${sizeKB} KB`;
}

function setStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

function showError(message) {
    setStatus('Error: ' + message);
    console.error(message);
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================

let toastContainer = null;

function initToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

function showToast(message, type = 'info', title = '', duration = 3000) {
    initToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon SVGs
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        info: 'Info',
        warning: 'Warning'
    };
    
    const toastTitle = title || defaultTitles[type];
    
    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-title">${toastTitle}</div>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-message">${message}</div>
        ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;
    
    toastContainer.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
}

function removeToast(toast) {
    toast.classList.add('toast-out');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ==========================================
// NEW MENU BAR FUNCTIONS
// ==========================================

// Ruler System
function drawRulers() {
    const canvas = document.getElementById('editorCanvas');
    const hRuler = document.getElementById('rulerHorizontal');
    const vRuler = document.getElementById('rulerVertical');
    
    if (!hRuler || !vRuler || !canvas) return;
    
    // Get preferences
    const prefs = JSON.parse(localStorage.getItem('editorPreferences') || '{}');
    const majorInterval = prefs.rulerInterval || 100;
    const minorInterval = majorInterval / 10;
    
    // Clear existing rulers
    hRuler.innerHTML = '';
    vRuler.innerHTML = '';
    
    // Draw horizontal ruler ticks
    for (let i = 0; i <= canvas.width; i += minorInterval) {
        const tick = document.createElement('div');
        tick.className = i % majorInterval === 0 ? 'ruler-tick ruler-tick-major horizontal' : 'ruler-tick horizontal';
        tick.style.left = `${i}px`;
        hRuler.appendChild(tick);
        
        // Add label at major intervals
        if (i % majorInterval === 0 && i > 0) {
            const label = document.createElement('div');
            label.className = 'ruler-label';
            label.textContent = i;
            label.style.left = `${i}px`;
            hRuler.appendChild(label);
        }
    }
    
    // Draw vertical ruler ticks
    for (let i = 0; i <= canvas.height; i += minorInterval) {
        const tick = document.createElement('div');
        tick.className = i % majorInterval === 0 ? 'ruler-tick ruler-tick-major vertical' : 'ruler-tick vertical';
        tick.style.top = `${i}px`;
        vRuler.appendChild(tick);
        
        // Add label at major intervals
        if (i % majorInterval === 0 && i > 0) {
            const label = document.createElement('div');
            label.className = 'ruler-label vertical-label';
            label.textContent = i;
            label.style.top = `${i}px`;
            vRuler.appendChild(label);
        }
    }
}

function toggleRulers() {
    const hRuler = document.getElementById('rulerHorizontal');
    const vRuler = document.getElementById('rulerVertical');
    const corner = document.getElementById('rulerCorner');
    const btn = document.getElementById('toggleRulersBtn');
    
    if (!hRuler || !vRuler || !corner) return;
    
    const isVisible = hRuler.classList.toggle('visible');
    vRuler.classList.toggle('visible');
    corner.classList.toggle('visible');
    btn?.classList.toggle('active');
    
    if (isVisible) {
        drawRulers();
        showToast('Rulers enabled', 'info');
    } else {
        showToast('Rulers disabled', 'info');
    }
}

// Grid System
function drawGrid() {
    const gridCanvas = document.getElementById('gridCanvas');
    const canvas = document.getElementById('editorCanvas');
    
    if (!gridCanvas || !canvas) return;
    
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
    
    const ctx = gridCanvas.getContext('2d');
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    
    // Get preferences
    const prefs = JSON.parse(localStorage.getItem('editorPreferences') || '{}');
    const spacing = prefs.gridSpacing || 50;
    const opacity = (prefs.gridOpacity || 10) / 100;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function toggleGrid() {
    const gridOverlay = document.getElementById('gridOverlay');
    const btn = document.getElementById('toggleGridBtn');
    
    if (!gridOverlay) return;
    
    const isVisible = gridOverlay.classList.toggle('visible');
    btn?.classList.toggle('active');
    
    if (isVisible) {
        showToast('Grid enabled', 'info');
        drawGrid();
    } else {
        showToast('Grid disabled', 'info');
    }
}

function toggleGuides() {
    const btn = document.getElementById('toggleGuidesBtn');
    const isActive = btn?.classList.toggle('active');
    
    if (isActive) {
        enableGuides();
    } else {
        disableGuides();
    }
}

let guidesEnabled = false;
let guides = { horizontal: [], vertical: [] };
let draggedGuide = null;

function enableGuides() {
    guidesEnabled = true;
    
    // Add event listeners to rulers for guide creation
    const hRuler = document.getElementById('rulerHorizontal');
    const vRuler = document.getElementById('rulerVertical');
    
    if (hRuler) {
        hRuler.style.cursor = 'ns-resize';
        hRuler.addEventListener('mousedown', startDragHorizontalGuide);
    }
    if (vRuler) {
        vRuler.style.cursor = 'ew-resize';
        vRuler.addEventListener('mousedown', startDragVerticalGuide);
    }
    
    setStatus('Guides enabled - Drag from rulers to create guides');
}

function disableGuides() {
    guidesEnabled = false;
    
    const hRuler = document.getElementById('rulerHorizontal');
    const vRuler = document.getElementById('rulerVertical');
    
    if (hRuler) {
        hRuler.style.cursor = 'default';
        hRuler.removeEventListener('mousedown', startDragHorizontalGuide);
    }
    if (vRuler) {
        vRuler.style.cursor = 'default';
        vRuler.removeEventListener('mousedown', startDragVerticalGuide);
    }
    
    // Clear all guides
    guides.horizontal = [];
    guides.vertical = [];
    renderGuides();
    setStatus('Guides disabled');
}

function startDragHorizontalGuide(e) {
    if (!guidesEnabled) return;
    
    const canvasArea = document.querySelector('.canvas-area');
    const rect = canvasArea.getBoundingClientRect();
    const y = e.clientY - rect.top - 20; // Subtract ruler height
    
    if (y < 0) return;
    
    draggedGuide = { type: 'horizontal', position: y, isNew: true };
    
    document.addEventListener('mousemove', dragGuide);
    document.addEventListener('mouseup', stopDragGuide);
    
    renderGuides();
}

function startDragVerticalGuide(e) {
    if (!guidesEnabled) return;
    
    const canvasArea = document.querySelector('.canvas-area');
    const rect = canvasArea.getBoundingClientRect();
    const x = e.clientX - rect.left - 20; // Subtract ruler width
    
    if (x < 0) return;
    
    draggedGuide = { type: 'vertical', position: x, isNew: true };
    
    document.addEventListener('mousemove', dragGuide);
    document.addEventListener('mouseup', stopDragGuide);
    
    renderGuides();
}

function dragGuide(e) {
    if (!draggedGuide) return;
    
    const canvasArea = document.querySelector('.canvas-area');
    const rect = canvasArea.getBoundingClientRect();
    
    if (draggedGuide.type === 'horizontal') {
        draggedGuide.position = e.clientY - rect.top - 20;
    } else {
        draggedGuide.position = e.clientX - rect.left - 20;
    }
    
    renderGuides();
}

function stopDragGuide() {
    if (draggedGuide) {
        // Add to permanent guides if within canvas bounds
        const canvas = document.getElementById('editorCanvas');
        
        if (draggedGuide.type === 'horizontal' && draggedGuide.position >= 0 && draggedGuide.position <= canvas.height) {
            guides.horizontal.push(draggedGuide.position);
        } else if (draggedGuide.type === 'vertical' && draggedGuide.position >= 0 && draggedGuide.position <= canvas.width) {
            guides.vertical.push(draggedGuide.position);
        }
        
        draggedGuide = null;
    }
    
    document.removeEventListener('mousemove', dragGuide);
    document.removeEventListener('mouseup', stopDragGuide);
    
    renderGuides();
}

function renderGuides() {
    // Remove existing guide elements
    document.querySelectorAll('.guide-line').forEach(el => el.remove());
    
    if (!guidesEnabled) return;
    
    const canvasArea = document.querySelector('.canvas-area');
    
    // Render horizontal guides
    guides.horizontal.forEach(y => {
        const line = document.createElement('div');
        line.className = 'guide-line guide-horizontal';
        line.style.top = `${y + 20}px`;
        canvasArea.appendChild(line);
    });
    
    // Render vertical guides
    guides.vertical.forEach(x => {
        const line = document.createElement('div');
        line.className = 'guide-line guide-vertical';
        line.style.left = `${x + 20}px`;
        canvasArea.appendChild(line);
    });
    
    // Render dragged guide
    if (draggedGuide) {
        const line = document.createElement('div');
        line.className = 'guide-line guide-dragging';
        
        if (draggedGuide.type === 'horizontal') {
            line.classList.add('guide-horizontal');
            line.style.top = `${draggedGuide.position + 20}px`;
        } else {
            line.classList.add('guide-vertical');
            line.style.left = `${draggedGuide.position + 20}px`;
        }
        
        canvasArea.appendChild(line);
    }
}

function toggleGuides_old() {
    const btn = document.getElementById('toggleGuidesBtn');
    btn?.classList.toggle('active');
    setStatus('Guides feature coming soon');
}

function clearAllGuides() {
    guides.horizontal = [];
    guides.vertical = [];
    renderGuides();
    setStatus('All guides cleared');
    showToast('All guides cleared', 'success');
}

function applyPreset(presetName) {
    const presets = {
        laser: {
            brightness: 0,
            contrast: 0,
            threshold: 128,
            blur: 0,
            smooth: 0,
            thicken: 2,
            edgeDetection: false,
            laserMode: true,
            name: 'Laser Engraving'
        },
        print: {
            brightness: 0,
            contrast: 20,
            threshold: 160,
            blur: 0,
            smooth: 1,
            thicken: 1,
            edgeDetection: false,
            laserMode: false,
            name: 'High Contrast Print'
        },
        detailed: {
            brightness: 0,
            contrast: 10,
            threshold: 140,
            blur: 0,
            smooth: 2,
            thicken: 0,
            edgeDetection: true,
            laserMode: false,
            name: 'Detailed'
        },
        clean: {
            brightness: 0,
            contrast: 30,
            threshold: 200,
            blur: 1,
            smooth: 3,
            thicken: 0,
            edgeDetection: false,
            laserMode: false,
            name: 'Clean Minimal'
        }
    };
    
    const preset = presets[presetName];
    if (!preset) return;
    
    // Apply all settings
    if (document.getElementById('brightnessSlider')) {
        document.getElementById('brightnessSlider').value = preset.brightness;
        document.getElementById('brightnessValue').textContent = preset.brightness;
    }
    if (document.getElementById('contrastSlider')) {
        document.getElementById('contrastSlider').value = preset.contrast;
        document.getElementById('contrastValue').textContent = preset.contrast;
    }
    if (document.getElementById('thresholdSlider')) {
        document.getElementById('thresholdSlider').value = preset.threshold;
        document.getElementById('thresholdValue').textContent = preset.threshold;
    }
    if (document.getElementById('blurSlider')) {
        document.getElementById('blurSlider').value = preset.blur;
        document.getElementById('blurValue').textContent = preset.blur;
    }
    if (document.getElementById('smoothSlider')) {
        document.getElementById('smoothSlider').value = preset.smooth;
        document.getElementById('smoothValue').textContent = preset.smooth;
    }
    if (document.getElementById('thickenSlider')) {
        document.getElementById('thickenSlider').value = preset.thicken;
        document.getElementById('thickenValue').textContent = preset.thicken;
    }
    if (document.getElementById('edgeDetectionToggle')) {
        document.getElementById('edgeDetectionToggle').checked = preset.edgeDetection;
    }
    if (document.getElementById('laserModeToggle')) {
        document.getElementById('laserModeToggle').checked = preset.laserMode;
    }
    
    // Trigger processing
    processImage();
    setStatus(`${preset.name} preset applied!`);
    showToast(`${preset.name} preset applied`, 'success', 'Preset Applied');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// File Menu Functions
function saveAsJPG() {
    const canvas = document.getElementById('editorCanvas');
    const dataURL = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = 'map_' + Date.now() + '.jpg';
    link.href = dataURL;
    link.click();
    setStatus('Image saved as JPG!');
}

function exportSettings() {
    const settings = {
        brightness: document.getElementById('brightnessSlider')?.value,
        contrast: document.getElementById('contrastSlider')?.value,
        threshold: document.getElementById('thresholdSlider')?.value,
        blur: document.getElementById('blurSlider')?.value,
        smooth: document.getElementById('smoothSlider')?.value,
        thicken: document.getElementById('thickenSlider')?.value,
        edgeDetection: document.getElementById('edgeDetectionToggle')?.checked,
        laserMode: document.getElementById('laserModeToggle')?.checked,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'map_settings_' + Date.now() + '.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Settings exported!');
    showToast('Settings exported successfully', 'success', 'Exported');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const settings = JSON.parse(event.target.result);
                
                // Apply settings and update displays
                if (settings.brightness !== undefined) {
                    const slider = document.getElementById('brightnessSlider');
                    slider.value = settings.brightness;
                    document.getElementById('brightnessValue').textContent = settings.brightness;
                }
                if (settings.contrast !== undefined) {
                    const slider = document.getElementById('contrastSlider');
                    slider.value = settings.contrast;
                    document.getElementById('contrastValue').textContent = settings.contrast;
                }
                if (settings.threshold !== undefined) {
                    const slider = document.getElementById('thresholdSlider');
                    slider.value = settings.threshold;
                    document.getElementById('thresholdValue').textContent = settings.threshold;
                }
                if (settings.blur !== undefined) {
                    const slider = document.getElementById('blurSlider');
                    slider.value = settings.blur;
                    document.getElementById('blurValue').textContent = settings.blur;
                }
                if (settings.smooth !== undefined) {
                    const slider = document.getElementById('smoothSlider');
                    slider.value = settings.smooth;
                    document.getElementById('smoothValue').textContent = settings.smooth;
                }
                if (settings.thicken !== undefined) {
                    const slider = document.getElementById('thickenSlider');
                    slider.value = settings.thicken;
                    document.getElementById('thickenValue').textContent = settings.thicken;
                }
                if (settings.edgeDetection !== undefined) {
                    document.getElementById('edgeDetectionToggle').checked = settings.edgeDetection;
                }
                if (settings.laserMode !== undefined) {
                    document.getElementById('laserModeToggle').checked = settings.laserMode;
                }
                
                // Trigger processing
                processImage();
                setStatus('Settings imported and applied!');
                showToast('Settings imported and applied successfully', 'success', 'Imported');
            } catch (err) {
                showError('Invalid settings file: ' + err.message);
                showToast('Failed to import settings: ' + err.message, 'error', 'Import Failed');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Edit Menu Functions
function duplicateSettings() {
    const settings = {
        brightness: document.getElementById('brightnessSlider')?.value,
        contrast: document.getElementById('contrastSlider')?.value,
        threshold: document.getElementById('thresholdSlider')?.value,
        blur: document.getElementById('blurSlider')?.value,
        smooth: document.getElementById('smoothSlider')?.value,
        thicken: document.getElementById('thickenSlider')?.value,
        edgeDetection: document.getElementById('edgeDetectionToggle')?.checked,
        laserMode: document.getElementById('laserModeToggle')?.checked
    };
    
    const settingsText = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(settingsText).then(() => {
        setStatus('Settings copied to clipboard!');
        showToast('Settings copied to clipboard', 'success', 'Duplicated');
    }).catch(err => {
        showError('Failed to copy: ' + err.message);
        showToast('Failed to copy settings', 'error', 'Error');
    });
}

function showPreferences() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Preferences</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="preferences-section">
                    <h3>Grid Settings</h3>
                    <div class="preference-item">
                        <label>Grid Spacing</label>
                        <select id="prefGridSpacing" class="pref-select">
                            <option value="25">25 pixels</option>
                            <option value="50" selected>50 pixels</option>
                            <option value="100">100 pixels</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Grid Color Opacity</label>
                        <input type="range" id="prefGridOpacity" min="5" max="30" value="10" step="5">
                        <span id="gridOpacityValue">10%</span>
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h3>Ruler Settings</h3>
                    <div class="preference-item">
                        <label>Ruler Units</label>
                        <select id="prefRulerUnits" class="pref-select">
                            <option value="px" selected>Pixels</option>
                            <option value="in">Inches</option>
                            <option value="cm">Centimeters</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Major Tick Interval</label>
                        <select id="prefRulerInterval" class="pref-select">
                            <option value="50">50 px</option>
                            <option value="100" selected>100 px</option>
                            <option value="200">200 px</option>
                        </select>
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h3>View Settings</h3>
                    <div class="preference-item">
                        <label>Default Zoom</label>
                        <select id="prefDefaultZoom" class="pref-select">
                            <option value="0.5">50%</option>
                            <option value="1" selected>100%</option>
                            <option value="1.5">150%</option>
                            <option value="2">200%</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="prefShowRulersOnLoad">
                            Show rulers on load
                        </label>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="prefShowGridOnLoad">
                            Show grid on load
                        </label>
                    </div>
                </div>
                
                <div class="preferences-footer">
                    <button class="modal-btn" id="resetPreferences">Reset to Defaults</button>
                    <button class="modal-btn modal-btn-primary" id="savePreferences">Save & Apply</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Load saved preferences
    const prefs = JSON.parse(localStorage.getItem('editorPreferences') || '{}');
    if (prefs.gridSpacing) document.getElementById('prefGridSpacing').value = prefs.gridSpacing;
    if (prefs.gridOpacity) {
        document.getElementById('prefGridOpacity').value = prefs.gridOpacity;
        document.getElementById('gridOpacityValue').textContent = prefs.gridOpacity + '%';
    }
    if (prefs.rulerUnits) document.getElementById('prefRulerUnits').value = prefs.rulerUnits;
    if (prefs.rulerInterval) document.getElementById('prefRulerInterval').value = prefs.rulerInterval;
    if (prefs.defaultZoom) document.getElementById('prefDefaultZoom').value = prefs.defaultZoom;
    if (prefs.showRulersOnLoad) document.getElementById('prefShowRulersOnLoad').checked = prefs.showRulersOnLoad;
    if (prefs.showGridOnLoad) document.getElementById('prefShowGridOnLoad').checked = prefs.showGridOnLoad;
    
    // Grid opacity slider update
    document.getElementById('prefGridOpacity').addEventListener('input', (e) => {
        document.getElementById('gridOpacityValue').textContent = e.target.value + '%';
    });
    
    // Save button
    document.getElementById('savePreferences').addEventListener('click', () => {
        const newPrefs = {
            gridSpacing: parseInt(document.getElementById('prefGridSpacing').value),
            gridOpacity: parseInt(document.getElementById('prefGridOpacity').value),
            rulerUnits: document.getElementById('prefRulerUnits').value,
            rulerInterval: parseInt(document.getElementById('prefRulerInterval').value),
            defaultZoom: parseFloat(document.getElementById('prefDefaultZoom').value),
            showRulersOnLoad: document.getElementById('prefShowRulersOnLoad').checked,
            showGridOnLoad: document.getElementById('prefShowGridOnLoad').checked
        };
        localStorage.setItem('editorPreferences', JSON.stringify(newPrefs));
        
        // Apply immediately
        if (document.getElementById('gridOverlay')?.classList.contains('visible')) {
            drawGrid();
        }
        if (document.getElementById('rulerHorizontal')?.classList.contains('visible')) {
            drawRulers();
        }
        
        setStatus('Preferences saved!');
        modal.remove();
    });
    
    // Reset button
    document.getElementById('resetPreferences').addEventListener('click', () => {
        localStorage.removeItem('editorPreferences');
        setStatus('Preferences reset to defaults');
        modal.remove();
    });
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showPreferences_old() {
    setStatus('Preferences dialog coming soon');
}

// ==========================================
// END NEW MENU BAR FUNCTIONS
// ==========================================

function showProcessing(show) {
    document.getElementById('processingIndicator').style.display = show ? 'flex' : 'none';

}

function updateStatusBar() {
    if (originalImage) {
        document.getElementById('statusDimensions').textContent = 
            `${originalImage.width}×${originalImage.height}px`;
    }
}

// ============================================================================
// MENU BAR FUNCTIONS
// ============================================================================

function toggleToolbar() {
    const toolbar = document.querySelector('.right-toolbar');
    if (toolbar.style.display === 'none') {
        toolbar.style.display = 'block';
        setStatus('Toolbar shown');
    } else {
        toolbar.style.display = 'none';
        setStatus('Toolbar hidden');
    }
}

function resetToDefaults() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    
    // Reset settings object
    settings.threshold = 248;
    settings.edgeDetection = false;
    settings.invert = false;
    settings.laserMode = false;
    settings.thickenText = false;
    settings.thickenAmount = 2;
    settings.blackText = false;
    settings.blackRoads = false;
    settings.whiteWater = false;
    settings.thickenCoastlines = false;
    settings.coastlineAmount = 2;
    
    // Update UI
    document.getElementById('contrastSlider').value = 248;
    document.getElementById('contrastInput').value = 248;
    document.getElementById('edgeDetectionCheck').checked = false;
    document.getElementById('invertCheck').checked = false;
    document.getElementById('laserCheck').checked = false;
    document.getElementById('blackTextCheck').checked = false;
    document.getElementById('blackRoadsCheck').checked = false;
    document.getElementById('whiteWaterCheck').checked = false;
    document.getElementById('thickenCheck').checked = false;
    document.getElementById('thickenInput').value = 2;
    document.getElementById('thickenSlider').value = 2;
    document.getElementById('thickenCoastlinesCheck').checked = false;
    document.getElementById('coastlineInput').value = 2;
    document.getElementById('coastlineSlider').value = 2;
    
    // Hide conditional controls
    document.getElementById('thickenControls').style.display = 'none';
    document.getElementById('coastlineControls').style.display = 'none';
    
    // Clear history and save new state
    settingsHistory = [];
    saveToHistory();
    
    renderImage(true);
    setStatus('Reset to defaults');
}

function showKeyboardShortcuts() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Keyboard Shortcuts</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="shortcuts-grid">
                    <div class="shortcut-section">
                        <h3>File</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+S</span>
                            <span>Save Image (PNG)</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+Shift+S</span>
                            <span>Save as JPG</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+E</span>
                            <span>Export Settings</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+I</span>
                            <span>Import Settings</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>Edit</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+Z</span>
                            <span>Undo</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+Y</span>
                            <span>Redo</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+D</span>
                            <span>Duplicate Settings</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+,</span>
                            <span>Preferences</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>View</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+R</span>
                            <span>Toggle Rulers</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+G</span>
                            <span>Toggle Grid</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+;</span>
                            <span>Toggle Guides</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+H</span>
                            <span>Toggle Toolbar</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+1</span>
                            <span>Actual Size (100%)</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+0</span>
                            <span>Fit to Window</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">+</span>
                            <span>Zoom In</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">-</span>
                            <span>Zoom Out</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">F11</span>
                            <span>Fullscreen</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>Adjustments</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">↑</span>
                            <span>Increase Contrast</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">↓</span>
                            <span>Decrease Contrast</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>Navigation</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Mouse Wheel</span>
                            <span>Zoom Canvas</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Space + Drag</span>
                            <span>Pan Canvas</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>Other</h3>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Delete</span>
                            <span>Clear All Guides</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Escape</span>
                            <span>Close Modal/Cancel</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">F1</span>
                            <span>Show This Help</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showAbout() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>About M A P R D Y</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="about-content">
                    <div class="about-logo">
                        <div style="background: white; padding: 8px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                            <img src="maprdylogo.svg" width="64" height="54" alt="maprdy">
                        </div>
                    </div>
                    <h3 style="letter-spacing: 0.15em; margin-top: 1rem;">M A P R D Y</h3>
                    <p style="font-weight: 600; color: #4a90e2;">Map to Laser Ready</p>
                    <p>Version 1.0.0</p>
                    <p>Transform maps into laser-ready artwork</p>
                    <div class="about-divider"></div>
                    <p><strong>Built with:</strong> Leaflet, Mapbox, OpenAI, Canvas API</p>
                    <p><strong>Features:</strong> Real-time processing, AI optimization, professional controls</p>
                    <div class="about-divider"></div>
                    <p>Visit us at <a href="https://maprdy.com" target="_blank" style="color: #4a90e2;">maprdy.com</a></p>
                    <p>© 2025 maprdy. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showAISuggestions() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                        <rect x="4" y="4" width="16" height="16" rx="2"/>
                        <rect x="9" y="9" width="6" height="6"/>
                        <path d="M9 2V4M15 2V4M9 20V22M15 20V22M2 9H4M2 15H4M20 9H22M20 15H22" stroke-linecap="round"/>
                    </svg>
                    <h2>AI Suggestions</h2>
                </div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #888; margin-bottom: 20px;">What would you like suggestions for?</p>
                <div style="display: grid; gap: 12px;">
                    <button class="suggestion-btn" data-type="laser" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: left;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                        <div>
                            <strong style="display: block; color: #333; margin-bottom: 4px;">Laser Engraving</strong>
                            <small style="color: #888;">Optimize for clean, engraveable output</small>
                        </div>
                    </button>
                    <button class="suggestion-btn" data-type="print" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: left;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"/>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect x="6" y="14" width="12" height="8"/>
                        </svg>
                        <div>
                            <strong style="display: block; color: #333; margin-bottom: 4px;">Wall Art / Print</strong>
                            <small style="color: #888;">Balanced detail for posters and canvas</small>
                        </div>
                    </button>
                    <button class="suggestion-btn" data-type="artistic" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: left;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <div>
                            <strong style="display: block; color: #333; margin-bottom: 4px;">Artistic / Stylized</strong>
                            <small style="color: #888;">Creative effects and high contrast</small>
                        </div>
                    </button>
                    <button class="suggestion-btn" data-type="detailed" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: left;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                            <path d="M11 8v6M8 11h6"/>
                        </svg>
                        <div>
                            <strong style="display: block; color: #333; margin-bottom: 4px;">Maximum Detail</strong>
                            <small style="color: #888;">Preserve as much information as possible</small>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add hover effects
    const suggestionBtns = modal.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = '#4a90e2';
            btn.style.backgroundColor = '#f5f9ff';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = '#e0e0e0';
            btn.style.backgroundColor = 'white';
        });
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            modal.remove();
            applyAISuggestion(type);
        });
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function applyAISuggestion(type) {
    saveToHistory();
    
    const suggestions = {
        laser: {
            threshold: 210,
            laserMode: true,
            blackText: true,
            blackRoads: true,
            thickenText: true,
            thickenAmount: 1,
            edgeDetection: false,
            invert: false,
            whiteWater: false
        },
        print: {
            threshold: 170,
            laserMode: false,
            blackText: false,
            blackRoads: false,
            thickenText: false,
            edgeDetection: false,
            invert: false,
            whiteWater: true
        },
        artistic: {
            threshold: 195,
            laserMode: false,
            blackText: true,
            blackRoads: true,
            thickenText: false,
            edgeDetection: true,
            invert: false,
            whiteWater: false
        },
        detailed: {
            threshold: 150,
            laserMode: false,
            blackText: false,
            blackRoads: false,
            thickenText: false,
            edgeDetection: false,
            invert: false,
            whiteWater: true
        }
    };
    
    const suggestion = suggestions[type];
    if (suggestion) {
        Object.assign(settings, suggestion);
        updateAllControls();
        renderImage();
        showSuccess(`Applied ${type} optimization settings`);
    }
}

function showAutoOptimize() {
    saveToHistory();
    
    // Analyze current settings and make intelligent adjustments
    const avgBrightness = analyzeImageBrightness();
    
    if (avgBrightness > 180) {
        // Bright image - needs higher threshold
        settings.threshold = Math.min(230, settings.threshold + 20);
    } else if (avgBrightness < 100) {
        // Dark image - needs lower threshold
        settings.threshold = Math.max(140, settings.threshold - 20);
    } else {
        // Medium brightness - optimize for clarity
        settings.threshold = 190;
    }
    
    // Auto-enable helpful features
    if (!settings.blackText && !settings.laserMode) {
        settings.blackText = true;
    }
    
    updateAllControls();
    renderImage();
    showSuccess('Auto-optimized image based on content analysis');
}

function analyzeImageBrightness() {
    const canvas = document.getElementById('originalCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
        total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    
    return total / (data.length / 4);
}

function showAIDescribe() {
    const metadata = JSON.parse(localStorage.getItem('mapitMetadata') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <h2>Map Description</h2>
                </div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div style="background: #f5f5f5; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #666; text-transform: uppercase;">Image Properties</h3>
                    <div style="display: grid; gap: 8px; color: #333;">
                        <div style="display: flex; justify-content: space-between;">
                            <span><strong>Dimensions:</strong></span>
                            <span>${metadata.width || 'Unknown'} × ${metadata.height || 'Unknown'}px</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><strong>Aspect Ratio:</strong></span>
                            <span>${metadata.aspect || 'Unknown'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span><strong>Map Style:</strong></span>
                            <span>${metadata.mapStyle || 'Standard'}</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f4fd; padding: 16px; border-radius: 4px; border-left: 4px solid #4a90e2;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #4a90e2;">Current Processing</h3>
                    <div style="display: grid; gap: 6px; color: #555; font-size: 14px;">
                        <div>• Contrast Threshold: <strong>${settings.threshold}</strong></div>
                        ${settings.laserMode ? '<div>• <strong>Laser Mode</strong> enabled</div>' : ''}
                        ${settings.edgeDetection ? '<div>• <strong>Edge Detection</strong> active</div>' : ''}
                        ${settings.blackText ? '<div>• <strong>Black Text</strong> enhancement</div>' : ''}
                        ${settings.blackRoads ? '<div>• <strong>Black Roads</strong> enabled</div>' : ''}
                        ${settings.invert ? '<div>• <strong>Inverted</strong> colors</div>' : ''}
                        ${settings.thickenText ? `<div>• Text thickening (<strong>${settings.thickenAmount}px</strong>)</div>` : ''}
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding: 12px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>💡 Tip:</strong> Use <strong>AI > Get Suggestions</strong> for optimized settings based on your intended use case.
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function updateAllControls() {
    // Update all control values to match settings
    const contrastSlider = document.getElementById('contrastSlider');
    const contrastInput = document.getElementById('contrastValue');
    
    if (contrastSlider) contrastSlider.value = settings.threshold;
    if (contrastInput) contrastInput.value = settings.threshold;
    
    // Update checkboxes
    const checkboxes = {
        'edgeDetection': settings.edgeDetection,
        'invertColors': settings.invert,
        'laserMode': settings.laserMode,
        'thickenText': settings.thickenText,
        'blackText': settings.blackText,
        'blackRoads': settings.blackRoads,
        'whiteWater': settings.whiteWater,
        'thickenCoastlines': settings.thickenCoastlines
    };
    
    Object.entries(checkboxes).forEach(([id, value]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = value;
    });
    
    // Update thicken amounts
    const thickenAmountInput = document.getElementById('thickenAmount');
    const coastlineAmountInput = document.getElementById('coastlineAmount');
    
    if (thickenAmountInput) thickenAmountInput.value = settings.thickenAmount;
    if (coastlineAmountInput) coastlineAmountInput.value = settings.coastlineAmount;
}

// ============================================================================
// UNDO/REDO FUNCTIONALITY
// ============================================================================

function saveToHistory() {
    // Clone current settings
    const snapshot = JSON.parse(JSON.stringify(settings));
    settingsHistory.push(snapshot);
    
    // Keep only last N entries
    if (settingsHistory.length > maxHistoryLength) {
        settingsHistory.shift();
    }
    
    // Clear redo history when new action is performed
    redoHistory = [];
    
    // Update history count display
    updateHistoryCount();
    
    console.log('State saved to history. Total states:', settingsHistory.length);
}

function updateHistoryCount() {
    const historyCountElement = document.getElementById('historyCount');
    if (historyCountElement) {
        historyCountElement.textContent = `${settingsHistory.length} / ${maxHistoryLength}`;
    }
}

function undo() {
    if (settingsHistory.length <= 1) {
        console.log('Cannot undo - no previous state');
        return;
    }
    
    // Save current state to redo history before undoing
    const currentState = settingsHistory.pop();
    redoHistory.push(currentState);
    
    // Get previous state
    const previousSettings = settingsHistory[settingsHistory.length - 1];
    
    // Restore all settings
    Object.assign(settings, previousSettings);
    
    // Update all UI controls to match restored settings
    document.getElementById('contrastSlider').value = settings.threshold;
    document.getElementById('contrastInput').value = settings.threshold;
    document.getElementById('edgeDetectionCheck').checked = settings.edgeDetection;
    document.getElementById('invertCheck').checked = settings.invert;
    document.getElementById('laserCheck').checked = settings.laserMode;
    document.getElementById('blackTextCheck').checked = settings.blackText;
    document.getElementById('blackRoadsCheck').checked = settings.blackRoads;
    document.getElementById('whiteWaterCheck').checked = settings.whiteWater;
    document.getElementById('thickenCheck').checked = settings.thickenText;
    document.getElementById('thickenInput').value = settings.thickenAmount;
    document.getElementById('thickenSlider').value = settings.thickenAmount;
    document.getElementById('thickenCoastlinesCheck').checked = settings.thickenCoastlines;
    document.getElementById('coastlineInput').value = settings.coastlineAmount;
    document.getElementById('coastlineSlider').value = settings.coastlineAmount;
    
    // Toggle visibility of conditional controls
    document.getElementById('thickenControls').style.display = settings.thickenText ? 'block' : 'none';
    document.getElementById('coastlineControls').style.display = settings.thickenCoastlines ? 'block' : 'none';
    
    console.log('Undo - restored to previous state:', settings);
    
    // Update history count
    updateHistoryCount();
    
    // Re-render with skipHistory=true to prevent saving this restoration
    renderImage(true);
}

function redo() {
    if (redoHistory.length === 0) {
        console.log('Cannot redo - no next state');
        return;
    }
    
    // Get next state from redo history
    const nextState = redoHistory.pop();
    
    // Push current state back to history
    settingsHistory.push(nextState);
    
    // Restore all settings
    Object.assign(settings, nextState);
    
    // Update all UI controls to match restored settings
    document.getElementById('contrastSlider').value = settings.threshold;
    document.getElementById('contrastInput').value = settings.threshold;
    document.getElementById('edgeDetectionCheck').checked = settings.edgeDetection;
    document.getElementById('invertCheck').checked = settings.invert;
    document.getElementById('laserCheck').checked = settings.laserMode;
    document.getElementById('blackTextCheck').checked = settings.blackText;
    document.getElementById('blackRoadsCheck').checked = settings.blackRoads;
    document.getElementById('whiteWaterCheck').checked = settings.whiteWater;
    document.getElementById('thickenCheck').checked = settings.thickenText;
    document.getElementById('thickenInput').value = settings.thickenAmount;
    document.getElementById('thickenSlider').value = settings.thickenAmount;
    document.getElementById('thickenCoastlinesCheck').checked = settings.thickenCoastlines;
    document.getElementById('coastlineInput').value = settings.coastlineAmount;
    document.getElementById('coastlineSlider').value = settings.coastlineAmount;
    
    // Toggle visibility of conditional controls
    document.getElementById('thickenControls').style.display = settings.thickenText ? 'block' : 'none';
    document.getElementById('coastlineControls').style.display = settings.thickenCoastlines ? 'block' : 'none';
    
    console.log('Redo - restored to next state:', settings);
    
    // Update history count
    updateHistoryCount();
    
    // Re-render with skipHistory=true to prevent saving this restoration
    renderImage(true);
}

// ============================================================================
// DRAG AND DROP FUNCTIONALITY
// ============================================================================

// Drag and Drop for toolbar sections
function setupDragAndDrop() {
    const sections = document.querySelectorAll('.toolbar-section');
    let draggedElement = null;
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        
        // Only allow dragging from the header
        header.addEventListener('dragstart', (e) => {
            draggedElement = section;
            section.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        header.addEventListener('dragend', (e) => {
            section.classList.remove('dragging');
            // Remove all drag-over classes
            sections.forEach(s => s.classList.remove('drag-over'));
        });
        
        section.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (section !== draggedElement) {
                section.classList.add('drag-over');
            }
        });
        
        section.addEventListener('dragleave', (e) => {
            section.classList.remove('drag-over');
        });
        
        section.addEventListener('drop', (e) => {
            e.preventDefault();
            section.classList.remove('drag-over');
            
            if (draggedElement && section !== draggedElement) {
                // Reorder: insert dragged element before the drop target
                const toolbar = document.querySelector('.right-toolbar');
                toolbar.insertBefore(draggedElement, section);
                
                // Save order to localStorage for future sessions
                saveSectionOrder();
            }
        });
    });
    
    // Load saved order on startup
    loadSectionOrder();
}

function saveSectionOrder() {
    const sections = document.querySelectorAll('.toolbar-section');
    const order = Array.from(sections).map(section => {
        const header = section.querySelector('.section-header h3');
        return header ? header.textContent.trim() : '';
    });
    localStorage.setItem('mapitSectionOrder', JSON.stringify(order));
    console.log('Section order saved:', order);
}

function loadSectionOrder() {
    const savedOrder = localStorage.getItem('mapitSectionOrder');
    if (!savedOrder) return;
    
    try {
        const order = JSON.parse(savedOrder);
        const toolbar = document.querySelector('.right-toolbar');
        const sections = Array.from(document.querySelectorAll('.toolbar-section'));
        
        // Reorder sections based on saved order
        order.forEach(title => {
            const section = sections.find(s => {
                const h3 = s.querySelector('.section-header h3');
                return h3 && h3.textContent.trim() === title;
            });
            if (section) {
                toolbar.appendChild(section);
            }
        });
        
        console.log('Section order restored:', order);
    } catch (e) {
        console.error('Failed to restore section order:', e);
    }
}