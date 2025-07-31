const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Donor = require('./models/Donor');

// --- DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/raktmap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected for import...');
  importData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// --- MAIN IMPORT FUNCTION ---
const importData = async () => {
  const results = [];
  const filePath = path.join(__dirname, '../../donor.csv');

  fs.createReadStream(filePath)
    .pipe(csv({
      mapHeaders: ({ header }) => {
        switch (header) {
          case 'Student Name':
            return 'name';
          case 'Blood Group':
            return 'bloodGroup';
          case 'Mobile No':
            return 'phone';
          case 'Email':
            return 'email';
          // --- ADD THIS CASE ---
          case 'Roll No':
            return 'rollNo';
          // --------------------
          default:
            return null;
        }
      }
    }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Finished reading CSV file. Found ${results.length} records.`);
      const donorsToInsert = [];
      for (const record of results) {
        try {
          const hashedPassword = await bcrypt.hash('password123', 10);
          
          donorsToInsert.push({
            name: record.name,
            email: record.email.toLowerCase(),
            // --- ADD THIS LINE ---
            rollNo: record.rollNo,
            // ---------------------
            bloodGroup: record.bloodGroup.replace(/\s/g, ''),
            phone: `+91${record.phone}`,
            password: hashedPassword,
            role: 'donor'
          });
        } catch (e) {
          console.error(`Could not process record for ${record.name}:`, e);
        }
      }

      if (donorsToInsert.length > 0) {
        try {
          console.log(`Inserting ${donorsToInsert.length} donors into the database...`);
          await Donor.deleteMany({});
          console.log('Cleared existing donors.');
          await Donor.insertMany(donorsToInsert);
          console.log('Successfully imported all donors with roll numbers!');
        } catch (error) {
          console.error('Error inserting data into MongoDB:', error);
        }
      } else {
        console.log('No valid donors to insert.');
      }

      mongoose.connection.close();
    });
};cd