const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Atlas connection...');

const connectionString = 'mongodb+srv://meghanshthakker:sPJZneO8Bx29SJo8@raktmap.rjhcmrd.mongodb.net/raktmap';

mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 15000, // 15 seconds timeout
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Atlas connection established');
  console.log('📊 Connection details:');
  console.log('- Database:', mongoose.connection.db.databaseName);
  console.log('- Host:', mongoose.connection.host);
  console.log('- Port:', mongoose.connection.port);
  
  // Test a simple operation
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful');
  process.exit(0);
})
.catch(err => {
  console.error('❌ FAILED! MongoDB connection error:');
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  
  console.log('\n🛠️  TROUBLESHOOTING CHECKLIST:');
  console.log('□ Is your IP (136.233.130.145) whitelisted in MongoDB Atlas?');
  console.log('□ Did you allow 0.0.0.0/0 (all IPs) in Network Access?');
  console.log('□ Is your cluster running (not paused)?');
  console.log('□ Are your credentials correct?');
  console.log('□ Is your antivirus/firewall blocking the connection?');
  console.log('□ Are you behind a corporate firewall?');
  
  process.exit(1);
});

// Timeout after 20 seconds
setTimeout(() => {
  console.error('⏰ Connection timeout after 20 seconds');
  process.exit(1);
}, 20000);
