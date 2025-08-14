const express = require('express');
const router = express.Router();
const DonorResponse = require('../models/DonorResponse');

// Get donor responses for a specific blood request
router.get('/responses/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    console.log('Fetching responses for requestId:', requestId);
    
    const responses = await DonorResponse.find({ requestId })
      .sort({ responseTime: -1 });
    
    console.log(`Found ${responses.length} responses for request ${requestId}`);
    
    res.json({
      success: true,
      responses
    });
  } catch (error) {
    console.error('Error fetching donor responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor responses',
      error: error.message
    });
  }
});

module.exports = router;