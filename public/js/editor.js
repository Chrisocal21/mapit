// Editor Page JavaScript
import { processImage } from './canvas.js';

let originalImage = null;
let currentZoom = 1;
let settings = {
    threshold: 128,
    edgeDetection: false,
    invert: false,
    laserMode: false,
    thickenText: false,
    thickenAmount: 2,
    blackText: false,
    blackRoads: false,
    whiteWater: false
};

// Load image data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    setupEventListeners();
    loadImageFromStorage();
});

function initializeEditor() {
    console.log('Editor initialized');
    updateStatusBar();
}

function loadImageFromStorage() {
    const imageData = localStorage.getItem('mapitImageData');
    const metadata = localStorage.getItem('mapitMetadata');
    
    if (!imageData) {
        showError('No image data found. Please generate a map first.');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    const img = new Image();
    img.onload = () => {
        originalImage = img;
        renderImage();
        
        // Update properties panel
        if (metadata) {
            const meta = JSON.parse(metadata);
            document.getElementById('mapLocation').textContent = meta.location || '--';
        }
        
        document.getElementById('imageDimensions').textContent = `${img.width}×${img.height}px`;
        updateFileSize();
        setStatus('Ready');
    };
    
    img.onerror = () => {
        showError('Failed to load image');
    };
    
    img.src = imageData;
}

function renderImage() {
    if (!originalImage) return;
    
    setStatus('Processing...');
    showProcessing(true);
    
    const canvas = document.getElementById('editorCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    // Draw original image
    ctx.drawImage(originalImage, 0, 0);
    
    // Get image data and process
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Apply processing using canvas.js module
    const processed = processImage(imageData, settings);
    
    // Put processed data back
    ctx.putImageData(processed, 0, 0);
    
    showProcessing(false);
    setStatus('Ready');
    updateFileSize();
}

function setupEventListeners() {
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
    document.getElementById('contrastSlider').addEventListener('input', (e) => {
        settings.threshold = parseInt(e.target.value);
        document.getElementById('contrastInput').value = settings.threshold;
        renderImage();
    });
    
    document.getElementById('contrastInput').addEventListener('input', (e) => {
        settings.threshold = parseInt(e.target.value);
        document.getElementById('contrastSlider').value = settings.threshold;
        renderImage();
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
    
    // Collapsible sections
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveImage();
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
                    setZoom(1);
                    break;
            }
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
    link.download = `mapit-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    setStatus('Image saved!');
}

function copyToClipboard() {
    const canvas = document.getElementById('editorCanvas');
    canvas.toBlob(blob => {
        navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
            setStatus('Copied to clipboard!');
        }).catch(err => {
            showError('Failed to copy: ' + err.message);
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

function showProcessing(show) {
    document.getElementById('processingIndicator').style.display = show ? 'flex' : 'none';
}

function updateStatusBar() {
    if (originalImage) {
        document.getElementById('statusDimensions').textContent = 
            `${originalImage.width}×${originalImage.height}px`;
    }
}
