require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // For production, you can restrict origin: { origin: "https://your-frontend.vercel.app" }
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema and model
const resultSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  percentage: Number,
  grade: String,
  status: String
});

const Result = mongoose.model('Result', resultSchema);

// Routes

// POST /api/results - save a result
app.post('/api/results', async (req, res) => {
  try {
    const { name, email, subject, percentage, grade, status } = req.body;

    // Check if a result already exists
    let existingResult = await Result.findOne({ email, subject });
    if (existingResult) return res.json(existingResult);

    const newResult = new Result({ name, email, subject, percentage, grade, status });
    await newResult.save();

    res.json(newResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/results - retrieve a result by email and subject
app.get('/api/results', async (req, res) => {
  try {
    const { email, subject } = req.query;
    const result = await Result.findOne({ email, subject });

    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
