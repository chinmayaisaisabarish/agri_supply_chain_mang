const mongoose = require('mongoose');

const retailerProductSchema = new mongoose.Schema({
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
    ref: 'User'
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'listed'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RetailerProduct', retailerProductSchema); 