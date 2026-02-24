const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/events
// @desc    Create an event
// @access  Public (for seeding purposes, usually should be protected)
router.post('/', async (req, res) => {
    try {
        const { title, date, time, tag, tagColor, image } = req.body;

        if (!title || !date || !time || !tag || !tagColor || !image) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const newEvent = new Event({
            title,
            date,
            time,
            tag,
            tagColor,
            image
        });

        const savedEvent = await newEvent.save();
        res.json(savedEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
