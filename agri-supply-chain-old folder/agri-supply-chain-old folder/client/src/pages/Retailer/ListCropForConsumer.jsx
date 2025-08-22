import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { ethers } from "ethers";
import RetailerSidebar from "../../components/RetailerSidebar";
import UserInfoBox from "../../components/UserInfoBox";
import contractABI from "../../contracts/AgriSupplyChain.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const ListCropForConsumer = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [listing, setListing] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "retailer") {
      toast.error("Please login as a retailer");
      navigate("/login");
      return;
    }

    fetchCropDetails();
  }, [navigate, cropId]);

  const fetchCropDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/retailer/my-inventory/${cropId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCrop(response.data);
      setSellingPrice(response.data.costPrice.toString());
    } catch (error) {
      console.error("Error fetching crop details:", error);
      toast.error("Failed to fetch crop details");
    } finally {
      setLoading(false);
    }
  };

  const handleListForConsumer = async (e) => {
    e.preventDefault();
    if (!crop || !sellingPrice) {
      toast.error("Please enter a selling price");
      return;
    }

    try {
      setListing(true);
      
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
      if (chainId !== '0xaa36a7') { // Sepolia chainId
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

      // Get contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!contractAddress) {
        toast.error("Contract address not configured");
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      // Prepare transaction parameters
      const role = 'Retailer';
      const roleId = '3';
      const itemId = crop.itemId || cropId;
      const priceInWei = ethers.parseEther(sellingPrice.toString());
      const costPriceInWei = ethers.parseEther(crop.costPrice.toString());
      const harvestDate = Math.floor(new Date(crop.harvestDate).getTime() / 1000);
      const location = crop.location || 'Unknown';

      // Send transaction
      const transaction = await contract["recordTransaction(string,string,string,uint256,uint256,uint256,string,address)"](
        role,
        roleId,
        itemId,
        priceInWei,
        costPriceInWei,
        harvestDate,
        location,
        userAddress,
        { 
          gasLimit: 500000
        }
      );

      toast.info("Transaction submitted. Waiting for confirmation...");
      
      const txHash = transaction.hash;
      console.log('Transaction hash:', txHash);
      
      const receipt = await transaction.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        // Update backend
        const response = await axios.post(
          `http://localhost:5000/api/retailer/list-for-consumer/${cropId}`,
          {
            sellingPrice: parseFloat(sellingPrice),
            blockchainTxHash: txHash,
            retailerWallet: userAddress
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            },
          }
        );

        toast.success(response.data.message);
        navigate("/retailer/inventory");
      } else {
        toast.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error listing crop for consumer:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603) {
        toast.error("Transaction failed. Please check your wallet balance and try again");
      } else if (error.message?.includes("execution reverted")) {
        toast.error("Transaction failed: " + error.message);
      } else {
        toast.error(error.message || "Failed to list crop for consumer");
      }
    } finally {
      setListing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <RetailerSidebar />
        <div className="flex-1 p-8">
          <UserInfoBox />
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="flex h-screen">
        <RetailerSidebar />
        <div className="flex-1 p-8">
          <UserInfoBox />
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">Crop not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <RetailerSidebar />
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <UserInfoBox />
          {networkError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {networkError}
                  </p>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">List Crop for Consumers</h1>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Crop Details</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                        <div className="mt-1 text-sm text-gray-900">{crop.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cost Price (ETH)</label>
                        <div className="mt-1 text-sm text-gray-900">{crop.costPrice}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <div className="mt-1 text-sm text-gray-900">{crop.quantity} kg</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Distributor</label>
                        <div className="mt-1 text-sm text-gray-900">{crop.distributor?.name || "Unknown"}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                        <div className="mt-1 text-sm text-gray-900">{new Date(crop.harvestDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <div className="mt-1 text-sm text-gray-900">{crop.location}</div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                        Selling Price (ETH)
                      </label>
                      <input
                        type="number"
                        id="sellingPrice"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        min={crop.costPrice}
                        step="0.01"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Must be higher than cost price: {crop.costPrice} ETH
                      </p>
                    </div>

                    <button
                      onClick={handleListForConsumer}
                      disabled={listing || parseFloat(sellingPrice) <= crop.costPrice}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listing ? "Listing..." : "List for Consumers"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ListCropForConsumer; 