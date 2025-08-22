const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmercontroller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply auth middleware to all routes
router.use(auth);

// Profile routes
router.get('/profile', farmerController.getProfile);
router.put('/profile', farmerController.updateProfile);

// Crop routes
router.post('/crops', upload.single('image'), farmerController.addCrop);
router.get('/crops', farmerController.getCrops);
router.get('/crops/count/:farmerId', farmerController.getCropCount);
router.get('/crops/:id', farmerController.getCropById);
router.put('/crops/:id', upload.single('image'), farmerController.updateCrop);
router.delete('/crops/:id', farmerController.deleteCrop);

// Order/Transaction routes
router.get('/orders', farmerController.getOrdersForFarmer);
router.put('/orders/:id/status', farmerController.updateOrderStatus);

module.exports = router;
