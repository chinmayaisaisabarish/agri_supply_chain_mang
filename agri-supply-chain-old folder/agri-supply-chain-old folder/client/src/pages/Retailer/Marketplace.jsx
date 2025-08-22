import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useWallet } from '../../context/WalletContext';
import RetailerSidebar from '../../components/RetailerSidebar';
import { FaSpinner, FaShoppingCart } from 'react-icons/fa';

const Marketplace = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress } = useWallet();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/retailer/marketplace', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCrops(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace crops:', error);
      toast.error('Failed to fetch marketplace crops');
      setLoading(false);
    }
  };

  const handleAddToCart = async (cropId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/retailer/cart',
        { cropId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <RetailerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <RetailerSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div key={crop._id} className="bg-white rounded-lg shadow overflow-hidden">
              {crop.image && (
                <img
                  src={`http://localhost:5000/uploads/${crop.image}`}
                  alt={crop.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{crop.name}</h3>
                <p className="text-gray-600 mb-4">{crop.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-semibold">{crop.price} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-lg font-semibold">{crop.quantity} kg</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Distributor: {crop.distributor?.name || 'Unknown'}
                  </p>
                  <button
                    onClick={() => handleAddToCart(crop._id)}
                    disabled={!walletAddress}
                    className={`flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                      !walletAddress ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                </div>
                {!walletAddress && (
                  <p className="text-sm text-red-500 mt-2">
                    Please connect your wallet to make purchases
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace; 