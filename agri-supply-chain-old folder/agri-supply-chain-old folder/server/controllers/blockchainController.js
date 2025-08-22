const { contract, web3 } = require('../config/blockchain');

// Record a transaction on the blockchain (called when an order is placed)
exports.recordTransaction = async (req, res) => {
  const { orderId, cropName, distributor, quantity, price } = req.body;

  try {
    const accounts = await web3.eth.getAccounts();

    const tx = await contract.methods
      .recordOrder(orderId, cropName, distributor, quantity, price)
      .send({ from: accounts[0], gas: 300000 });

    res.json({ message: 'Transaction sent!', txHash: tx.transactionHash });
  } catch (err) {
    console.error('Blockchain error:', err);
    res.status(500).json({ error: 'Blockchain transaction failed' });
  }
};

// Log a transaction (used for custom logging like crop purchases)
exports.logTransaction = async (req, res) => {
  const { cropName, buyer, quantity, price } = req.body;

  try {
    const tx = await contract.addLog(cropName, buyer, quantity, price);
    await tx.wait(); // Wait for it to be mined

    res.status(200).json({ message: '✅ Logged on blockchain', txHash: tx.hash });
  } catch (err) {
    console.error('❌ Blockchain error:', err);
    res.status(500).json({ error: 'Failed to log transaction' });
  }
};

// Fetch transaction logs from the blockchain
exports.getLogs = async (req, res) => {
  try {
    const count = await contract.getLogsCount();
    const logs = [];

    for (let i = 0; i < count; i++) {
      const [cropName, buyer, quantity, price, timestamp] = await contract.getLog(i);
      logs.push({
        cropName,
        buyer,
        quantity: quantity.toString(),
        price: price.toString(),
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
      });
    }

    res.status(200).json(logs.reverse()); // return logs from most recent to oldest
  } catch (err) {
    console.error('❌ Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch blockchain logs' });
  }
};
