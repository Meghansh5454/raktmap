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
const Notification = require('./models/Notification');
const { addClient: addNotificationClient, broadcastNotification } = require('./utils/notificationStream');

const app = express();  
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://donor-location-tracker.onrender.com'
  ], 
  credentials: true 
}));
// Increase JSON limit to support larger bulk imports
app.use(bodyParser.json({ limit: '2mb' }));

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

// Add token validation test route
app.get('/validate-token', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    message: 'Token is valid'
  });
});

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

// ================= Notification Endpoints (basic) =================
// List notifications for hospital (public temporary; add auth later)
app.get('/notifications/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { filter } = req.query; // optional: unread
    // Gracefully handle placeholder / demo ids that are not valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.json({ success: true, notifications: [], note: 'hospitalId not a valid ObjectId; returning empty list' });
    }
    const query = { hospitalId };
    if (filter === 'unread') query.read = false;
    const items = await Notification.find(query).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, notifications: items });
  } catch (e) {
    console.error('Fetch notifications error', e);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark one as read
app.post('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, notification: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to mark read' });
  }
});

// Mark all read for hospital
app.post('/notifications/:hospitalId/read-all', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.json({ success: true, modified: 0, note: 'hospitalId not a valid ObjectId; nothing to mark' });
    }
    const result = await Notification.updateMany({ hospitalId, read: false }, { $set: { read: true } });
    res.json({ success: true, modified: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to mark all read' });
  }
});

// Create a test notification (for development)
app.post('/notifications/:hospitalId/test', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { type='info', title='Test Notification', message='Test message' } = req.body || {};
    let doc;
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      doc = await Notification.create({ hospitalId, type, title, message });
    } else {
      // Ephemeral (not persisted) notification for demo/non-authenticated usage
      doc = { _id: `ephemeral-${Date.now()}`, hospitalId, type, title, message, read: false, createdAt: new Date() };
    }
    broadcastNotification(doc);
    res.json({ success: true, notification: doc, persisted: !!doc?.save });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create test notification' });
  }
});

// Server-Sent Events stream for notifications
app.get('/notifications/stream/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write(`data: ${JSON.stringify({ type: 'hello', hospitalId })}\n\n`);
  addNotificationClient(hospitalId, res);
});

// Bulk import donors (CSV parsed client-side -> JSON). Public for now; should add auth later.
app.post('/admin/donors/import', async (req, res) => {
  try {
    console.log('➡️  /admin/donors/import request received');
    const Donor = require('./models/Donor');
    const bcrypt = require('bcryptjs');
    const { donors } = req.body || {};
    if (!Array.isArray(donors)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: donors array required' });
    }
    console.log(`Processing ${donors.length} donor rows`);

    const allowedBloodGroups = new Set(['A+','A-','B+','B-','AB+','AB-','O+','O-','NK']);
    const normalizeBloodGroup = (value) => {
      if (!value) return '';
      return String(value).toUpperCase().replace(/\s+/g,'').trim(); // remove internal spaces e.g. 'AB +' -> 'AB+'
    };

    // Helper to sanitize a header/key for matching
    const sanitizeKey = (k='') => k.replace(/\uFEFF/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');

    // Variants map (normalized -> canonical field name)
    const variantGroups = {
      name: ['name','fullname','donorname','studentname'],
      email: ['email','mail','emailid','e'],
      phone: ['phone','phoneno','mobileno','mobile','contact','contactno','number','phoneNumber'.toLowerCase()],
      bloodGroup: ['bloodgroup','bloodgrp','blood','bgroup','bloodtype','bloodgrpup'],
      rollNo: ['rollno','rollnumber','roll','enrollment','enrollmentno','enroll','studentid','id','studentnumber']
    };

    // Build reverse lookup: normalized variant -> canonical
    const variantLookup = {};
    Object.entries(variantGroups).forEach(([canonical, variants]) => {
      variants.forEach(v => variantLookup[sanitizeKey(v)] = canonical);
    });

    const results = [];
    const credentials = [];
    let inserted = 0;
    let skipped = 0;
  // Preload existing donors for duplicate detection
  const existingDocs = await Donor.find({}, 'email name bloodGroup phone rollNo').lean();
  const normName = (v='') => String(v).toLowerCase().trim().replace(/\s+/g,' ');
  const existingEmails = new Set(existingDocs.map(d => d.email));
  const existingNameGroup = new Set(existingDocs.map(d => `${normName(d.name)}|${normalizeBloodGroup(d.bloodGroup)}`));
  const existingPhones = new Set(existingDocs.filter(d=>d.phone).map(d=>String(d.phone).trim()));
  const existingRolls = new Set(existingDocs.filter(d=>d.rollNo).map(d=>String(d.rollNo).trim().toLowerCase()));
  // Track duplicates inside this import batch
  const batchEmails = new Set();
  const batchNameGroup = new Set();
  const batchPhones = new Set();
  const batchRolls = new Set();
    for (let i = 0; i < donors.length; i++) {
      const rawOriginal = donors[i] || {};
      // Map row keys using sanitization
      const mapped = {};
      Object.keys(rawOriginal).forEach(k => {
        const sk = sanitizeKey(k);
        const canonical = variantLookup[sk];
        if (canonical) {
          if (mapped[canonical] === undefined) mapped[canonical] = rawOriginal[k];
        } else {
          // If header already exactly matches expected canonical (after sanitize) keep it
          if (['name','email','phone','bloodGroup','rollNo'].includes(k)) mapped[k] = rawOriginal[k];
        }
      });

      const nameRaw = mapped.name || rawOriginal.name;
      const emailRaw = mapped.email || rawOriginal.email;
      const phoneRaw = mapped.phone || rawOriginal.phone;
      const rawGroup = mapped.bloodGroup || rawOriginal.bloodGroup || rawOriginal['blood group'];
      const rollNoRaw = mapped.rollNo || rawOriginal.rollNo;
      const lineInfo = { index: i + 1, email: emailRaw };

      if (!nameRaw || !emailRaw || !phoneRaw || !rawGroup) {
        results.push({ ...lineInfo, status: 'error', reason: 'Missing required field (name,email,phone,bloodGroup)' });
        skipped++; continue;
      }

      const email = String(emailRaw).toLowerCase().trim();
      const bloodGroup = normalizeBloodGroup(rawGroup);
      if (!allowedBloodGroups.has(bloodGroup)) {
        results.push({ ...lineInfo, status: 'error', reason: `Invalid blood group: ${bloodGroup}` });
        skipped++; continue;
      }
  const nameGroupKey = `${normName(nameRaw)}|${bloodGroup}`;
  const phoneKey = phoneRaw ? String(phoneRaw).trim() : '';
  const rollKey = rollNoRaw ? String(rollNoRaw).trim().toLowerCase() : '';

  // Existing DB duplicates
  if (existingEmails.has(email)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate (email exists)' }); skipped++; continue; }
  if (existingNameGroup.has(nameGroupKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate (name+bloodGroup exists)' }); skipped++; continue; }
  if (phoneKey && existingPhones.has(phoneKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate (phone exists)' }); skipped++; continue; }
  if (rollKey && existingRolls.has(rollKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate (rollNo exists)' }); skipped++; continue; }

  // Duplicates within current file
  if (batchEmails.has(email)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate in file (email)' }); skipped++; continue; }
  if (batchNameGroup.has(nameGroupKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate in file (name+bloodGroup)' }); skipped++; continue; }
  if (phoneKey && batchPhones.has(phoneKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate in file (phone)' }); skipped++; continue; }
  if (rollKey && batchRolls.has(rollKey)) { results.push({ ...lineInfo, status: 'skipped', reason: 'Duplicate in file (rollNo)' }); skipped++; continue; }

  // Reserve keys now that row is accepted
  batchEmails.add(email); batchNameGroup.add(nameGroupKey);
  if (phoneKey) batchPhones.add(phoneKey); if (rollKey) batchRolls.add(rollKey);
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(tempPassword, 10);
      const donorDoc = new Donor({
        name: String(nameRaw).trim(),
        email,
        phone: String(phoneRaw).trim(),
        bloodGroup,
        rollNo: rollNoRaw ? String(rollNoRaw).trim() : undefined,
        password: hashed
      });
      try {
        await donorDoc.save();
        inserted++;
        credentials.push({ email, tempPassword });
        results.push({ ...lineInfo, status: 'inserted' });
      } catch (err) {
        console.error('Error saving donor row', i + 1, err.message);
        results.push({ ...lineInfo, status: 'error', reason: err.message });
        skipped++;
      }
    }
    res.json({ success: true, message: 'Import processed', inserted, skipped, total: donors.length, results, credentialsCount: credentials.length, credentials });
    try {
      const notif = await Notification.create({
        type: 'success',
        title: 'Donor Import Completed',
        message: `${inserted} added, ${skipped} skipped (total ${donors.length})`,
        read: false
      });
      broadcastNotification(notif);
    } catch (e) { console.error('Failed to broadcast import notification', e); }
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Failed to import donors', error: error.message });
  }
});

// Bulk delete donors: provide { all: true } to delete all, or { ids: [..] }
app.delete('/admin/donors', async (req, res) => {
  try {
    const Donor = require('./models/Donor');
    const { all, ids } = req.body || {};
    if (all) {
      const count = await Donor.countDocuments();
      await Donor.deleteMany({});
  const payload = { success: true, deleted: count, all: true };
      try {
        const notif = await Notification.create({
          type: 'warning',
          title: 'All Donors Deleted',
          message: `${count} donor records removed`,
          read: false
        });
        broadcastNotification(notif);
      } catch(e){ console.error('Broadcast delete all donors failed', e);}
      return res.json(payload);
    }
    if (Array.isArray(ids) && ids.length) {
      const result = await Donor.deleteMany({ _id: { $in: ids } });
  const deleted = result.deletedCount || 0;
      try {
        const notif = await Notification.create({
          type: 'warning',
          title: 'Donors Deleted',
          message: `${deleted} selected donor(s) removed`,
          read: false
        });
        broadcastNotification(notif);
      } catch(e){ console.error('Broadcast delete selected donors failed', e);}
      return res.json({ success: true, deleted, all: false });
    }
    return res.status(400).json({ success: false, message: 'Provide all:true or ids array' });
  } catch (error) {
    console.error('Bulk delete donors error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete donors', error: error.message });
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
