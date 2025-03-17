const { LlamaModel, ImageAnalyzer } = require('./llama-libs');

class LocalLlamaService {
    async processImage(imageData) {
        try {
            const model = new LlamaModel();
            const analyzer = new ImageAnalyzer(model);
            const result = await analyzer.analyze(imageData);
            
            return result;
        } catch (error) {
            throw new Error(`Local processing failed: ${error.message}`);
        }
    }
}

module.exports = new LocalLlamaService();
