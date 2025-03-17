class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.history = [];
        this.redoHistory = [];
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.brushSize = 3;
        this.opacity = 1;
        this.color = '#000000';
        
        // Add new properties
        this.lastX = 0;
        this.lastY = 0;
        this.scale = 1;
        this.isDragging = false;
        
        this.initializeCanvas();
        this.setupContext();
        this.setupEventListeners();
        this.setupToolbox();
        this.setupToolboxToggle();
        this.setupDrawingTools();
        
        // Add toolbox panel reference
        this.toolboxPanel = document.getElementById('toolboxPanel');
        this.setupToolboxPanel();

        // New properties for smoothing
        this.lastPoints = [];
        this.smoothingFactor = 0.5;
        this.minDistance = 2;
        this.maxPoints = 5;
    }

    initializeCanvas() {
        const updateCanvasSize = () => {
            const container = document.getElementById('canvasContainer');
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Set maximum dimensions
            const maxWidth = 800;
            const maxHeight = 600;
            
            // Calculate dimensions maintaining 4:3 aspect ratio
            let width = Math.min(containerWidth, maxWidth);
            let height = (width * 3) / 4;
            
            // If height exceeds container or max height, recalculate based on height
            if (height > containerHeight || height > maxHeight) {
                height = Math.min(containerHeight, maxHeight);
                width = (height * 4) / 3;
            }
            
            // Set canvas dimensions with device pixel ratio for retina displays
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
                        
            // Set display size
            this.canvas.style.width = `${width}px`;
            this.canvas.style.height = `${height}px`;
            
            // Scale context for retina display
            this.ctx.scale(dpr, dpr);
            
            // Redraw canvas content
            this.redrawCanvas();
        };

        // Initial size
        updateCanvasSize();
        
        // Update on resize with debounce
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCanvasSize, 100);
        });
        
        resizeObserver.observe(document.getElementById('canvasContainer'));
        
        // Backup resize listener
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCanvasSize, 100);
        });
    }

    setupContext() {
        const dpr = window.devicePixelRatio || 1;
        this.ctx.scale(dpr, dpr);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.brushSize;
    }

    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let x, y;
        if (e.touches) {
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }
        
        return { x, y };
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.setTool(tool);
            });
        });

        // Quick tools
        document.getElementById('canvas-undo').addEventListener('click', this.undo.bind(this));
        document.getElementById('canvas-redo').addEventListener('click', this.redo.bind(this));
        document.getElementById('canvas-clear').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('canvas-generate').addEventListener('click', this.generateAnswer.bind(this));
    }

    setupToolbox() {
        // Tool selection
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = e.currentTarget.dataset.tool;
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.currentTarget.dataset.color) {
                    this.color = e.currentTarget.dataset.color;
                }
            });
        });

        // Custom color picker
        document.getElementById('customColorPicker').addEventListener('change', (e) => {
            this.color = e.target.value;
        });

        // Brush size
        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
        });

        // Opacity
        document.getElementById('opacity').addEventListener('input', (e) => {
            this.opacity = parseInt(e.target.value) / 100;
        });
    }

    setupToolboxToggle() {
        const toolboxToggle = document.getElementById('toolboxToggle');
        const toolbox = document.getElementById('toolbox');
        const mainContent = document.querySelector('.main-content');
        let isDragging = false;
        let startY = 0;
        let currentTranslateY = 0;

        // Toggle toolbox when hamburger menu is clicked
        toolboxToggle.addEventListener('click', () => {
            toolboxToggle.classList.toggle('active');
            toolbox.classList.toggle('collapsed');
            toolbox.classList.toggle('expanded');
            if (mainContent && window.innerWidth >= 768) {
                mainContent.classList.toggle('expanded');
            }
        });

        // Handle touch events for mobile drag
        toolbox.addEventListener('touchstart', (e) => {
            if (window.innerWidth < 768 && e.target.closest('.toolbox-handle')) {
                isDragging = true;
                startY = e.touches[0].clientY;
                currentTranslateY = toolbox.getBoundingClientRect().top;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            const newTranslateY = Math.max(0, Math.min(deltaY, window.innerHeight * 0.6));
            
            toolbox.style.transform = `translateY(${newTranslateY}px)`;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            const threshold = window.innerHeight * 0.3;
            
            if (toolbox.getBoundingClientRect().top > threshold) {
                toolbox.classList.add('collapsed');
                toolbox.classList.remove('expanded');
                toolboxToggle.classList.remove('active');
            } else {
                toolbox.classList.remove('collapsed');
                toolbox.classList.add('expanded');
                toolboxToggle.classList.add('active');
            }
            
            toolbox.style.transform = '';
        });

        // Close toolbox when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInside = toolbox.contains(e.target) || toolboxToggle.contains(e.target);
            
            if (!isClickInside && toolbox.classList.contains('expanded')) {
                toolboxToggle.classList.remove('active');
                toolbox.classList.add('collapsed');
                toolbox.classList.remove('expanded');
                if (mainContent && window.innerWidth >= 768) {
                    mainContent.classList.remove('expanded');
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                toolbox.style.transform = '';
                if (toolbox.classList.contains('expanded')) {
                    mainContent?.classList.add('expanded');
                }
            }
        });
    }

    setupDrawingTools() {
        const toolsPanel = document.getElementById('toolsPanel');
        const toolsToggle = document.getElementById('toolsToggle');
        
        if (!toolsPanel || !toolsToggle) {
            console.error('Tools panel or toggle button not found');
            return;
        }

        // Toggle tools panel
        toolsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toolsPanel.classList.toggle('show');
            toolsToggle.classList.toggle('active');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!toolsPanel.contains(e.target) && 
                !toolsToggle.contains(e.target)) {
                toolsPanel.classList.remove('show');
                toolsToggle.classList.remove('active');
            }
        });

        // Setup tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.setTool(tool);
                document.querySelectorAll('.tool-btn').forEach(b => 
                    b.classList.toggle('active', b === btn));
                if (window.innerWidth < 768) {
                    toolsPanel.classList.remove('show');
                    toolsToggle.classList.remove('active');
                }
            });
        });

        // Setup color picker buttons
        document.querySelectorAll('.color-picker-btn').forEach(btn => {
            if (!btn.classList.contains('custom-color')) {
                btn.addEventListener('click', () => {
                    this.color = btn.dataset.color;
                    document.querySelectorAll('.color-picker-btn').forEach(b => 
                        b.classList.toggle('active', b === btn));
                    this.updateContext();
                });
            }
        });

        // Setup custom color picker
        const customColorPicker = document.getElementById('customColorPicker');
        customColorPicker.addEventListener('input', (e) => {
            this.color = e.target.value;
            document.querySelectorAll('.color-picker-btn').forEach(btn => 
                btn.classList.remove('active'));
            this.updateContext();
        });

        // Setup brush size slider
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        brushSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.brushSize = size;
            brushSizeValue.textContent = size;
            this.updateContext();
        });

        // Setup opacity slider
        const opacityRange = document.getElementById('opacityRange');
        const opacityValue = document.getElementById('opacityValue');
        opacityRange.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value);
            this.opacity = opacity / 100;
            opacityValue.textContent = `${opacity}%`;
            this.updateContext();
        });
    }

    setupToolboxPanel() {
        // Toggle toolbox when clicking pencil tool
        document.getElementById('pencilTool').addEventListener('click', () => {
            this.toolboxPanel.classList.toggle('show');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.toolboxPanel.contains(e.target) && 
                !e.target.matches('#pencilTool')) {
                this.toolboxPanel.classList.remove('show');
            }
        });

        // Update values displays
        const brushSize = document.getElementById('brush-size');
        const opacity = document.getElementById('opacity');
        
        brushSize.addEventListener('input', (e) => {
            document.getElementById('brushSizeValue').textContent = e.target.value;
            this.brushSize = parseInt(e.target.value);
        });
        
        opacity.addEventListener('input', (e) => {
            document.getElementById('opacityValue').textContent = e.target.value + '%';
            this.opacity = parseInt(e.target.value) / 100;
        });

        // Handle color selection
        document.querySelectorAll('.color-btn:not(.custom-color)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.color = color;
                document.querySelectorAll('.color-btn').forEach(b => 
                    b.classList.toggle('active', b === e.currentTarget));
            });
        });

        // Custom color picker
        document.getElementById('customColorPicker').addEventListener('input', (e) => {
            this.color = e.target.value;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        });

        // Handle mobile drag
        if ('ontouchstart' in window) {
            let startY = 0;
            let currentY = 0;

            this.toolboxPanel.addEventListener('touchstart', (e) => {
                if (e.target.closest('.toolbox-handle')) {
                    startY = e.touches[0].clientY;
                    currentY = this.toolboxPanel.getBoundingClientRect().top;
                }
            });

            document.addEventListener('touchmove', (e) => {
                if (startY) {
                    const deltaY = e.touches[0].clientY - startY;
                    const newY = Math.max(
                        Math.min(deltaY, window.innerHeight),
                        window.innerHeight * 0.4
                    );
                    this.toolboxPanel.style.transform = `translateY(${newY}px)`;
                }
            });

            document.addEventListener('touchend', () => {
                if (startY) {
                    startY = 0;
                    this.toolboxPanel.style.transform = '';
                    if (currentY > window.innerHeight * 0.7) {
                        this.toolboxPanel.classList.remove('show');
                    }
                }
            });
        }
    }

    setTool(toolName) {
        this.currentTool = toolName;
        document.querySelectorAll('.tool-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.tool === toolName));
            
        switch(toolName) {
            case 'pencil':
                this.brushSize = 2;
                this.opacity = 1;
                break;
            case 'brush':
                this.brushSize = 10;
                this.opacity = 0.6;
                break;
            case 'eraser':
                this.brushSize = 20;
                this.opacity = 1;
                break;
        }
        
        this.updateContext();
    }

    updateContext() {
        this.ctx.lineWidth = this.brushSize;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPosition(e);
        this.lastPoints = [{x: pos.x, y: pos.y}];
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.saveState();
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPosition(e);
        const lastPoint = this.lastPoints[this.lastPoints.length - 1];
        
        // Calculate distance between points
        const dx = pos.x - lastPoint.x;
        const dy = pos.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only draw if moved enough
        if (distance < this.minDistance) return;
        
        this.updateContext();
        
        // Add new point
        this.lastPoints.push({x: pos.x, y: pos.y});
        
        // Keep only last N points
        if (this.lastPoints.length > this.maxPoints) {
            this.lastPoints.shift();
        }
        
        // Draw smooth curve through points
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastPoints[0].x, this.lastPoints[0].y);
        
        if (this.lastPoints.length == 2) {
            // Draw straight line if only 2 points
            this.ctx.lineTo(pos.x, pos.y);
        } else {
            // Draw curves through points
            for (let i = 1; i < this.lastPoints.length - 2; i++) {
                const xc = (this.lastPoints[i].x + this.lastPoints[i + 1].x) / 2;
                const yc = (this.lastPoints[i].y + this.lastPoints[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(
                    this.lastPoints[i].x,
                    this.lastPoints[i].y,
                    xc,
                    yc
                );
            }
            
            // For the last 2 points
            if (this.lastPoints.length > 2) {
                const last = this.lastPoints[this.lastPoints.length - 1];
                const secondLast = this.lastPoints[this.lastPoints.length - 2];
                this.ctx.quadraticCurveTo(
                    secondLast.x,
                    secondLast.y,
                    last.x,
                    last.y
                );
            }
        }
        
        this.ctx.stroke();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.lastPoints = [];
        this.ctx.closePath();
    }

    saveState() {
        // Limit history size to prevent memory issues
        if (this.history.length > 20) {
            this.history = this.history.slice(-20);
        }
        this.history.push(this.canvas.toDataURL());
        this.redoHistory = [];
    }

    undo() {
        if (this.history.length > 0) {
            this.redoHistory.push(this.canvas.toDataURL());
            const previousState = this.history.pop();
            this.loadCanvasState(previousState);
        }
    }

    redo() {
        if (this.redoHistory.length > 0) {
            this.history.push(this.canvas.toDataURL());
            const nextState = this.redoHistory.pop();
            this.loadCanvasState(nextState);
        }
    }

    loadCanvasState(dataUrl) {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.saveState(); // Save current state before clearing
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    redrawCanvas() {
        if (this.history.length > 0) {
            this.loadCanvasState(this.history[this.history.length - 1]);
        }
    }

    async generateAnswer() {
        try {
            // Show loading state
            const loadingIndicator = document.getElementById('answer-loading');
            const answerContent = document.getElementById('answer-content');
            
            loadingIndicator.classList.remove('d-none');
            answerContent.classList.add('d-none');

            // Create a temporary canvas for proper image capture
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set temp canvas size to match original canvas
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            
            // Draw white background
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw the original canvas content
            tempCtx.drawImage(this.canvas, 0, 0);
            
            // Get image data with proper background
            const imageData = tempCanvas.toDataURL('image/png', 1.0);

            // Download image
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `drawcal-${timestamp}.png`;
            link.href = imageData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Rest of your existing code for API call and response handling
            const response = await fetch('/api/process-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                throw new Error('Failed to process image');
            }

            const result = await response.json();
            
            // Hide loading and show result
            loadingIndicator.classList.add('d-none');
            answerContent.classList.remove('d-none');
            
            // Display the result
            document.getElementById('answer').innerHTML = `
                <div class="alert alert-success mb-0">
                    <h6 class="alert-heading mb-2">Calculation Result:</h6>
                    <p class="mb-1"><strong>Operation:</strong> ${result.operation || 'Unknown'}</p>
                    <p class="mb-1"><strong>Numbers:</strong> ${result.numbers?.join(', ') || 'N/A'}</p>
                    <p class="mb-0"><strong>Result:</strong> ${result.result || 'Unable to calculate'}</p>
                </div>
            `;

        } catch (error) {
            console.error('Error generating answer:', error);
            const loadingIndicator = document.getElementById('answer-loading');
            const answerContent = document.getElementById('answer-content');
            
            loadingIndicator.classList.add('d-none');
            answerContent.classList.remove('d-none');
            
            document.getElementById('answer').innerHTML = `
                <div class="alert alert-danger mb-0">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error processing image. Please try again.
                </div>
            `;
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = 800;
        const maxHeight = 600;
        
        // Calculate dimensions maintaining 4:3 aspect ratio
        let width = Math.min(container.clientWidth, maxWidth);
        let height = (width * 3) / 4;
        
        // Set canvas dimensions with device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Set display size
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Scale context
        this.ctx.scale(dpr, dpr);
        
        // Redraw canvas content
        this.redrawCanvas();
    }

    resetView() {
        this.scale = 1;
        this.canvas.style.transform = 'none';
        this.redrawCanvas();
    }

    pan(deltaX, deltaY) {
        const currentTransform = this.canvas.style.transform || 'none';
        const matrix = new DOMMatrix(currentTransform);
        matrix.translateSelf(deltaX, deltaY);
        this.canvas.style.transform = matrix.toString();
    }
}

// Add this near the top of your script
const toolsToggle = document.getElementById('toolsToggle');
const toolsPanel = document.getElementById('toolsPanel');

toolsToggle.addEventListener('click', () => {
    toolsToggle.classList.toggle('active');
    toolsPanel.classList.toggle('show');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    if (!toolsPanel.contains(e.target) && !toolsToggle.contains(e.target)) {
        toolsToggle.classList.remove('active');
        toolsPanel.classList.remove('show');
    }
});

// Initialize the drawing app when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DrawingApp();
});