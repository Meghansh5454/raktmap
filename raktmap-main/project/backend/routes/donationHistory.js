const express = require('express');
const router = express.Router();
const DonationHistory = require('../models/DonationHistory');
const BloodRequest = require('../models/BloodRequest');

// Accept a donor for a blood request
router.post('/accept-donor', async (req, res) => {
  try {
    const { 
      donorId, 
      bloodRequestId, 
      donorName, 
      donorPhone, 
      donorBloodGroup, 
      location, 
      address,
      status = 'accepted', // Default to accepted, but allow override
      acceptedAt,
      completedAt,
      notes
    } = req.body;
    
    console.log('Accept donor request:', req.body);
    
    // Validate required fields
    if (!donorId || !bloodRequestId || !donorName || !donorPhone || !donorBloodGroup || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if blood request exists
    const bloodRequest = await BloodRequest.findById(bloodRequestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check if donor already accepted for this request
    const existingAcceptance = await DonationHistory.findOne({
      donorId,
      bloodRequestId,
      status: 'accepted'
    });

    if (existingAcceptance) {
      return res.status(400).json({
        success: false,
        message: 'Donor already accepted for this blood request'
      });
    }

    // Create new donation history entry
    const donationHistory = new DonationHistory({
      donorId,
      bloodRequestId,
      hospitalId: bloodRequest.hospitalId,
      donorName,
      donorPhone,
      donorBloodGroup,
      status: status,
      acceptedAt: acceptedAt ? new Date(acceptedAt) : (status === 'accepted' || status === 'completed' ? new Date() : null),
      completedAt: completedAt ? new Date(completedAt) : (status === 'completed' ? new Date() : null),
      location,
      address: address || 'Address not provided',
      notes: notes || ''
    });

    await donationHistory.save();

    console.log('Donor accepted successfully:', donationHistory);

    res.json({
      success: true,
      message: 'Donor accepted successfully',
      donationHistory
    });

  } catch (error) {
    console.error('Error accepting donor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting donor',
      error: error.message
    });
  }
});

// Get donation history for a hospital
router.get('/donation-history/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const donationHistory = await DonationHistory.find({
      hospitalId,
      status: 'accepted'
    }).populate('bloodRequestId').sort({ acceptedAt: -1 });

    res.json({
      success: true,
      donationHistory
    });

  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donation history',
      error: error.message
    });
  }
});

// Get all accepted donors for a specific blood request
router.get('/accepted-donors/:bloodRequestId', async (req, res) => {
  try {
    const { bloodRequestId } = req.params;
    
    const acceptedDonors = await DonationHistory.find({
      bloodRequestId,
      status: 'accepted'
    }).sort({ acceptedAt: -1 });

    res.json({
      success: true,
      acceptedDonors
    });

  } catch (error) {
    console.error('Error fetching accepted donors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching accepted donors',
      error: error.message
    });
  }
});

module.exports = router;
