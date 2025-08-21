const mongoose = require('mongoose');

// Extended schema to match fields used in the frontend (HospitalManagement component)
const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String },
  emergencyContact: { type: String },
  address: { type: String },
  radius: { type: Number, default: 10 },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', HospitalSchema);