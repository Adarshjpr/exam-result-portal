require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware - Fixed CORS
app.use(cors({
    origin: [
        "https://result-frontend-git-main-adarshjprs-projects.vercel.app",
        "https://result-frontend-adarshjprs-projects.vercel.app", 
        "https://result-frontend.vercel.app",
        "http://localhost:3000" // for local testing
    ],
    credentials: true
}));

app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://adarsh:adarsh1234@cluster0.lethy.mongodb.net/uncodemy?retryWrites=true&w=majority";

mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema and model
const resultSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    percentage: Number,
    grade: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

// Routes

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'UNCODEMY Result API is running!' });
});

// POST /api/save-result - save a result
app.post('/api/save-result', async (req, res) => {
    try {
        console.log('Received save request:', req.body);
        
        const { name, email, subject, percentage, grade, status } = req.body;

        // Validation
        if (!name || !email || !subject) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Check if result already exists
        let existingResult = await Result.findOne({ email, subject });
        if (existingResult) {
            return res.json({ 
                success: true, 
                data: existingResult,
                message: 'Existing result found'
            });
        }

        // Create new result
        const newResult = new Result({ 
            name, 
            email, 
            subject, 
            percentage, 
            grade, 
            status 
        });
        
        await newResult.save();

        res.json({ 
            success: true, 
            data: newResult,
            message: 'Result saved successfully'
        });
    } catch (error) {
        console.error('Save result error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// GET /api/get-result - retrieve result by email and subject
app.get('/api/get-result', async (req, res) => {
    try {
        const { email, subject } = req.query;
        
        console.log('Fetching result for:', { email, subject });

        if (!email || !subject) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and subject are required' 
            });
        }

        const result = await Result.findOne({ email, subject });

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Result not found' 
            });
        }

        res.json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
