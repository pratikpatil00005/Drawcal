const axios = require('axios');

class OllamaService {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:11434';
    }

    async processImage(imageData) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: 'llava',
                prompt: `You are a mathematical assistant. Looking at this image:
                        1. What mathematical expressions or equations do you see?
                        2. Calculate and solve any mathematical problems
                        3. Provide a step-by-step solution
                        Please be specific and detailed in your response.`,
                images: [imageData],
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 500,
                }
            });

            if (!response.data || !response.data.response) {
                throw new Error('Invalid response from Ollama');
            }

            return {
                success: true,
                analysis: response.data.response,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Processing error:', error.message);
            throw new Error('Image processing failed');
        }
    }
}

module.exports = new OllamaService();
