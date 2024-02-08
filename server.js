const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connect to MongoDB (Make sure MongoDB is running on your system)
mongoose.connect('mongodb+srv://baranidharanofficial:xvGpoNWidICzP7I5@training.liykfwa.mongodb.net/');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema for user details
const userSchema = new mongoose.Schema({
    uid: String,
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
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'inbound-user' }],
});

const User = mongoose.model('inbound-user', userSchema);

// Middleware to parse JSON
app.use(express.json());

// Endpoint to upload user details
app.post('/users', async (req, res) => {
    try {
        const { uid, name, email, phone, location, company, role, color, portfolio, linkedin, instagram, facebook, github, quora, medium, stack, x } = req.body;
        const newUser = new User({ uid, name, email, phone, location, company, role, color, portfolio, linkedin, instagram, facebook, github, quora, medium, stack, x });

        console.log(newUser.name);
        console.log(newUser.email);
        console.log(newUser.phone);
        console.log(newUser.location);
        await newUser.save();
        res.status(201).json({ message: 'User details uploaded successfully', user: req.body });
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

app.get('/users/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users/:userId/add-connect/:connectId', async (req, res) => {
    try {
        const { userId, connectId } = req.params;

        // Find the user and friend based on their IDs
        const user = await User.findById(userId);
        const connect = await User.findById(connectId);

        if (!user || !connect) {
            return res.status(404).json({ message: 'User or connect not found' });
        }

        // Check if the friend is already in the user's friends list
        if (user.connections.includes(connectId)) {
            return res.status(400).json({ message: 'Connect already added' });
        }

        // Add the friend to the user's friends list
        user.connections.push(connect);
        await user.save();

        res.status(200).json({ message: 'Connect added successfully', user: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
