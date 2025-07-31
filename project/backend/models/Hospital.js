const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
  // Add more hospital-specific fields if needed
});

module.exports = mongoose.model('Hospital', HospitalSchema);