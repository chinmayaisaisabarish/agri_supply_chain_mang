const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailercontroller');
const { auth } = require('../middleware/auth');

// Protect all routes with the auth middleware
router.use(auth);

// Profile routes
router.get('/profile', retailerController.getProfile);
router.put('/profile', retailerController.updateProfile);

// Crop routes
router.get('/crops', retailerController.getAvailableCrops);
router.post('/buy-crop', retailerController.buyCrop);

// Inventory routes
router.get('/my-inventory', retailerController.getInventory);
router.post('/list-for-consumer', retailerController.listForConsumer);

// Transaction routes
router.get('/transactions', retailerController.getTransactions);

// Get listed products
router.get('/listed-products', retailerController.getListedProducts);

// Product routes
router.get('/products', retailerController.getAllProducts);
router.post('/products', retailerController.addProduct);
router.put('/products/:id', retailerController.updateProduct);
router.delete('/products/:id', retailerController.deleteProduct);

// Order routes
router.get('/orders', retailerController.getOrders);
router.post('/orders', retailerController.createOrder);
router.put('/orders/:id/status', retailerController.updateOrderStatus);

module.exports = router; 