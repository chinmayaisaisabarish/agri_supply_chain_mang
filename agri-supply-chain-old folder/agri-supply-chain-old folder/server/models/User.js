const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    required: [true, 'Please select a role'],
    enum: ['farmer', 'distributor', 'retailer', 'consumer', 'admin']
  },
  roleId: {
    type: String,
    trim: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  location: {
    type: String
  },
  profile_image: {
    type: String
  },
  walletAddress: {
    type: String,
    trim: true,
    sparse: true,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate roleId
userSchema.pre('save', async function(next) {
  if (!this.roleId && this.role !== 'admin') {
    const rolePrefix = this.role.charAt(0).toUpperCase();
    const count = await this.constructor.countDocuments({ role: this.role });
    this.roleId = `${rolePrefix}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 