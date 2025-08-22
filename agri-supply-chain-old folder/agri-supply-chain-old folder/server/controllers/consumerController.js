const Crop = require('../models/Crop');
const Order = require('../models/Order');
const User = require('../models/User');
const ConsumerProduct = require('../models/ConsumerProduct');

// Get all crops available for consumers
exports.getAvailableCrops = async (req, res) => {
  try {
    console.log('Fetching available consumer products...');
    
    // Get all available consumer products
    const products = await ConsumerProduct.find({ 
      status: 'available',
      quantity: { $gt: 0 }
    })
    .populate('retailerId', 'name email walletAddress')
    .sort({ createdAt: -1 });
    
    console.log('Found available products:', products.length);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching available products:', error);
    res.status(500).json({ message: 'Error fetching available products' });
  }
};

// Get supply chain information for a specific product
exports.getSupplyChain = async (req, res) => {
  try {
    const { cropId } = req.params;
    
    const product = await ConsumerProduct.findById(cropId)
      .populate('retailerId', 'name email location walletAddress');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const supplyChain = [
      {
        role: 'Retailer',
        name: product.retailerId.name,
        email: product.retailerId.email,
        location: product.retailerId.location,
        date: product.createdAt
      }
    ];

    res.json({
      product: {
        name: product.name,
        price: product.sellingPrice,
        quantity: product.quantity,
        description: product.description
      },
      chain: supplyChain
    });
  } catch (error) {
    console.error('Error fetching supply chain:', error);
    res.status(500).json({ message: 'Error fetching supply chain information' });
  }
};

// Place an order for a crop
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const consumerId = req.user.id;

    const product = await ConsumerProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    const order = new Order({
      product: productId,
      consumer: consumerId,
      retailer: product.retailerId,
      quantity,
      totalPrice: product.sellingPrice * quantity,
      status: 'pending'
    });

    await order.save();

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.status = 'sold';
    }
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

// Get consumer's orders
exports.getOrders = async (req, res) => {
  try {
    const consumerId = req.user.id;
    
    const orders = await Order.find({ consumer: consumerId })
      .populate('product', 'name sellingPrice')
      .populate('retailer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get consumer profile
exports.getProfile = async (req, res) => {
  try {
    const consumer = await User.findById(req.user._id).select('-password');
    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }
    res.status(200).json(consumer);
  } catch (error) {
    console.error('Error fetching consumer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update consumer profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const consumer = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }
    
    res.status(200).json(consumer);
  } catch (error) {
    console.error('Error updating consumer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Export transactions
exports.exportTransactions = async (req, res) => {
  try {
    const consumerId = req.user.id;
    
    const orders = await Order.find({ consumer: consumerId })
      .populate('product', 'name sellingPrice')
      .populate('retailer', 'name email')
      .sort({ createdAt: -1 });
    
    // Format data for CSV
    const csvData = orders.map(order => ({
      'Order ID': order._id,
      'Product Name': order.product.name,
      'Price': order.totalPrice,
      'Quantity': order.quantity,
      'Status': order.status,
      'Date': order.createdAt,
      'Retailer': order.retailer.name
    }));

    res.json(csvData);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ message: 'Error exporting transactions' });
  }
}; 