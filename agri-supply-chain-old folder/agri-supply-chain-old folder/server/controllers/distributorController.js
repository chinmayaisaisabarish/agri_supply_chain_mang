const Crop = require('../models/Crop');
const Order = require('../models/Order');
const { contract, web3 } = require('../config/blockchain');
const Inventory = require('../models/Inventory');
const RetailerProduct = require('../models/RetailerProduct');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { generateQRCode } = require('../utils/qrcode');

// Get crops available in the marketplace (with quantity > 0)
exports.getMarketplaceCrops = async (req, res) => {
  try {
    console.log("Fetching marketplace crops...");
    const crops = await Crop.find({ 
      quantity: { $gt: 0 },
      status: "available"
    })
      .populate('farmerId', 'name walletAddress')
      .select('-__v')
      .lean();

    console.log("Found crops:", crops);

    // Transform the data to include farmer name and wallet address
    const transformedCrops = crops.map(crop => ({
      ...crop,
      farmer: {
        name: crop.farmerId?.name || 'Unknown',
        walletAddress: crop.farmerId?.walletAddress
      },
      farmerId: undefined // Remove the original farmerId field
    }));

    console.log("Transformed crops:", transformedCrops);
    res.json(transformedCrops);
  } catch (error) {
    console.error('❌ Error fetching marketplace crops:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Place an order (with blockchain integration)
exports.placeOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const distributorId = req.user.id;

    // Create orders in MongoDB
    const orders = await Promise.all(
      items.map(async (item) => {
        const order = new Order({
          distributorId,
          cropId: item.crop_id,
          quantity: item.quantity,
          price: item.price,
          status: 'Pending'
        });
        return order.save();
      })
    );

    // Call blockchain to record the transaction
    try {
      const accounts = await web3.eth.getAccounts();
      const firstCrop = items[0];
      const firstOrder = orders[0];

      // Record the order on the blockchain
      await contract.methods
        .recordOrder(
          firstOrder._id.toString(),
          firstCrop.name,
          req.user.email,
          firstCrop.quantity,
          firstCrop.price
        )
        .send({ from: accounts[0], gas: 300000 });

      res.json({ message: '✅ Order placed + Blockchain Tx done' });
    } catch (blockErr) {
      console.error('Blockchain error:', blockErr);
      res.status(500).json({ error: 'Order saved but blockchain failed' });
    }
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get distributor orders
exports.getDistributorOrders = async (req, res) => {
  try {
    const distributorId = req.user.id;
    const orders = await Order.find({ distributorId })
      .populate('cropId', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching distributor orders:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const distributorId = req.user.id;

    const orders = await Promise.all(
      items.map(async (item) => {
        const order = new Order({
          distributorId,
          cropId: item.cropId,
          quantity: item.quantity,
          price: item.total,
          status: 'Pending'
        });
        return order.save();
      })
    );

    // Update inventory after the order is placed
    await Promise.all(
      items.map(item => updateInventoryFromOrder(distributorId, item.cropId, item.quantity))
    );

    res.status(200).json({ message: '✅ Order placed!', orderCount: orders.length });
  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ error: 'Order failed' });
  }
};

// Update inventory when an order is placed
const updateInventoryFromOrder = async (distributorId, cropId, quantity) => {
  try {
    const inventory = await Inventory.findOne({ distributorId, cropId });
    
    if (inventory) {
      inventory.quantity += quantity;
      await inventory.save();
    } else {
      const newInventory = new Inventory({
        distributorId,
        cropId,
        quantity
      });
      await newInventory.save();
    }
  } catch (error) {
    console.error('❌ Inventory update error:', error);
    throw error;
  }
};

// Get distributor's inventory
exports.getInventory = async (req, res) => {
  try {
    const distributorId = req.user._id;
    console.log("Fetching inventory for distributor:", distributorId);
    console.log("User object:", req.user);

    const inventory = await Inventory.find({ distributorId })
      .populate('cropId', 'name description image sellingPrice costPrice quantity harvestDate location')
      .sort({ createdAt: -1 });

    console.log("Found inventory items:", inventory);

    const formattedInventory = inventory.map(item => ({
      _id: item._id,
      cropId: {
        _id: item.cropId?._id,
        name: item.cropId?.name,
        description: item.cropId?.description,
        image: item.cropId?.image,
        sellingPrice: item.cropId?.sellingPrice,
        costPrice: item.cropId?.costPrice,
        quantity: item.quantity,
        harvestDate: item.cropId?.harvestDate,
        location: item.cropId?.location
      },
      quantity: item.quantity,
      status: item.status,
      createdAt: item.createdAt
    }));

    console.log("Formatted inventory:", formattedInventory);
    res.status(200).json(formattedInventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// List crop for retailers
exports.listForRetailer = async (req, res) => {
  try {
    const { inventoryId, price } = req.body;
    const distributorId = req.user._id;

    // Find the inventory item
    const inventory = await Inventory.findOne({
      _id: inventoryId,
      distributorId,
      status: 'available'
    });

    if (!inventory) {
      return res.status(400).json({ error: 'Crop not found in your inventory' });
    }

    // Find the crop
    const crop = await Crop.findById(inventory.cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Check if crop is already listed
    const existingListing = await RetailerProduct.findOne({
      distributorId,
      cropId: inventory.cropId,
      status: 'listed'
    });

    if (existingListing) {
      return res.status(400).json({ error: 'This crop is already listed for retailers' });
    }

    // Create a new product listing for retailers
    const product = new RetailerProduct({
      name: crop.name,
      description: crop.description,
      price: parseFloat(price),
      quantity: inventory.quantity,
      distributorId,
      cropId: crop._id,
      status: 'listed',
      image: crop.image
    });

    console.log("Created product:", product);
    await product.save();

    // Update the inventory status to sold
    inventory.status = 'sold';
    await inventory.save();

    // Return success response with the created product
    res.status(201).json({
      message: 'Product listed successfully for retailers',
      product
    });
  } catch (error) {
    console.error('Error listing product for retailers:', error);
    res.status(500).json({ error: 'Failed to list product for retailers' });
  }
};

// Get all listed products for a specific distributor
exports.getListedProducts = async (req, res) => {
  try {
    const distributorId = req.query.distributorId;

    if (!distributorId) {
      return res.status(400).json({ error: 'distributorId is required' });
    }

    const products = await RetailerProduct.find({ distributorId })
      .populate('cropId', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching listed products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get distributor profile
exports.getProfile = async (req, res) => {
  try {
    const distributor = await User.findById(req.user._id).select('-password');
    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }
    res.status(200).json(distributor);
  } catch (error) {
    console.error('Error fetching distributor profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Get available crops for distributors
exports.getAvailableCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ 
      quantity: { $gt: 0 },
      status: "available" // Only show available crops
    })
      .populate('farmerId', 'name walletAddress')
      .select('-__v')
      .lean();

    // Transform the data to include farmer name and wallet address
    const transformedCrops = crops.map(crop => ({
      ...crop,
      farmer: {
        name: crop.farmerId?.name || 'Unknown',
        walletAddress: crop.farmerId?.walletAddress
      },
      farmerId: undefined // Remove the original farmerId field
    }));

    res.json(transformedCrops);
  } catch (error) {
    console.error('Error fetching available crops:', error);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
};

// Buy crop from farmer
exports.buyCrop = async (req, res) => {
  try {
    const { cropId, blockchainTxHash, price, farmerWallet, distributorWallet } = req.body;
    const distributor = await User.findById(req.user._id);

    // Find the crop
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    if (crop.status !== "available") {
      return res.status(400).json({ error: "Crop is not available for purchase" });
    }

    // Generate new itemId for distributor
    const distributorItemId = `${crop.itemId}D${distributor.roleId}`;

    // Create transaction record
    const transaction = new Transaction({
      orderId: null, // Will be updated when order is created
      farmerId: crop.farmerId,
      distributorId: distributor._id,
      cropId: crop._id,
      quantity: crop.quantity,
      price: parseFloat(price),
      status: "completed",
      blockchainTxHash: blockchainTxHash,
      farmerWallet: farmerWallet,
      distributorWallet: distributorWallet,
      transactionDate: new Date()
    });

    // Update crop status and add to supply chain
    crop.status = "sold";
    crop.purchaseDate = new Date();
    
    // Ensure all required fields are present in the supply chain entry
    const supplyChainEntry = {
      role: "Distributor",
      roleId: distributor.roleId,
      itemId: distributorItemId,
      sellingPrice: parseFloat(price),
      costPrice: crop.sellingPrice,
      harvestDate: crop.harvestDate || new Date(),
      location: crop.location || "Unknown",
      transactionDate: new Date(),
      farmerWallet: farmerWallet,
      distributorWallet: distributorWallet
    };

    // Add the supply chain entry
    crop.supplyChain.push(supplyChainEntry);

    // Create inventory record for the distributor
    const inventory = new Inventory({
      distributorId: distributor._id,
      cropId: crop._id,
      quantity: crop.quantity,
      status: 'available'
    });

    // Save transaction, crop updates, and inventory
    await Promise.all([
      transaction.save(),
      crop.save(),
      inventory.save()
    ]);

    // Update farmer's wallet balance in the database
    const farmer = await User.findById(crop.farmerId);
    if (farmer) {
      farmer.walletBalance = (farmer.walletBalance || 0) + parseFloat(price);
      await farmer.save();
    }

    res.status(200).json({
      message: "Crop purchased successfully",
      transaction,
      updatedCrop: crop,
      inventory
    });
  } catch (error) {
    console.error("Error buying crop:", error);
    res.status(500).json({ error: "Failed to buy crop", details: error.message });
  }
};

// Get distributor's purchased crops
exports.getPurchasedCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ 
      'supplyChain.roleId': req.user.roleId,
      status: 'sold'
    })
      .populate('farmerId', 'name roleId')
      .sort({ createdAt: -1 });

    const formattedCrops = crops.map(crop => ({
      _id: crop._id,
      name: crop.name,
      price: crop.price,
      quantity: crop.quantity,
      harvestDate: crop.harvestDate,
      location: crop.location,
      image: crop.image,
      farmerName: crop.farmerId.name,
      farmerId: crop.farmerId.roleId,
      itemId: crop.itemId,
      supplyChain: crop.supplyChain,
      qrCode: crop.qrCode
    }));

    res.status(200).json(formattedCrops);
  } catch (error) {
    console.error('Error fetching purchased crops:', error);
    res.status(500).json({ error: 'Failed to fetch purchased crops' });
  }
};

// Get distributor's orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ distributorId: req.user._id })
      .populate('cropId', 'name price')
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get distributor's transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ distributorId: req.user._id })
      .populate("farmerId", "name roleId")
      .populate("cropId", "name itemId image")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Update distributor profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const distributor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");
    if (!distributor) {
      return res.status(404).json({ error: "Distributor not found" });
    }
    res.status(200).json(distributor);
  } catch (error) {
    console.error("Error updating distributor profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
