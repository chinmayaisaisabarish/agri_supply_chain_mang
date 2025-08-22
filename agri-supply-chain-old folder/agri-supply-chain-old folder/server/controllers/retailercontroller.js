const User = require('../models/User');
const RetailerProduct = require('../models/RetailerProduct');
const ConsumerProduct = require('../models/ConsumerProduct');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Crop = require('../models/Crop');
const { contract, web3 } = require('../config/blockchain');
const { generateQRCode } = require('../utils/qrcode');

// Get retailer profile
exports.getProfile = async (req, res) => {
  try {
    const retailer = await User.findById(req.user._id).select('-password');
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }
    res.status(200).json(retailer);
  } catch (error) {
    console.error('Error fetching retailer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update retailer profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const retailer = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }
    
    res.status(200).json(retailer);
  } catch (error) {
    console.error('Error updating retailer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await RetailerProduct.find({ retailerId: req.user._id })
      .populate('distributorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, quantity, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new RetailerProduct({
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      description,
      image,
      retailerId: req.user._id
    });

    await product.save();
    res.status(201).json({ 
      message: 'Product added successfully!',
      productId: product._id
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, quantity, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const updates = {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      description
    };

    if (image) {
      updates.image = image;
    }

    const product = await RetailerProduct.findOneAndUpdate(
      { _id: req.params.id, retailerId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await RetailerProduct.findOneAndDelete({
      _id: req.params.id,
      retailerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ retailerId: req.user._id })
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    
    const order = new Order({
      retailerId: req.user._id,
      products,
      status: 'pending'
    });
    
    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
    })
      .populate('cropId')
      .populate('buyerId', 'name')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get available crops from distributors
exports.getAvailableCrops = async (req, res) => {
  try {
    console.log("Fetching available crops for retailer");
    // Find all products that are listed for retailers
    const products = await RetailerProduct.find({ 
      status: 'listed'
    })
    .populate({
      path: 'distributorId',
      select: 'name walletAddress',
      model: 'User'
    })
    .populate('cropId', 'name description image')
    .sort({ createdAt: -1 });

    console.log("Found raw products:", products);

    // Transform the data to match the frontend expectations
    const formattedProducts = products.map(product => {
      if (!product.distributorId) {
        console.error("Missing distributor for product:", product._id);
        return null;
      }

      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        sellingPrice: product.price,
        quantity: product.quantity,
        status: product.status,
        distributorId: {
          _id: product.distributorId._id,
          name: product.distributorId.name,
          walletAddress: product.distributorId.walletAddress
        },
        cropId: product.cropId?._id
      };
    }).filter(Boolean); // Remove any null entries

    console.log("Formatted products:", formattedProducts);
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching available crops:', error);
    res.status(500).json({ error: 'Failed to fetch available crops' });
  }
};

// Buy crop from distributor
exports.buyCrop = async (req, res) => {
  try {
    const { _id, price, quantity } = req.body;
    const retailerId = req.user._id;

    console.log("Buy crop request:", { _id, price, quantity, retailerId });

    // Find the product in the marketplace
    const product = await RetailerProduct.findById(_id)
      .populate({
        path: 'distributorId',
        select: 'name walletAddress',
        model: 'User'
      })
      .populate('cropId', 'name description image');

    console.log("Found product:", product);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is listed
    if (product.status !== 'listed') {
      console.log("Product status check failed:", {
        expected: 'listed',
        actual: product.status,
        productId: product._id
      });
      return res.status(400).json({ error: 'Product is not available for purchase' });
    }

    // Check if quantity is available
    if (product.quantity < quantity) {
      console.log("Quantity check failed:", {
        requested: quantity,
        available: product.quantity,
        productId: product._id
      });
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    // Update the product's status and assign to retailer
    product.quantity -= parseInt(quantity);
    if (product.quantity === 0) {
      product.status = 'sold';
    } else {
      // Create a new product for the retailer
      const retailerProduct = new RetailerProduct({
        name: product.name,
        description: product.description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        distributorId: product.distributorId,
        cropId: product.cropId,
        retailerId: retailerId,
        status: 'available',
        image: product.image
      });
      await retailerProduct.save();
    }
    await product.save();

    // Create a transaction record
    const transaction = new Transaction({
      cropId: product.cropId._id,
      buyerId: retailerId,
      sellerId: product.distributorId._id,
      distributorId: product.distributorId._id,
      farmerId: product.cropId.farmerId,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      status: 'completed'
    });

    await transaction.save();

    // Get updated marketplace crops
    const marketplaceCrops = await RetailerProduct.find({ 
      status: 'listed'
    })
    .populate({
      path: 'distributorId',
      select: 'name walletAddress',
      model: 'User'
    })
    .populate('cropId', 'name description image')
    .sort({ createdAt: -1 });

    // Format marketplace crops to match frontend expectations
    const formattedMarketplaceCrops = marketplaceCrops.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      sellingPrice: product.price,
      quantity: product.quantity,
      status: product.status,
      distributorId: {
        _id: product.distributorId._id,
        name: product.distributorId.name,
        walletAddress: product.distributorId.walletAddress
      },
      cropId: product.cropId._id
    }));

    // Get retailer's owned crops
    const ownedCrops = await RetailerProduct.find({
      retailerId: retailerId,
      status: 'available'
    })
    .populate({
      path: 'distributorId',
      select: 'name walletAddress',
      model: 'User'
    })
    .populate('cropId', 'name description image')
    .sort({ createdAt: -1 });

    // Format owned crops to match frontend expectations
    const formattedOwnedCrops = ownedCrops.map(item => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
      sellingPrice: item.price,
      quantity: item.quantity,
      status: item.status,
      distributorId: {
        _id: item.distributorId._id,
        name: item.distributorId.name,
        walletAddress: item.distributorId.walletAddress
      },
      cropId: item.cropId._id
    }));

    res.status(200).json({
      success: true,
      message: 'Crop purchased successfully',
      marketplaceCrops: formattedMarketplaceCrops,
      ownedCrops: formattedOwnedCrops
    });
  } catch (error) {
    console.error('Error buying crop:', error);
    res.status(500).json({ error: 'Failed to purchase crop' });
  }
};

// Get retailer's inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await RetailerProduct.find({ 
      retailerId: req.user._id,
      status: { $ne: 'listed' } // Only show items that are not listed for consumers
    })
      .populate('cropId', 'name description image harvestDate location')
      .populate('distributorId', 'name walletAddress')
      .sort({ createdAt: -1 });
    
    const formattedInventory = inventory.map(item => ({
      _id: item._id,
      cropId: {
        _id: item.cropId?._id,
        name: item.cropId?.name,
        description: item.cropId?.description,
        image: item.cropId?.image,
        harvestDate: item.cropId?.harvestDate,
        location: item.cropId?.location
      },
      price: item.price,
      quantity: item.quantity,
      status: item.status,
      distributorId: item.distributorId ? {
        _id: item.distributorId._id,
        name: item.distributorId.name,
        walletAddress: item.distributorId.walletAddress
      } : null
    }));

    res.status(200).json(formattedInventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// Get retailer's owned crops
exports.getOwnedCrops = async (req, res) => {
  try {
    const ownedCrops = await RetailerProduct.find({
      retailerId: req.user._id,
      status: 'available'
    })
    .populate('cropId', 'name description image harvestDate location')
    .populate('distributorId', 'name walletAddress')
    .sort({ createdAt: -1 });

    const formattedCrops = ownedCrops.map(item => ({
      _id: item._id,
      cropId: {
        _id: item.cropId?._id,
        name: item.cropId?.name,
        description: item.cropId?.description,
        image: item.cropId?.image,
        harvestDate: item.cropId?.harvestDate,
        location: item.cropId?.location
      },
      price: item.price,
      quantity: item.quantity,
      status: item.status,
      distributorId: item.distributorId ? {
        _id: item.distributorId._id,
        name: item.distributorId.name,
        walletAddress: item.distributorId.walletAddress
      } : null
    }));

    res.status(200).json(formattedCrops);
  } catch (error) {
    console.error('Error fetching owned crops:', error);
    res.status(500).json({ error: 'Failed to fetch owned crops' });
  }
};

// List product for consumers
exports.listForConsumer = async (req, res) => {
  try {
    const { cropId, price, quantity } = req.body;
    const retailerId = req.user._id;
    
    // Find the crop
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    // Check if crop is available and owned by retailer
    const retailerInSupplyChain = crop.supplyChain.find(
      item => item.role === 'Retailer' && item.roleId === req.user.roleId
    );
    
    if (!retailerInSupplyChain) {
      return res.status(400).json({ error: 'You do not own this crop' });
    }
    
    if (crop.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }
    
    // Create a new listing for consumers
    const productListing = new ConsumerProduct({
      name: crop.name,
      description: crop.description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      retailerId,
      distributorId: crop.distributorId,
      cropId: crop._id,
      status: 'listed',
      image: crop.image,
      costPrice: retailerInSupplyChain.costPrice,
      sellingPrice: parseFloat(price),
      blockchainTxHash: crop.blockchainTxHash
    });
    
    await productListing.save();
    
    // Update the crop's quantity and status
    crop.quantity -= parseInt(quantity);
    if (crop.quantity === 0) {
      crop.status = 'sold';
    }
    await crop.save();
    
    // Get updated owned crops
    const ownedCrops = await Crop.find({
      'supplyChain.role': 'Retailer',
      'supplyChain.roleId': req.user.roleId,
      status: 'available'
    })
    .populate('distributorId', 'name')
    .sort({ createdAt: -1 });
    
    res.status(201).json({
      message: 'Product listed successfully for consumers',
      product: productListing,
      ownedCrops
    });
  } catch (error) {
    console.error('Error listing product:', error);
    res.status(500).json({ error: 'Failed to list product' });
  }
};

// Get retailer's transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { buyerId: req.user._id },
        { sellerId: req.user._id }
      ]
    })
    .populate('cropId')
    .populate('buyerId', 'name')
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get listed products
exports.getListedProducts = async (req, res) => {
  try {
    const products = await RetailerProduct.find({
      retailerId: req.user._id,
      status: 'listed'
    })
    .populate('cropId')
    .populate('distributorId', 'name')
    .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 