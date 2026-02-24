const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password
        });

        // Create salt & hash
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        const savedUser = await newUser.save();

        const token = jwt.sign(
            { id: savedUser.id },
            process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
            { expiresIn: 3600 }
        );

        res.json({
            token,
            user: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate a user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // Check for existing user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
            { expiresIn: 3600 }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
