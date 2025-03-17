const ollamaService = require('../services/ollamaService');
const localLlamaService = require('../services/localLlamaService');
const groqService = require('../services/groqService');

class AIController {
    constructor() {
        this.processingService = process.env.AI_SERVICE || 'groq';
    }

    async processImage(imageData) {
        try {
            switch (this.processingService) {
                case 'groq':
                    return await groqService.processImage(imageData);
                case 'ollama':
                    return await ollamaService.processImage(imageData);
                case 'local':
                    return await localLlamaService.processImage(imageData);
                default:
                    throw new Error('Invalid AI service specified');
            }
        } catch (error) {
            console.error('AI processing error:', error);
            throw error;
        }
    }
}

module.exports = new AIController();
