const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const firebaseService = require('../services/firebaseService');
const llamaService = require('../services/llamaService');
const localLlamaService = require('../services/localLlamaService');

router.post('/process-image', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const result = await AIController.processImage(imageData);
        res.json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.post('/generate-answer', async (req, res) => {
    try {
        const { imageText } = req.body;
        
        if (!imageText) {
            return res.status(400).json({
                success: false,
                error: 'No text provided'
            });
        }

        const result = await localLlamaService.generateAnswer(imageText);
        res.json(result);
    } catch (error) {
        console.error('Error generating answer:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate answer'
        });
    }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await firebaseService.getUserHistory(userId);
        res.json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
