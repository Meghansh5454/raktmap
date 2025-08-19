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
const hospitalsRouter = require('./routes/hospitals');
const tokenResponseRouter = require('./routes/tokenResponse');
const donationHistoryRouter = require('./routes/donationHistory');

const app = express();  
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://donor-location-tracker.onrender.com'
  ], 
  credentials: true 
}));
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
app.use('/hospitals', authenticateToken, hospitalsRouter);
app.use('/donation-history', authenticateToken, donationHistoryRouter);
app.use('/', tokenResponseRouter); // Public route for SMS responses

// Public admin routes for dashboard (temporary - should be secured later)
app.get('/admin/hospitals', async (req, res) => {
  try {
    console.log('Fetching hospitals for admin dashboard...');
    const Hospital = require('./models/Hospital');
    const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: `Fetched ${hospitals.length} hospitals`,
      hospitals: hospitals,
      count: hospitals.length
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals',
      error: error.message
    });
  }
});

app.get('/admin/donors', async (req, res) => {
  try {
    console.log('Fetching donors for admin dashboard...');
    const Donor = require('./models/Donor');
    const donors = await Donor.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: `Fetched ${donors.length} donors`,
      donors: donors,
      count: donors.length
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donors',
      error: error.message
    });
  }
});

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
   7. Hospital Profile & Dashboard Routes
============================ */

// Get hospital profile/dashboard data
app.get('/hospital/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const hospital = await Hospital.findById(req.user.id).select('-password');
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({
      success: true,
      hospital: hospital
    });
  } catch (error) {
    console.error('Error fetching hospital profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch hospital profile',
      error: error.message 
    });
  }
});

// Update hospital profile
app.put('/hospital/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const { name, email, phone, address, emergencyContact, radius } = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address, emergencyContact, radius },
      { new: true, select: '-password' }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({
      success: true,
      message: 'Hospital profile updated successfully',
      hospital: hospital
    });
  } catch (error) {
    console.error('Error updating hospital profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update hospital profile',
      error: error.message 
    });
  }
});

// Get hospital dashboard stats
app.get('/hospital/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const BloodRequest = require('./models/BloodRequest');
    const Donor = require('./models/Donor');
    
    // Get active blood requests for this hospital
    const activeRequests = await BloodRequest.countDocuments({ 
      requesterId: req.user.id,
      status: { $in: ['pending', 'processing'] }
    });

    // Get total donors (you can filter by location later)
    const availableDonors = await Donor.countDocuments({ 
      status: 'available' 
    });

    // Get completed requests this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const completedThisMonth = await BloodRequest.countDocuments({
      requesterId: req.user.id,
      status: 'fulfilled',
      createdAt: { $gte: currentMonth }
    });

    // Calculate average response time (mock for now)
    const averageResponseTime = '12 min';

    res.json({
      success: true,
      stats: {
        activeRequests,
        availableDonors,
        completedThisMonth,
        averageResponseTime
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

// Get recent blood requests for hospital
app.get('/hospital/dashboard/recent-requests', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied. Hospital role required.' });
    }

    const BloodRequest = require('./models/BloodRequest');
    
    const recentRequests = await BloodRequest.find({ 
      requesterId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('bloodGroup units urgency status createdAt');

    res.json({
      success: true,
      requests: recentRequests
    });
  } catch (error) {
    console.error('Error fetching recent requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent requests',
      error: error.message 
    });
  }
});

/* ============================
   8. Example Protected Route
============================ */
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}!`, role: req.user.role });
});

/* ============================
   8. Start Server
============================ */
app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Server running on port 5000');
  console.log('📡 Server accessible from:');
  console.log('   - Local: http://localhost:5000');
  console.log('   - Network: http://0.0.0.0:5000');
  console.log('   - If using ngrok: https://YOUR_NGROK_URL');
});
