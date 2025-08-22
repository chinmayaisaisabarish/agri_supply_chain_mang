const mongoose = require('mongoose');
const Crop = require('../models/Crop');

async function checkCrops() {
  try {
    await mongoose.connect('mongodb://localhost:27017/agri-supply-chain');
    console.log('Connected to MongoDB');

    const crops = await Crop.find({});
    console.log('Total crops:', crops.length);
    
    const availableCrops = crops.filter(crop => crop.status === 'available' && crop.quantity > 0);
    console.log('Available crops:', availableCrops.length);
    
    console.log('Available crops details:');
    availableCrops.forEach(crop => {
      console.log({
        name: crop.name,
        quantity: crop.quantity,
        status: crop.status,
        listedBy: crop.listedBy,
        listedForConsumer: crop.listedForConsumer
      });
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCrops(); 