const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

// Verify admin role middleware
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.' 
    });
  }
  next();
};

// Admin dashboard routes
router.get('/dashboard', auth, verifyAdmin, adminController.getDashboardStats);
router.get('/supply-chain', auth, verifyAdmin, adminController.getAllCrops);
router.get('/supply-chain/:cropId', auth, verifyAdmin, adminController.getCropChain);

// User management routes
router.get('/users', auth, verifyAdmin, adminController.getAllUsers);
router.get('/users/:userId', auth, verifyAdmin, adminController.getUserDetails);
router.put('/users/:userId/status', auth, verifyAdmin, adminController.updateUserStatus);
router.put('/users/:userId', auth, verifyAdmin, adminController.updateUser);
router.delete('/users/:userId', auth, verifyAdmin, adminController.deleteUser);

// Transaction management routes
router.get('/transactions', auth, verifyAdmin, adminController.getAllTransactions);
router.get('/transactions/export', auth, verifyAdmin, adminController.exportTransactions);
router.get('/transactions/:transactionId', auth, verifyAdmin, adminController.getTransactionDetails);

// System logs and status
router.get('/logs', auth, verifyAdmin, adminController.getSystemLogs);
router.get('/status', auth, verifyAdmin, adminController.getSystemStatus);

module.exports = router; 