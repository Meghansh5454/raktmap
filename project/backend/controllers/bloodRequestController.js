const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { sendSMS } = require('../services/smsService');

// Function to get compatible blood groups
const getCompatibleBloodGroups = (requestedBloodGroup) => {
    const compatibility = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['AB-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
    };
    return compatibility[requestedBloodGroup] || [];
};

const createBloodRequest = async (req, res) => {
    try {
        const { bloodGroup, units, urgency, hospital, requesterId } = req.body;

        // Create blood request
        const bloodRequest = new BloodRequest({
            requesterId,
            bloodGroup,
            units,
            urgency,
            hospital
        });
        await bloodRequest.save();

        // Find compatible donors
        const compatibleBloodGroups = getCompatibleBloodGroups(bloodGroup);
        const donors = await Donor.find({
            bloodGroup: { $in: compatibleBloodGroups }
        });

        // Send SMS to each compatible donor
        for (const donor of donors) {
            const message = `Urgent blood requirement: ${units} units of ${bloodGroup} blood needed at ${hospital}. Please contact the hospital if you can donate.`;
            
            await sendSMS(donor.phone, message);
            
            // Add donor to notified list
            bloodRequest.notifiedDonors.push(donor._id);
        }

        await bloodRequest.save();

        res.status(201).json({
            success: true,
            message: `Blood request created and ${donors.length} compatible donors notified`,
            bloodRequest
        });

    } catch (error) {
        console.error('Error in blood request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing blood request',
            error: error.message
        });
    }
};

module.exports = {
    createBloodRequest
};
