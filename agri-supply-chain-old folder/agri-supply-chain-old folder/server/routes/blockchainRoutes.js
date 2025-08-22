const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { contract, provider } = require('../config/blockchain');

// Endpoint to record a transaction on the blockchain
router.post('/record', blockchainController.recordTransaction);

// Endpoint to log transactions on the blockchain
router.post('/log', blockchainController.logTransaction);

// Endpoint to get logs from the blockchain
router.get('/logs', blockchainController.getLogs);

// Endpoint to get wallet balance
router.get('/balance/:address', async (req, res) => {
    try {
        const balance = await provider.getBalance(req.params.address);
        res.json({ balance: balance.toString() });
    } catch (err) {
        console.error('Error getting balance:', err);
        res.status(500).json({ error: 'Failed to get balance', details: err.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
      const data = await contract.methods.getOrder(req.params.id).call();
      res.json({
        cropName: data[0],
        distributor: data[1],
        quantity: data[2],
        price: data[3],
        timestamp: data[4],
      });
    } catch (err) {
      res.status(500).json({ error: 'Blockchain read failed', details: err.message });
    }
});
  
module.exports = router;
