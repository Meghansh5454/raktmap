const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor'); // Ensure this line is present
const ResponseToken = require('../models/ResponseToken');
const { sendSMS } = require('../services/smsService');
const Notification = require('../models/Notification');
const { broadcastNotification } = require('../utils/notificationStream');

// Create a new blood request
router.post('/', async (req, res) => {
  try {
    const { bloodGroup, quantity, urgency, requiredBy, description, patientAge, patientCondition } = req.body;
    const hospital = req.user; // From JWT token

    // Create and save the blood request
    const bloodRequest = new BloodRequest({
      hospitalId: hospital.id, // 2. USE hospital.id INSTEAD OF hospital._id
      bloodGroup,
      quantity,
      urgency,
      requiredBy,
      description,
      patientAge,
      patientCondition
    });

    await bloodRequest.save();

    // Create notification for hospital
    try {
      const doc = await Notification.create({
        hospitalId: hospital.id,
        type: 'info',
        title: 'Blood Request Created',
        message: `${quantity} unit(s) of ${bloodGroup} requested (urgency: ${urgency})`,
        meta: { bloodRequestId: bloodRequest._id }
      });
      broadcastNotification(doc);
    } catch (e) { console.error('Failed to create notification:', e.message); }

    // Debug: Log normalized blood group
    const normalizedBloodGroup = bloodGroup.replace(/\s+/g, '').toUpperCase();
    console.log('Normalized requested blood group:', normalizedBloodGroup);

    // Fetch all donors and filter in JS for normalized blood group match
    const allDonors = await Donor.find({});
    allDonors.forEach(donor => {
      const donorBloodGroup = donor["Blood Group"] || donor.bloodGroup;
      if (!donorBloodGroup) {
        console.warn(`Donor missing Blood Group:`, donor);
        return;
      }
      const donorNormalized = donorBloodGroup.replace(/\s+/g, '').toUpperCase();
      const donorName = donor["Student Name"] || donor.name || '[no name]';
      console.log(`Donor: ${donorName}, Raw: "${donorBloodGroup}", Normalized: "${donorNormalized}"`);
    });

    const matchingDonors = allDonors.filter(donor => {
      const donorBloodGroup = donor["Blood Group"] || donor.bloodGroup;
      if (!donorBloodGroup) return false;
      const donorNormalized = donorBloodGroup.replace(/\s+/g, '').toUpperCase();
      return donorNormalized === normalizedBloodGroup;
    });

    console.log(`Found ${matchingDonors.length} matching donors for blood group ${bloodGroup}`);

    // Prepare SMS message with token-based tracking
    let smsSuccessCount = 0;
    for (const donor of matchingDonors) {
      const donorName = donor["Student Name"] || donor.name || '[no name]';
      const donorPhone = donor["Mobile No"] || donor.phone;
      if (donorPhone) {
        try {
          // Generate short token for tracking
          const responseToken = Math.random().toString(36).substr(2, 8);
          
          // Store token mapping in database for tracking
          await ResponseToken.create({
            token: responseToken,
            requestId: bloodRequest._id,
            donorId: donor._id || donor["Student Name"] || donorPhone // Use available ID
          });
          
          // Create improved SMS message
          const message = `Urgent: ${quantity} units ${bloodGroup} needed at ${hospital.name}. Respond: https://donor-location-tracker.onrender.com/r/${responseToken}`;
          
          await sendSMS(donorPhone, message);
          smsSuccessCount++;
          console.log(`SMS sent successfully to donor: ${donorName} (${donorPhone})`);
          try {
            const notif = await Notification.create({
              hospitalId: hospital.id,
              type: 'info',
              title: 'SMS Sent',
              message: `SMS sent to ${donorName} (${bloodGroup})`,
              read: false,
              meta: { donorId: donor._id, bloodRequestId: bloodRequest._id }
            });
            broadcastNotification(notif);
          } catch (e) { console.error('Broadcast SMS sent notification failed', e); }
        } catch (error) {
          console.error(`Failed to send SMS to donor ${donorName}:`, error);
          try {
            const notif = await Notification.create({
              hospitalId: hospital.id,
              type: 'error',
              title: 'SMS Failed',
              message: `Failed to send SMS to ${donorName}`,
              read: false,
              meta: { donorId: donor._id, bloodRequestId: bloodRequest._id }
            });
            broadcastNotification(notif);
          } catch (_) {}
        }
      }
    }

    // Summary notification (ephemeral) after loop
    try {
      const notif = await Notification.create({
        hospitalId: hospital.id,
        type: 'success',
        title: 'SMS Dispatch Complete',
        message: `${smsSuccessCount}/${matchingDonors.length} SMS delivered for ${bloodGroup}`,
        read: false,
        meta: { bloodRequestId: bloodRequest._id }
      });
      broadcastNotification(notif);
    } catch (e) { console.error('Broadcast SMS summary failed', e); }

    // Send response with SMS status
    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      smsStatus: {
        totalDonors: matchingDonors.length,
        smsDelivered: smsSuccessCount,
        bloodGroup: bloodGroup
  },
  bloodRequestId: bloodRequest._id
    });

  } catch (error) {
    console.error('Error in blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process blood request',
      error: error.message
    });
  }
});

// Get all blood requests for a hospital (for dashboard)
router.get('/hospital', async (req, res) => {
  try {
    const hospital = req.user; // From JWT token
    
    const bloodRequests = await BloodRequest.find({ hospitalId: hospital.id })
      .sort({ createdAt: -1 })
      .select('_id bloodGroup quantity urgency status createdAt requiredBy description');
    
    res.json({
      success: true,
      bloodRequests
    });
  } catch (error) {
    console.error('Error fetching hospital blood requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood requests'
    });
  }
});

// Get all blood requests for donation history (public endpoint)
router.get('/all', async (req, res) => {
  try {
    const bloodRequests = await BloodRequest.find({})
      .sort({ createdAt: -1 })
      .select('_id bloodGroup quantity urgency status createdAt requiredBy description hospitalId');
    
    res.json({
      success: true,
      bloodRequests
    });
  } catch (error) {
    console.error('Error fetching all blood requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood requests'
    });
  }
});

// PUT /blood-requests/:id - Update a blood request
router.put('/:id', async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }
    
    // Create notification for blood request update
    try {
      const notif = await Notification.create({
        hospitalId: bloodRequest.hospitalId,
        type: 'info',
        title: 'Blood Request Updated',
        message: `Blood request for ${bloodRequest.bloodGroup} (${bloodRequest.quantity} units) was updated`,
        read: false,
        meta: { bloodRequestId: bloodRequest._id }
      });
      broadcastNotification(notif);
    } catch (e) { console.error('Failed to create blood request update notification:', e.message); }
    
    res.json({ success: true, message: 'Blood request updated successfully', bloodRequest });
  } catch (error) {
    console.error('Error updating blood request:', error);
    res.status(500).json({ success: false, message: 'Failed to update blood request' });
  }
});

// DELETE /blood-requests/:id - Delete a blood request
router.delete('/:id', async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }
    
    // Create notification for blood request deletion
    try {
      const notif = await Notification.create({
        hospitalId: bloodRequest.hospitalId,
        type: 'warning',
        title: 'Blood Request Deleted',
        message: `Blood request for ${bloodRequest.bloodGroup} (${bloodRequest.quantity} units) was deleted`,
        read: false,
        meta: { bloodRequestId: bloodRequest._id }
      });
      broadcastNotification(notif);
    } catch (e) { console.error('Failed to create blood request deletion notification:', e.message); }
    
    res.json({ success: true, message: 'Blood request deleted successfully' });
  } catch (error) {
    console.error('Error deleting blood request:', error);
    res.status(500).json({ success: false, message: 'Failed to delete blood request' });
  }
});

module.exports = router;
