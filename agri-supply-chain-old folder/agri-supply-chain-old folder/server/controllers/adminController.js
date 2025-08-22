const User = require('../models/User');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');
const generateCSV = require('../utils/csvGenerator');
const mongoose = require('mongoose');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const cropStats = await Crop.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const transactionCount = await Transaction.countDocuments();

    res.json({
      success: true,
      stats: {
        users: userStats,
        crops: cropStats,
        transactions: transactionCount
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics' });
  }
};

// Get all crops with supply chain data
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find()
      .populate('farmerId', 'name email walletAddress')
      .populate('distributorId', 'name email walletAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      crops: crops.map(crop => ({
        _id: crop._id,
        name: crop.name,
        description: crop.description,
        status: crop.status,
        createdAt: crop.createdAt,
        farmer: crop.farmerId,
        distributor: crop.distributorId,
        supplyChain: crop.supplyChain || [],
        quantity: crop.quantity,
        sellingPrice: crop.sellingPrice,
        costPrice: crop.costPrice,
        image: crop.image,
        listedBy: crop.listedBy,
        listedForConsumer: crop.listedForConsumer,
        itemId: crop.itemId
      }))
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops',
      error: error.message
    });
  }
};

// Get specific crop's supply chain
exports.getCropChain = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId)
      .populate('farmer', 'name email')
      .populate('distributor', 'name email')
      .populate('retailer', 'name email')
      .populate('transactions');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({ success: true, crop });
  } catch (error) {
    console.error('Error getting crop chain:', error);
    res.status(500).json({ success: false, message: 'Error fetching crop chain' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ success: false, message: 'Error fetching user details' });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('farmerId', 'name email')
      .populate('distributorId', 'name email')
      .populate('retailerId', 'name email')
      .populate('cropId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting transactions'
    });
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('crop', 'name quantity price')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error getting transaction details:', error);
    res.status(500).json({ success: false, message: 'Error fetching transaction details' });
  }
};

// Export transactions to CSV
exports.exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('farmerId', 'name email')
      .populate('distributorId', 'name email')
      .populate('retailerId', 'name email')
      .populate('cropId', 'name price')
      .sort({ createdAt: -1 });

    const csvData = transactions.map(transaction => ({
      'Transaction ID': transaction._id,
      'Farmer': transaction.farmerId?.name || 'N/A',
      'Distributor': transaction.distributorId?.name || 'N/A',
      'Retailer': transaction.retailerId?.name || 'N/A',
      'Crop': transaction.cropId?.name || 'N/A',
      'Quantity': transaction.quantity,
      'Price': transaction.price,
      'Status': transaction.status,
      'Blockchain Tx Hash': transaction.blockchainTxHash,
      'Created At': transaction.createdAt
    }));

    const csv = await generateCSV(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions'
    });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res) => {
  try {
    // Implement system logs functionality
    res.json({ success: true, message: 'System logs functionality to be implemented' });
  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({ success: false, message: 'Error fetching system logs' });
  }
};

// Get system status
exports.getSystemStatus = async (req, res) => {
  try {
    const status = {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      api: 'running',
      lastChecked: new Date()
    };
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ success: false, message: 'Error fetching system status' });
  }
}; 