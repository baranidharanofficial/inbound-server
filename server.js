const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connect to MongoDB (Make sure MongoDB is running on your system)
mongoose.connect('mongodb+srv://baranidharanofficial:xvGpoNWidICzP7I5@training.liykfwa.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema for user details
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    location: String,
    company: String,
    role: String,
    color: Number,
    portfolio: String,
    linkedin: String,
    instagram: String,
    facebook: String,
    github: String,
    quora: String,
    medium: String,
    stack: String,
    x: String,
});

const User = mongoose.model('inbound-user', userSchema);

// Middleware to parse JSON
app.use(express.json());

// Endpoint to upload user details
app.post('/users', async (req, res) => {
    try {
        const { name, email, phone, location, company, role, color, portfolio, linkedin, instagram, facebook, github, quora, medium, stack, x } = req.body;
        const newUser = new User({ name, email, phone, location, company, role, color, portfolio, linkedin, instagram, facebook, github, quora, medium, stack, x });
        await newUser.save();
        res.status(201).json({ message: 'User details uploaded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
