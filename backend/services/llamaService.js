const { spawn } = require('child_process');
const path = require('path');

class LlamaService {
    constructor() {
        this.modelPath = process.env.LLAMA_MODEL_PATH;
        this.llamaPath = process.env.LLAMA_CPP_PATH;
    }

    async processImage(imageData) {
        try {
            // Convert base64 image to text description (implement OCR if needed)
            const textPrompt = this.preparePrompt(imageData);
            
            // Call local Llama model
            const result = await this.callLlamaModel(textPrompt);
            
            // Parse the result
            return this.parseResponse(result);
        } catch (error) {
            console.error('Llama processing error:', error);
            throw error;
        }
    }

    preparePrompt(imageData) {
        return `
        Task: Analyze this mathematical expression and provide the calculation.
        Rules:
        1. Identify numbers and mathematical operators
        2. Determine the operation type
        3. Calculate the result
        4. Use only basic operations: +, -, *, /
        
        Expression: ${imageData}
        
        Provide output in JSON format:
        {
            "operation": "type_of_operation",
            "numbers": [number1, number2],
            "result": calculated_result
        }
        `;
    }

    async callLlamaModel(prompt) {
        return new Promise((resolve, reject) => {
            const llamaProcess = spawn(this.llamaPath, [
                '-m', this.modelPath,
                '--temp', '0.1',
                '--ctx_size', '2048',
                '-n', '256',
                '-p', prompt
            ]);

            let output = '';
            let error = '';

            llamaProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            llamaProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            llamaProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Llama process failed: ${error}`));
                } else {
                    resolve(output);
                }
            });
        });
    }

    parseResponse(response) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            const result = JSON.parse(jsonMatch[0]);
            
            // Validate result
            if (!this.isValidResult(result)) {
                throw new Error('Invalid result format');
            }

            return result;
        } catch (error) {
            console.error('Parse error:', error);
            throw error;
        }
    }

    isValidResult(result) {
        return (
            result &&
            typeof result.operation === 'string' &&
            Array.isArray(result.numbers) &&
            typeof result.result === 'number'
        );
    }
}

module.exports = new LlamaService();
