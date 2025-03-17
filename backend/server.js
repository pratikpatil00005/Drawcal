require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Define feedback directory and file path
const FEEDBACK_DIR = path.join(__dirname, 'data');
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback.txt');

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure feedback directory and file exist
const ensureFeedbackFile = async () => {
    try {
        await fs.mkdir(FEEDBACK_DIR, { recursive: true });
        try {
            await fs.access(FEEDBACK_FILE);
        } catch {
            await fs.writeFile(FEEDBACK_FILE, ''); // Create empty file if doesn't exist
        }
    } catch (error) {
        console.error('Error creating feedback directory/file:', error);
        throw error;
    }
};

// Feedback endpoint
app.post('/api/feedback', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const feedback = req.body;
        const feedbackEntry = `
=== Feedback Entry ===
Date: ${feedback.timestamp}
Name: ${feedback.name}
Email: ${feedback.email}
Type: ${feedback.type}
Message: ${feedback.message}
==================
\n`;

        await ensureFeedbackFile();
        await fs.appendFile(FEEDBACK_FILE, feedbackEntry);
        
        res.status(200).json({ 
            success: true,
            message: 'Feedback saved successfully' 
        });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to save feedback: ' + error.message
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// This should be the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Feedback will be stored in: ${FEEDBACK_FILE}`);
    ensureFeedbackFile().catch(console.error);
});