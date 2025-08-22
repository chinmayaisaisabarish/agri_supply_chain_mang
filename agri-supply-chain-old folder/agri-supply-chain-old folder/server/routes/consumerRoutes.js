const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Profile routes
router.get('/profile', consumerController.getProfile);
router.put('/profile', consumerController.updateProfile);

// Get available crops for consumers
router.get('/crops', consumerController.getAvailableCrops);

// Get supply chain information for a specific crop
router.get('/crops/chain/:cropId', consumerController.getSupplyChain);

// Place an order
router.post('/orders', consumerController.placeOrder);

// Get consumer's orders
router.get('/orders', consumerController.getOrders);

// Export transactions
router.get('/transactions/export', consumerController.exportTransactions);

module.exports = router; 