require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Require Routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gdg-events')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
    res.send('GDG Backend API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
