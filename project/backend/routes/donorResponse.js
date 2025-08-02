const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import Donor model
const Donor = require('../models/Donor');

// ADD THIS TEST ENDPOINT AT THE TOP
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Donor response API is working!',
    timestamp: new Date()
  });
});

// Get all available donors with their information
router.get('/available-donors', async (req, res) => {
  try {
    console.log('=== FETCHING AVAILABLE DONORS ===');
    
    // Get all donors from the donors collection
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    console.log('Donors found:', donors.length);
    
    // Get recent location data to match with donors
    const locations = await mongoose.connection.db.collection('locations').find({}).toArray();
    console.log('Locations found:', locations.length);
    
    // Combine donor data with location data
    const availableDonors = donors.map(donor => {
      // Try to find matching location by multiple criteria for better matching
      const location = locations.find(loc => {
        // Match by phone number (most reliable)
        const phoneMatch = loc.mobileNumber === donor.phone || 
                          loc.mobileNumber === donor.phone.replace(/\s+/g, '') ||
                          loc.mobileNumber?.replace(/\s+/g, '') === donor.phone.replace(/\s+/g, '');
        
        // Match by name (case insensitive, flexible matching)
        const nameMatch = loc.userName && donor.name && 
                         loc.userName.toLowerCase().trim() === donor.name.toLowerCase().trim();
        
        return phoneMatch || nameMatch;
      });
      
      // Calculate distance if location is available
      let distance = null;
      let detailedStatus = 'not_contacted'; // Default status
      
      if (location && location.latitude && location.longitude) {
        const hospitalLat = 22.6013;
        const hospitalLng = 72.8327;
        distance = calculateDistance(hospitalLat, hospitalLng, location.latitude, location.longitude);
        detailedStatus = 'location_shared';
      }
      
      // Determine status based on location sharing
      let status = 'available';
      if (location) {
        status = 'responded'; // Has shared location via SMS link
      }
      
      return {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        bloodGroup: donor.bloodGroup,
        rollNo: donor.rollNo,
        status: status,
        detailedStatus: detailedStatus, // More specific status
        distance: distance,
        lastDonation: null, // This would need to be tracked separately
        address: location ? location.address : null,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        responseTime: location ? location.timestamp : null,
        hasLocationData: !!location, // Boolean flag for easier filtering
        matchedBy: location ? (locations.find(l => l.mobileNumber === donor.phone) ? 'phone' : 'name') : null
      };
    });
    
    // Sort donors: those with location data first, then by distance, then by name
    availableDonors.sort((a, b) => {
      if (a.hasLocationData && !b.hasLocationData) return -1;
      if (!a.hasLocationData && b.hasLocationData) return 1;
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log('Available donors processed:', availableDonors.length);
    console.log('Donors with location:', availableDonors.filter(d => d.hasLocationData).length);
    
    res.json({
      success: true,
      donors: availableDonors,
      total: availableDonors.length,
      withLocation: availableDonors.filter(d => d.hasLocationData).length,
      withoutLocation: availableDonors.filter(d => !d.hasLocationData).length
    });
    
  } catch (error) {
    console.error('Error fetching available donors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available donors',
      error: error.message
    });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Create a model for the locations collection
const LocationSchema = new mongoose.Schema({
  address: String,
  latitude: Number,
  longitude: Number,
  userName: String,
  rollNumber: String,
  mobileNumber: String,
  timestamp: Date
}, { collection: 'locations' });

const Location = mongoose.model('Location', LocationSchema);

// Get all locations (user positions) for the live map
router.get('/locations', async (req, res) => {
  try {
    console.log('=== FETCHING LOCATIONS ===');
    
    // First, let's see what's in the database
    const allDocuments = await mongoose.connection.db.collection('locations').find({}).toArray();
    console.log('Raw documents from database:', allDocuments);
    console.log('Number of raw documents:', allDocuments.length);
    
    // Now try with the model
    const locations = await Location.find({}).sort({ timestamp: -1 });
    console.log('Locations from model:', locations);
    console.log('Number of locations from model:', locations.length);
    
    if (locations.length === 0) {
      console.log('No locations found in database');
      return res.json({
        success: true,
        responses: [],
        message: 'No locations found'
      });
    }
    
    // Transform the data to match what the frontend expects
    const transformedLocations = locations.map(location => {
      console.log('Processing location:', location);
      return {
        _id: location._id.toString(),
        name: location.userName || 'Unknown User',
        phone: location.mobileNumber || 'No phone',
        donorId: location.rollNumber || 'No ID',
        location: {
          lat: location.latitude,
          lng: location.longitude
        },
        status: 'responded',
        responseTime: location.timestamp || new Date(),
        address: location.address
      };
    });
    
    console.log('Transformed locations:', transformedLocations);
    console.log('Sending response with', transformedLocations.length, 'locations');
    
    res.json({
      success: true,
      responses: transformedLocations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

// Get donor responses for a specific blood request
router.get('/responses/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('Fetching responses for requestId:', requestId);
    
    // For now, return all locations when a specific request is selected
    const locations = await Location.find({}).sort({ timestamp: -1 });
    
    const transformedLocations = locations.map(location => ({
      _id: location._id.toString(),
      requestId: requestId,
      name: location.userName || 'Unknown User',
      phone: location.mobileNumber || 'No phone',
      donorId: location.rollNumber || 'No ID',
      location: {
        lat: location.latitude,
        lng: location.longitude
      },
      status: 'responded',
      responseTime: location.timestamp || new Date(),
      address: location.address
    }));
    
    console.log(`Found ${transformedLocations.length} locations for request ${requestId}`);
    
    res.json({
      success: true,
      responses: transformedLocations
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