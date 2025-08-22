const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const RetailerProduct = require('../models/RetailerProduct');
const ConsumerProduct = require('../models/ConsumerProduct');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/agri-supply-chain', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // User IDs
    const farmerId = '68093383063418239be4a0a9';
    const distributorId = '6809348e063418239be4a0d0';
    const retailerId = '680934b5063418239be4a0e6';
    const consumerId = '680a30b44e00b2056974da9c';

    // 1. Add Wheat
    const wheatCrop = await Crop.create({
      name: 'Wheat',
      description: 'Grown in Madhya Pradesh',
      sellingPrice: 0.0003,
      costPrice: 0.0001,
      quantity: 25,
      harvestDate: new Date('2025-04-23'),
      location: 'Madhya Pradesh',
      image: 'wheat.jpg',
      farmerId: farmerId,
      status: 'available',
      itemId: 'WHEAT_' + Date.now()
    });

    // Transaction: Farmer to Distributor
    const wheatFarmerToDistributor = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      cropId: wheatCrop._id,
      quantity: 25,
      price: 0.0003,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Distributor Product
    const wheatDistributorProduct = await RetailerProduct.create({
      name: 'Wheat',
      description: 'Grown in Madhya Pradesh',
      price: 0.0005,
      costPrice: 0.0003,
      quantity: 25,
      harvestDate: new Date('2025-04-23'),
      location: 'Madhya Pradesh',
      image: 'wheat.jpg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: wheatCrop._id,
      status: 'available'
    });

    // Transaction: Distributor to Retailer
    const wheatDistributorToRetailer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      cropId: wheatCrop._id,
      quantity: 25,
      price: 0.0005,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Retailer Product
    const wheatRetailerProduct = await RetailerProduct.create({
      name: 'Wheat',
      description: 'Grown in Madhya Pradesh',
      price: 0.0008,
      costPrice: 0.0005,
      quantity: 25,
      harvestDate: new Date('2025-04-23'),
      location: 'Madhya Pradesh',
      image: 'wheat.jpg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: wheatCrop._id,
      status: 'available'
    });

    // Transaction: Retailer to Consumer
    const wheatRetailerToConsumer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      consumerId: consumerId,
      cropId: wheatCrop._id,
      quantity: 25,
      price: 0.0008,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Consumer Product
    const wheatConsumerProduct = await ConsumerProduct.create({
      name: 'Wheat',
      description: 'Grown in Madhya Pradesh',
      price: 0.0008,
      costPrice: 0.0005,
      sellingPrice: 0.0008,
      quantity: 25,
      harvestDate: new Date('2025-04-23'),
      location: 'Madhya Pradesh',
      image: 'wheat.jpg',
      consumerId: consumerId,
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: wheatCrop._id,
      status: 'available'
    });

    // 2. Add Potato
    const potatoCrop = await Crop.create({
      name: 'Potato',
      description: 'Grown in West Bengal',
      sellingPrice: 0.0005,
      costPrice: 0.0003,
      quantity: 30,
      harvestDate: new Date('2025-04-21'),
      location: 'West Bengal',
      image: 'potato.jpg',
      farmerId: farmerId,
      status: 'available',
      itemId: 'POTATO_' + Date.now()
    });

    // Transaction: Farmer to Distributor
    const potatoFarmerToDistributor = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      cropId: potatoCrop._id,
      quantity: 30,
      price: 0.0005,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Distributor Product
    const potatoDistributorProduct = await RetailerProduct.create({
      name: 'Potato',
      description: 'Grown in West Bengal',
      price: 0.0007,
      costPrice: 0.0005,
      quantity: 30,
      harvestDate: new Date('2025-04-21'),
      location: 'West Bengal',
      image: 'potato.jpg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: potatoCrop._id,
      status: 'available'
    });

    // Transaction: Distributor to Retailer
    const potatoDistributorToRetailer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      cropId: potatoCrop._id,
      quantity: 30,
      price: 0.0007,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Retailer Product
    const potatoRetailerProduct = await RetailerProduct.create({
      name: 'Potato',
      description: 'Grown in West Bengal',
      price: 0.0007,
      costPrice: 0.0005,
      quantity: 30,
      harvestDate: new Date('2025-04-21'),
      location: 'West Bengal',
      image: 'potato.jpg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: potatoCrop._id,
      status: 'available'
    });

    // Transaction: Retailer to Consumer
    const potatoRetailerToConsumer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      consumerId: consumerId,
      cropId: potatoCrop._id,
      quantity: 30,
      price: 0.0007,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Consumer Product
    const potatoConsumerProduct = await ConsumerProduct.create({
      name: 'Potato',
      description: 'Grown in West Bengal',
      price: 0.0007,
      costPrice: 0.0005,
      sellingPrice: 0.0007,
      quantity: 30,
      harvestDate: new Date('2025-04-21'),
      location: 'West Bengal',
      image: 'potato.jpg',
      consumerId: consumerId,
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: potatoCrop._id,
      status: 'available'
    });

    // 3. Add Rice
    const riceCrop = await Crop.create({
      name: 'Rice',
      description: 'Grown in Andhra Pradesh',
      sellingPrice: 0.0008,
      costPrice: 0.0005,
      quantity: 45,
      harvestDate: new Date('2025-04-21'),
      location: 'Andhra Pradesh',
      image: 'Rice.jpeg',
      farmerId: farmerId,
      status: 'available',
      itemId: 'RICE_' + Date.now()
    });

    // Transaction: Farmer to Distributor
    const riceFarmerToDistributor = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      cropId: riceCrop._id,
      quantity: 45,
      price: 0.0008,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Distributor Product
    const riceDistributorProduct = await RetailerProduct.create({
      name: 'Rice',
      description: 'Grown in Andhra Pradesh',
      price: 0.0010,
      costPrice: 0.0008,
      quantity: 45,
      harvestDate: new Date('2025-04-21'),
      location: 'Andhra Pradesh',
      image: 'Rice.jpeg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: riceCrop._id,
      status: 'available'
    });

    // Transaction: Distributor to Retailer
    const riceDistributorToRetailer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      cropId: riceCrop._id,
      quantity: 45,
      price: 0.0010,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Retailer Product
    const riceRetailerProduct = await RetailerProduct.create({
      name: 'Rice',
      description: 'Grown in Andhra Pradesh',
      price: 0.0013,
      costPrice: 0.0010,
      quantity: 45,
      harvestDate: new Date('2025-04-21'),
      location: 'Andhra Pradesh',
      image: 'Rice.jpeg',
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: riceCrop._id,
      status: 'available'
    });

    // Transaction: Retailer to Consumer
    const riceRetailerToConsumer = await Transaction.create({
      farmerId: farmerId,
      distributorId: distributorId,
      retailerId: retailerId,
      consumerId: consumerId,
      cropId: riceCrop._id,
      quantity: 45,
      price: 0.0013,
      status: 'completed',
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64)
    });

    // Consumer Product
    const riceConsumerProduct = await ConsumerProduct.create({
      name: 'Rice',
      description: 'Grown in Andhra Pradesh',
      price: 0.0013,
      costPrice: 0.0010,
      sellingPrice: 0.0013,
      quantity: 45,
      harvestDate: new Date('2025-04-21'),
      location: 'Andhra Pradesh',
      image: 'Rice.jpeg',
      consumerId: consumerId,
      retailerId: retailerId,
      distributorId: distributorId,
      cropId: riceCrop._id,
      status: 'available'
    });

    console.log('Dummy data added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding dummy data:', error);
    process.exit(1);
  }
}); 