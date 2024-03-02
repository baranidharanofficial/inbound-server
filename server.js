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
});


const connectSchema = new mongoose.Schema({
    userId: String,
    categories: Array,
    connects: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'inbound-user' }, categories: [] },],
});

const User = mongoose.model('inbound-user', userSchema);
const Connects = mongoose.model('connects', connectSchema);

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
        res.status(201).json({ message: 'User details uploaded successfully', user: newUser });
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

app.get('/users/get-connects/:uid', async (req, res) => {
    try {
        const userConnects = await Connects.findOne({ userId: req.params.uid });
        if (!userConnects) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userConnects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users/add-category/:uid/:category', async (req, res) => {
    try {
        console.log(req.params.category);

        const userConnects = await Connects.findOne({ userId: req.params.uid });

        if (!userConnects) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!userConnects.categories.includes(req.params.category)) {
            userConnects.categories.push(req.params.category);
        }

        await userConnects.save();
        res.status(201).json({ data: userConnects.categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users/add-user-to-category/:uid/:cid', async (req, res) => {
    try {
        // console.log(req.params.category);
        const { categories } = req.body;

        if (!categories) {
            return res.status(404).json({ message: 'Categories cannot be null' });
        }

        const userConnects = await Connects.findOne({ userId: req.params.uid });

        if (!userConnects) {
            return res.status(404).json({ message: 'User co not found' });
        }

        userConnects.connects.forEach(connect => {
            console.log(connect.user._id.toString());
            if (connect.user._id.toString() === req.params.cid) {
                connect.categories = categories;
            }
        });

        await userConnects.save();
        res.status(200).json(userConnects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users/:receiverId/add-connect/:senderId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Find the sender and receiver based on their IDs
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        // Find the sender and receiver based on their IDs
        const nsender = await Connects.findOne({ userId: senderId });
        const nreceiver = await Connects.findOne({ userId: receiverId });

        // if (nreceiver.connects.filter(connect => connect._id == senderId).length > 0) {
        //     return res.status(400).json({ message: 'Already Connected' });
        // }

        if (!nsender) {
            const newConnect = new Connects({ userId: senderId, connects: [{ user: receiver, categories: [] }] });
            await newConnect.save();
            console.log('TEST 1');
        } else {
            nsender.connects.push({ user: receiver, categories: [] });
            await nsender.save();
            console.log('TEST 2');
        }

        if (!nreceiver) {
            const newConnect = new Connects({ userId: receiverId, connects: [{ user: sender, categories: [] }] });
            await newConnect.save();
            console.log('TEST 3');
        } else {
            nreceiver.connects.push({ user: sender, categories: [] });
            await nreceiver.save();
            console.log('TEST 4');
        }

        res.status(200).json({ message: 'Connect added successfully', sender: sender, receiver: receiver });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to retrieve the connect list of a user
app.get('/users/:userId/connects', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user based on the provided user ID
        const userConnects = await Connects.findOne({ userId: userId }).populate('connects.user');

        if (!userConnects) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract connect details with all fields
        const connects = userConnects.connects.map(connect => ({
            _id: connect.user._id,
            uid: connect.user.uid,
            name: connect.user.name,
            email: connect.user.email,
            phone: connect.user.phone,
            location: connect.user.location,
            company: connect.user.company,
            role: connect.user.role,
            color: connect.user.color,
            portfolio: connect.user.portfolio,
            linkedin: connect.user.linkedin,
            instagram: connect.user.instagram,
            facebook: connect.user.facebook,
            github: connect.user.github,
            quora: connect.user.quora,
            medium: connect.user.medium,
            stack: connect.user.stack,
            x: connect.user.x,
            categories: connect.categories,
        }));

        res.status(200).json({ data: { connects: connects, categories: userConnects.categories, } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
