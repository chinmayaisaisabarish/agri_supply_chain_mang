import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import axios from "axios";
import { useWallet } from "../../context/WalletContext";
import UserInfoBox from "../../components/UserInfoBox";
import ConsumerSidebar from "../../components/ConsumerSidebar";
import contractABI from "../../contracts/AgriSupplyChain.json";
import { Link } from "react-router-dom";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const ConsumerDashboard = () => {
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "consumer") {
      toast.error("Please login as a consumer");
      navigate("/login");
      return;
    }

    fetchMarketplaceProducts();
    fetchOwnedProducts();
  }, [navigate]);

  const fetchMarketplaceProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/consumer/crops", {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMarketplaceProducts(response.data);
    } catch (error) {
      console.error("Error fetching marketplace products:", error);
      toast.error("Failed to fetch marketplace products");
    }
  };

  const fetchOwnedProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/consumer/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOwnedProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching owned products:", error);
      toast.error("Failed to fetch owned products");
      setLoading(false);
    }
  };

  const handleBuyProduct = async (productId, price, retailerWallet) => {
    try {
      setLoading(true);

      // Validate price
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        toast.error("Invalid price value");
        return;
      }

      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error("Please install MetaMask to make purchases");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        toast.error("Please connect your MetaMask wallet");
        return;
      }

      const userAddress = accounts[0];

      // Check if on Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            toast.error("Please add Sepolia network to your MetaMask");
          } else {
            toast.error("Please switch to Sepolia network in MetaMask");
          }
          return;
        }
      }

      // Get product data for transaction
      const product = marketplaceProducts.find(p => p._id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      // Check if product is available
      if (product.status !== "available") {
        toast.error("This product is not available for purchase");
        return;
      }

      // Get retailer's wallet address
      if (!retailerWallet) {
        toast.error("This product cannot be purchased as the retailer's wallet address is not available");
        return;
      }

      // Validate retailer wallet address format
      try {
        const validAddress = ethers.getAddress(retailerWallet);
        if (!validAddress) {
          throw new Error("Invalid retailer wallet address");
        }
      } catch (error) {
        console.error("Invalid retailer wallet address:", error);
        toast.error("Invalid retailer wallet address format");
        return;
      }

      // Get contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!contractAddress) {
        toast.error("Contract address not configured");
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      // Convert price to Wei
      let priceInWei;
      try {
        priceInWei = ethers.parseEther(price.toString());
      } catch (error) {
        toast.error("Invalid price format");
        return;
      }

      // Check user's balance
      const balance = await provider.getBalance(userAddress);
      if (balance < priceInWei) {
        toast.error("Insufficient funds in your wallet");
        return;
      }

      try {
        // Record the transaction on the blockchain
        const tx = await contract.recordTransaction(
          "Retailer",
          "3",
          productId,
          priceInWei,
          priceInWei,
          Math.floor(Date.now() / 1000),
          product.location || "Unknown",
          { value: priceInWei }
        );

        await tx.wait();

        // Update the product status in the database
        await axios.post(
          "http://localhost:5000/api/consumer/orders",
          { productId, quantity: 1 },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success("Purchase successful!");
        fetchMarketplaceProducts();
        fetchOwnedProducts();
      } catch (error) {
        console.error("Transaction error:", error);
        toast.error("Failed to complete the purchase");
      }
    } catch (error) {
      console.error("Error in handleBuyProduct:", error);
      toast.error("An error occurred during the purchase");
    } finally {
      setLoading(false);
    }
  };

  const viewChain = (productId) => {
    navigate(`/consumer/supply-chain/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ConsumerSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <UserInfoBox />

          {/* Owned Products Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Owned Crops</h2>
            {ownedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedProducts.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{order.product.name}</h3>
                    <p className="text-gray-600 mb-2">Price: ${order.totalPrice}</p>
                    <p className="text-gray-600 mb-2">Quantity: {order.quantity}</p>
                    <p className="text-gray-600 mb-4">Status: {order.status}</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => viewChain(order.product._id)}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                      >
                        View Chain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marketplace Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Available Crops</h2>
            {marketplaceProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">No products available for purchase at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">Price: ${product.sellingPrice}</p>
                    <p className="text-gray-600 mb-2">Quantity: {product.quantity}</p>
                    <p className="text-gray-600 mb-4">Description: {product.description}</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => viewChain(product._id)}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                      >
                        View Chain
                      </button>
                      <button
                        onClick={() => handleBuyProduct(product._id, product.sellingPrice, product.retailerId?.walletAddress)}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard; 