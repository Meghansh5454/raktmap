const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ADD THIS TEST ENDPOINT AT THE TOP
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Donor response API is working!',
    timestamp: new Date()
  });
});

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