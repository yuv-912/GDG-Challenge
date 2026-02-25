require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const eventsData = [
    {
        title: 'Intro to Google Cloud Platform',
        date: 'Mar 15, 2026',
        time: '2:00 PM - 5:00 PM',
        tag: 'workshop',
        tagColor: 'badge-blue',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop'
    },
    {
        title: 'Campus Hackathon 2026',
        date: 'Apr 02 - Apr 03, 2026',
        time: '48 Hours',
        tag: 'hackathon',
        tagColor: 'badge-green',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop'
    },
    {
        title: 'Building with Gemini API',
        date: 'Apr 12, 2026',
        time: '3:00 PM - 4:30 PM',
        tag: 'seminar',
        tagColor: 'badge-yellow',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop'
    },
    {
        title: 'Android Compose Masterclass',
        date: 'Apr 20, 2026',
        time: '1:00 PM - 4:00 PM',
        tag: 'workshop',
        tagColor: 'badge-red',
        image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=600&auto=format&fit=crop'
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gdg-events', {
    serverSelectionTimeoutMS: 5000,
    family: 4 // Use IPv4
})
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing events
        await Event.deleteMany({});
        console.log('Cleared existing events');

        // Insert new events
        await Event.insertMany(eventsData);
        console.log('Successfully seeded events');

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
