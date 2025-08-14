const express = require('express');
const Donor = require('../models/Donor');
const router = express.Router();

// GET /donors - Fetch all donors
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find({}, { password: 0 }); // Exclude password field
    res.json(donors);
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ message: 'Failed to fetch donors' });
  }
});

// GET /donors/:id - Fetch a specific donor
router.get('/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id, { password: 0 });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({ message: 'Failed to fetch donor' });
  }
});

module.exports = router; 