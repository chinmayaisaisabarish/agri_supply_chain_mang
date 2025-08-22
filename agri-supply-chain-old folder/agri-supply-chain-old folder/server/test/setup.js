const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Crop = require('../models/Crop');
require('dotenv').config();

const setupTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update test distributor
    const distributor = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        name: 'Test Distributor',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'distributor',
        roleId: 'D001',
        walletAddress: '0x1234567890'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test distributor updated/created');

    // Create or update test farmer
    const farmer = await User.findOneAndUpdate(
      { email: 'farmer@example.com' },
      {
        name: 'Test Farmer',
        email: 'farmer@example.com',
        password: hashedPassword,
        role: 'farmer',
        roleId: 'F001',
        walletAddress: '0x0987654321'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test farmer updated/created');

    // Create test crop if none exists
    const existingCrop = await Crop.findOne({ itemId: 'CROP001' });
    if (!existingCrop) {
      const crop = new Crop({
        name: 'Test Crop',
        quantity: 100,
        price: 50,
        sellingPrice: 75,
        costPrice: 40,
        status: 'available',
        farmerId: farmer._id,
        role: 'farmer',
        roleId: farmer.roleId,
        itemId: 'CROP001',
        harvestDate: new Date(),
        location: 'Test Location',
        image: 'test-image.jpg',
        supplyChain: [{
          role: 'Farmer',
          roleId: farmer.roleId,
          itemId: 'CROP001',
          costPrice: 40,
          sellingPrice: 75,
          harvestDate: new Date(),
          location: 'Test Location',
          transactionDate: new Date()
        }]
      });
      await crop.save();
      console.log('✅ Test crop created');
    } else {
      console.log('ℹ️ Test crop already exists');
    }

    console.log('\n✅ Test data setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

setupTestData(); 