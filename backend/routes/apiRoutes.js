const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
let drawings = [];

// Route to get all drawings
router.get('/api/drawings', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Drawings retrieved successfully',
            data: drawings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving drawings',
            error: error.message
        });
    }
});

// Route to save a new drawing
router.post('/api/drawings', (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const newDrawing = {
            id: Date.now(),
            title,
            content,
            timestamp: new Date()
        };

        drawings.push(newDrawing);

        res.status(201).json({
            success: true,
            message: 'Drawing saved successfully',
            data: newDrawing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving drawing',
            error: error.message
        });
    }
});

// Add this new route after existing routes
router.post('/api/process-image', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        // TODO: Add actual image processing logic here
        // This is a mock response for now
        const result = {
            success: true,
            result: {
                operation: 'addition',
                numbers: [2, 3],
                result: 5
            }
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing image',
            error: error.message
        });
    }
});

module.exports = router;