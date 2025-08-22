const mongoose = require('mongoose');

const supplyChainSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['Farmer', 'Distributor', 'Retailer', 'Consumer']
  },
  roleId: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  }
});

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'processing'],
    default: 'available'
  },
  listedBy: {
    type: String,
    enum: ['farmer', 'distributor', 'retailer'],
    default: 'farmer'
  },
  listedForConsumer: {
    type: Boolean,
    default: false
  },
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  supplyChain: [supplyChainSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', cropSchema); 