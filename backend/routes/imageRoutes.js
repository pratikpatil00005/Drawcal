const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollamaService');

router.post('/calculate/image', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData || !imageData.startsWith('data:image')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid image data'
            });
        }

        const result = await ollamaService.processImage(
            imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
        );

        res.json(result);

    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process image',
            message: error.message
        });
    }
});

module.exports = router;
