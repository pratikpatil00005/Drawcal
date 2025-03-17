const { OpenAI } = require('langchain/llms/openai');
const { ChatPromptTemplate } = require('langchain/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');

class LangchainService {
    constructor() {
        this.model = new OpenAI({
            temperature: 0,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        this.parser = StructuredOutputParser.fromNamesAndDescriptions({
            operation: "The mathematical operation detected",
            numbers: "Array of numbers identified in the image",
            result: "The calculated result"
        });

        // Customize the prompt template for math recognition
        this.prompt = ChatPromptTemplate.fromTemplate(`
            # Modify this prompt for better math recognition
            You are a math expression recognition system.
            Analyze the following handwritten mathematical expression:
            {imageData}
            
            Focus on:
            1. Identifying numbers and mathematical symbols
            2. Determining the operation type
            3. Computing the result
            
            Provide the output in the following format:
            {format}
        `);
    }

    async processImage(imageData) {
        try {
            // Add any preprocessing steps here if needed
            const formattedPrompt = await this.prompt.format({
                imageData: imageData,
                format: this.parser.getFormatInstructions(),
            });

            const response = await this.model.call(formattedPrompt);
            const parsedResponse = await this.parser.parse(response);
            
            // Validate the result
            if (!this.isValidMathResult(parsedResponse)) {
                throw new Error('Invalid mathematical expression');
            }

            return parsedResponse;
        } catch (error) {
            console.error('Error processing image with Langchain:', error);
            throw error;
        }
    }

    // Add helper methods as needed
    isValidMathResult(result) {
        // Implement validation logic
        return true;
    }
}

module.exports = new LangchainService();
