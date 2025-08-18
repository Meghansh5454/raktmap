const express = require('express');
const router = express.Router();
const { createBloodRequest } = require('../controllers/bloodRequestController');

// Route to create a new blood request and notify donors
router.post('/request', createBloodRequest);

module.exports = router;
