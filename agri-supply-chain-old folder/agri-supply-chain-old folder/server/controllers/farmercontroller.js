const Crop = require('../models/Crop');
const Order = require('../models/Order');
const User = require('../models/User');
const axios = require('axios');

// Add crop to the database
exports.addCrop = async (req, res) => {
  try {
    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);

    const {
      name,
      sellingPrice,
      costPrice,
      quantity,
      harvestDate,
      location,
      roleId,
      itemId,
      role,
      transactionDate,
      description,
    } = req.body;

    // Find the farmer user document
    const farmer = await User.findOne({ roleId: roleId });
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Validate required fields
    if (!name || !sellingPrice || !costPrice || !quantity || !harvestDate || !location || !roleId || !itemId || !role || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const crop = new Crop({
      name,
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice),
      quantity: parseInt(quantity),
      harvestDate,
      location,
      image: req.file ? req.file.filename : null,
      roleId,
      itemId,
      role,
      description,
      farmerId: farmer._id, // Use the actual MongoDB ObjectId
      status: "available",
      transactionDate: transactionDate || new Date(),
      supplyChain: [{
        role,
        roleId,
        itemId,
        sellingPrice: parseFloat(sellingPrice),
        costPrice: parseFloat(costPrice),
        harvestDate,
        location,
        transactionDate: transactionDate || new Date()
      }]
    });

    await crop.save();
    res.status(201).json({ message: "Crop added successfully!", crop });
  } catch (error) {
    console.error("Error adding crop:", error);
    res.status(500).json({ error: "Failed to add crop" });
  }
};

// Get all crops from the database
exports.getCrops = async (req, res) => {
  try {
    // Find the farmer user document
    const farmer = await User.findOne({ roleId: req.user.roleId });
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const crops = await Crop.find({ farmerId: farmer._id })
      .sort({ createdAt: -1 });
    res.status(200).json(crops);
  } catch (error) {
    console.error("Error fetching crops:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
};

// Get crop by ID
exports.getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }
    res.status(200).json(crop);
  } catch (error) {
    console.error("Error fetching crop:", error);
    res.status(500).json({ error: "Failed to fetch crop" });
  }
};

// Update crop
exports.updateCrop = async (req, res) => {
  try {
    const {
      name,
      sellingPrice,
      costPrice,
      quantity,
      harvestDate,
      location,
    } = req.body;

    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    crop.name = name || crop.name;
    crop.sellingPrice = sellingPrice ? parseFloat(sellingPrice) : crop.sellingPrice;
    crop.costPrice = costPrice ? parseFloat(costPrice) : crop.costPrice;
    crop.quantity = quantity ? parseInt(quantity) : crop.quantity;
    crop.harvestDate = harvestDate || crop.harvestDate;
    crop.location = location || crop.location;
    if (req.file) {
      crop.image = req.file.filename;
    }

    await crop.save();
    res.status(200).json({ message: "Crop updated successfully!", crop });
  } catch (error) {
    console.error("Error updating crop:", error);
    res.status(500).json({ error: "Failed to update crop" });
  }
};

// Delete crop
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }
    res.status(200).json({ message: "Crop deleted successfully!" });
  } catch (error) {
    console.error("Error deleting crop:", error);
    res.status(500).json({ error: "Failed to delete crop" });
  }
};

// Get crop count
exports.getCropCount = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const count = await Crop.countDocuments({ roleId: farmerId });
    res.json({ count });
  } catch (error) {
    console.error("Error getting crop count:", error);
    res.status(500).json({ message: "Error getting crop count" });
  }
};

// Get farmer profile
exports.getProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.user._id).select("-password");
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.status(200).json(farmer);
  } catch (error) {
    console.error("Error fetching farmer profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update farmer profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const farmer = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password");
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    res.status(200).json(farmer);
  } catch (error) {
    console.error("Error updating farmer profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Get orders for farmer
exports.getOrdersForFarmer = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.user._id })
      .populate("distributorId", "name")
      .populate("cropId", "name price")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// Blockchain logging function (using axios to make a POST request)
async function logBlockchain(row) {
  try {
    await axios.post('http://localhost:5000/api/blockchain/log', {
      cropName: row.crop_name,
      buyer: row.buyer_name,
      quantity: row.quantity,
      price: row.total_price,
    });
    console.log('✅ Blockchain log added');
  } catch (err) {
    console.error('❌ Error logging to blockchain:', err);
  }
}

