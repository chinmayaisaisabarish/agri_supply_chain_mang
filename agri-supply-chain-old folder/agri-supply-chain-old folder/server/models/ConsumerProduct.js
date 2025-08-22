const mongoose = require('mongoose');

const consumerProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'listed'],
    default: 'available'
  },
  listedDate: {
    type: Date,
    default: Date.now
  },
  costPrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  blockchainTxHash: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ConsumerProduct', consumerProductSchema); 