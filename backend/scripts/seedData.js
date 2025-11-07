// scripts/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB connected');

    const testUsers = [
      { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin', verified: true },
      { name: 'John Donor', email: 'donor@test.com', password: 'donor123', role: 'donor', verified: true },
      { name: 'Sarah Helper', email: 'helper@test.com', password: 'helper123', role: 'helper', verified: true },
      { name: 'Mike Receiver', email: 'receiver@test.com', password: 'receiver123', role: 'receiver', verified: true },
      { name: 'Test Organization', email: 'org@test.com', password: 'org123', role: 'receiver', verified: true }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(' User ' + userData.email + ' already exists');
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
      console.log(' Created ' + userData.role + ': ' + userData.email);
    }

    console.log('
 TEST CREDENTIALS:
==================
ADMIN: admin@test.com / admin123
DONOR: donor@test.com / donor123
HELPER: helper@test.com / helper123
RECEIVER: receiver@test.com / receiver123
ORGANIZATION: org@test.com / org123
==================');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
};

seedUsers();
