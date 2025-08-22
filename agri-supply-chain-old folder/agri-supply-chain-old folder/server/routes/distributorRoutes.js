const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const { auth } = require('../middleware/auth');

// Protect all routes with the auth middleware
router.use(auth);

// Profile routes
router.get('/profile', distributorController.getProfile);
router.put('/profile', distributorController.updateProfile);

// Crop routes
router.get('/crops', distributorController.getMarketplaceCrops);
router.post('/buy-crop', distributorController.buyCrop);

// Inventory routes
router.get('/my-inventory', distributorController.getInventory);
router.post('/list-for-retail', distributorController.listForRetailer);

// Transaction routes
router.get('/transactions', distributorController.getTransactions);

// Get listed products
router.get('/listed-products', distributorController.getListedProducts);

module.exports = router;
