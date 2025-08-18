require('dotenv').config();
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bloodRequestsRouter = require('./routes/bloodRequests');
const donorResponseRouter = require('./routes/donorResponse');
const donorsRouter = require('./routes/donors');

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(bodyParser.json());

const mongoOptions = {
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4 // Force IPv4
};

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(connectionString, mongoOptions)
  .then(() => console.log('✅ MongoDB connected to raktmap database'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('📋 Troubleshooting steps:');
    console.log('1. Check MongoDB Atlas Network Access - Add your IP');
    console.log('2. Or allow all IPs: 0.0.0.0/0');
    console.log('3. Verify cluster is running');
    console.log('4. Check firewall/antivirus');
    console.log('5. Make sure MONGODB_URI is correct in .env');
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('✅ MongoDB connected successfully!'));

/* ============================
   2. JWT Secret
============================ */
const SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/* ============================
   3. Auth Middleware
============================ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/* ============================
   4. Routes
============================ */
app.use('/blood-requests', authenticateToken, bloodRequestsRouter);
app.use('/donor-response', authenticateToken, donorResponseRouter);
app.use('/donors', authenticateToken, donorsRouter);

// Public route for donation history
app.get('/donation-history', async (req, res) => {
  try {
    const BloodRequest = require('./models/BloodRequest');
    const bloodRequests = await BloodRequest.find({})
      .sort({ createdAt: -1 })
      .select('_id bloodGroup quantity urgency status createdAt requiredBy description');

    res.json({ success: true, bloodRequests });
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donation history' });
  }
});

/* ============================
   5. Register
============================ */
app.post('/register', async (req, res) => {
  try {
    console.log("Received /register request", req.body);
    let { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields required' });
    }

    email = email.toLowerCase();
    role = role.toLowerCase();

    let Model;
    if (role === 'hospital') {
      Model = Hospital;
    } else if (role === 'admin') {
      Model = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await Model.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Model({ email, password: hashedPassword, name });
    await user.save();

    res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

/* ============================
   6. Login
============================ */
app.post('/login', async (req, res) => {
  try {
    let { email, password, role } = req.body;
    email = email.toLowerCase();
    role = role.toLowerCase();

    let Model;
    if (role === 'hospital') {
      Model = Hospital;
    } else if (role === 'admin') {
      Model = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: role, name: user.name },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

/* ============================
   7. Example Protected Route
============================ */
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}!`, role: req.user.role });
});

/* ============================
   8. Start Server
============================ */
app.listen(5000, () => console.log('🚀 Server running on port 5000'));
