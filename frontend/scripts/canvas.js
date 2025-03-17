const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Initialize canvas size and scaling
function initCanvas() {
    // Get container dimensions
    const container = canvas.parentElement;
    const maxWidth = 800;
    const maxHeight = 600;
    
    // Calculate dimensions maintaining 4:3 aspect ratio
    let width = Math.min(container.clientWidth - 32, maxWidth);
    let height = (width * 3) / 4;
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context
    context.scale(dpr, dpr);
    
    // Set drawing properties
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#000000';
    context.lineWidth = 2.5;
    
    // Set white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enable high-quality rendering
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        initCanvas();
        context.putImageData(imageData, 0, 0);
    }, 200);
});

// Handle high DPI displays
function setupHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    context.scale(dpr, dpr);
}

// Initialize drawing coordinates
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Update drawing functions for better line quality
function draw(e) {
    if (!isDrawing) return;
    
    // Get canvas bounds
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Calculate positions
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Draw with quadratic curve for smoother lines
    context.beginPath();
    context.moveTo(lastX, lastY);
    
    // Use quadratic curve if we have a midpoint
    if (e.movementX !== 0 || e.movementY !== 0) {
        const midPoint = {
            x: (lastX + x) / 2,
            y: (lastY + y) / 2
        };
        context.quadraticCurveTo(lastX, lastY, midPoint.x, midPoint.y);
    } else {
        context.lineTo(x, y);
    }
    
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    
    [lastX, lastY] = [x, y];
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;
}

// Initialize canvas on load
window.addEventListener('load', () => {
    initCanvas();
    setupHiDPI();
});

let drawing = false;
let currentTool = 'pencil';
let startX, startY;
const answerElement = document.getElementById('answer');

// Tool settings
const tools = {
    pencil: {
        lineWidth: 3,
        strokeStyle: '#000000',
        globalAlpha: 1,
        lineCap: 'round',
        lineJoin: 'round'
    },
    brush: {
        lineWidth: 20,
        strokeStyle: '#000000',
        globalAlpha: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
    },
    marker: {
        lineWidth: 15,
        strokeStyle: '#000000',
        globalAlpha: 0.4,
        lineCap: 'square',
        lineJoin: 'miter'
    },
    eraser: {
        lineWidth: 20,
        strokeStyle: '#ffffff',
        globalAlpha: 1,
        lineCap: 'round',
        lineJoin: 'round'
    },
    line: {
        lineWidth: 3,
        strokeStyle: '#000000',
        globalAlpha: 1,
        lineCap: 'round',
        lineJoin: 'round'
    }
};

// Add color picker event listener
document.getElementById('color-picker').addEventListener('input', (e) => {
    const color = e.target.value;
    Object.keys(tools).forEach(tool => {
        if (tool !== 'eraser') {
            tools[tool].strokeStyle = color;
        }
    });
    if (currentTool !== 'eraser') {
        context.strokeStyle = color;
    }
});

// Add opacity picker event listener
document.getElementById('opacity-picker').addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value) / 100;
    tools[currentTool].globalAlpha = opacity;
    context.globalAlpha = opacity;
});

// Brush size control
document.getElementById('brush-size').addEventListener('input', (e) => {
    tools[currentTool].lineWidth = parseInt(e.target.value);
});

function applyToolSettings() {
    const tool = tools[currentTool];
    context.lineWidth = tool.lineWidth;
    context.strokeStyle = tool.strokeStyle;
    context.globalAlpha = tool.globalAlpha;
    context.lineCap = tool.lineCap;
    context.lineJoin = tool.lineJoin;
}

// Set up event listeners for tools
document.querySelectorAll('.tool-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        currentTool = e.target.dataset.tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        canvas.className = currentTool;
        applyToolSettings();
    });
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
document.getElementById('run-canvas').addEventListener('click', runCanvas);

// Make sure this event listener is added
document.getElementById('run-canvas').addEventListener('click', runCanvas);

function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    context.closePath();
    
    if (currentTool === 'line') {
        // Finalize the line
        context.stroke();
    }
    try {
        saveDrawing();
    } catch (err) {
        console.error('Stop drawing error:', err);
    }
}

function clearCanvas() {
    try {
        context.clearRect(0, 0, canvas.width, canvas.height);
        answerElement.textContent = '';
    } catch (err) {
        console.error('Clear canvas error:', err);
    }
}

async function saveDrawing() {
    try {
        const dataUrl = canvas.toDataURL();
        // Send to backend instead of showing in UI
        await fetch('/api/drawings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: new Date().toISOString(),
                content: dataUrl
            })
        });
    } catch (err) {
        console.error('Save drawing error:', err);
    }
}

// Update the runCanvas function
async function runCanvas() {
    try {
        // Check if canvas is empty
        if (isCanvasEmpty()) {
            showError('Please draw something first');
            return;
        }

        // Show loading state
        showLoading();

        // Get canvas data
        const dataUrl = canvas.toDataURL('image/png');

        // Send to backend API
        const response = await fetch('/api/process-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: dataUrl
            })
        });

        if (!response.ok) {
            throw new Error('Server error: ' + response.statusText);
        }

        const data = await response.json();

        if (data.success) {
            showResult(data.result);
        } else {
            showError(data.message || 'Error processing image');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Add helper functions
function isCanvasEmpty() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return !imageData.some(channel => channel !== 0);
}

function showError(message) {
    const answerElement = document.getElementById('answer');
    answerElement.innerHTML = `
        <div class="alert alert-danger mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
}

function showLoading() {
    const answerElement = document.getElementById('answer');
    const loadingIndicator = document.getElementById('answer-loading');
    
    answerElement.innerHTML = '';
    loadingIndicator.classList.remove('d-none');
}

function showResult(result) {
    const answerElement = document.getElementById('answer');
    const loadingIndicator = document.getElementById('answer-loading');
    
    loadingIndicator.classList.add('d-none');
    answerElement.innerHTML = `
        <div class="alert alert-success mb-0">
            <h6 class="alert-heading">Calculation Result:</h6>
            <p class="mb-1">Operation: ${result.operation}</p>
            <p class="mb-1">Numbers: ${result.numbers.join(', ')}</p>
            <p class="mb-0">Result: ${result.result}</p>
        </div>
    `;
}

// Initialize default tool settings
context.strokeStyle = tools.pencil.strokeStyle;
context.lineWidth = tools.pencil.lineWidth;
context.lineCap = 'round';
context.lineJoin = 'round';

class ToolSettings {
    constructor() {
        this.popup = document.getElementById('toolSettings');
        this.strokeWidth = document.getElementById('strokeWidth');
        this.opacityRange = document.getElementById('opacityRange');
        this.currentColor = '#000000';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Color picker buttons
        document.querySelectorAll('.color-picker-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setColor(e.target.dataset.color);
                document.querySelectorAll('.color-picker-btn').forEach(b => 
                    b.classList.toggle('active', b === e.target));
            });
        });

        // Stroke width
        this.strokeWidth.addEventListener('input', (e) => {
            context.lineWidth = parseInt(e.target.value);
        });

        // Opacity
        this.opacityRange.addEventListener('input', (e) => {
            context.globalAlpha = parseInt(e.target.value) / 100;
        });

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.popup.contains(e.target) && 
                !e.target.matches('#pencilTool')) {
                this.hidePopup();
            }
        });
    }

    setColor(color) {
        this.currentColor = color;
        context.strokeStyle = color;
    }

    showPopup() {
        this.popup.classList.add('show');
    }

    hidePopup() {
        this.popup.classList.remove('show');
    }

    togglePopup() {
        this.popup.classList.toggle('show');
    }
}

// Initialize tools
class DrawingTools {
    constructor() {
        this.toolSettings = new ToolSettings();
        this.currentTool = 'pencil';
        this.isDrawing = false;
        this.initializeTools();
    }

    initializeTools() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.setTool(tool);
                
                // Special handling for pencil tool
                if (tool === 'pencil' && e.currentTarget.id === 'pencilTool') {
                    e.stopPropagation();
                    this.toolSettings.togglePopup();
                }
            });
        });

        // Set initial tool
        this.setTool('pencil');
    }

    setTool(toolName) {
        this.currentTool = toolName;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.tool === toolName));
        
        // Update cursor and context settings
        switch(toolName) {
            case 'pencil':
                context.globalAlpha = 1;
                context.lineWidth = 2;
                break;
            case 'brush':
                context.globalAlpha = 0.6;
                context.lineWidth = 10;
                break;
            case 'eraser':
                context.globalAlpha = 1;
                context.lineWidth = 20;
                context.strokeStyle = '#ffffff';
                break;
        }
        
        // Update canvas cursor
        canvas.className = toolName;
    }
}

// Initialize tools when canvas is ready
window.addEventListener('load', () => {
    // ...existing canvas initialization code...
    
    const drawingTools = new DrawingTools();
    
    // Update drawing function to use current tool settings
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        context.beginPath();
        context.moveTo(lastX, lastY);
        
        // Use quadratic curve for smoother lines
        const midPoint = {
            x: (lastX + x) / 2,
            y: (lastY + y) / 2
        };
        context.quadraticCurveTo(lastX, lastY, midPoint.x, midPoint.y);
        
        context.stroke();
        context.beginPath();
        context.moveTo(x, y);
        
        [lastX, lastY] = [x, y];
    }
});
