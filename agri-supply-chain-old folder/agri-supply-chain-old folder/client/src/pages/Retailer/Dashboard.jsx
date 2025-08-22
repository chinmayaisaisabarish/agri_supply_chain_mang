import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import axios from "axios";
import { useWallet } from "../../context/WalletContext";
import UserInfoBox from "../../components/UserInfoBox";
import RetailerSidebar from "../../components/RetailerSidebar";
import contractABI from "../../contracts/AgriSupplyChain.json";
import { Link } from "react-router-dom";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const RetailerDashboard = () => {
  const [marketplaceCrops, setMarketplaceCrops] = useState([]);
  const [ownedCrops, setOwnedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "retailer") {
      toast.error("Please login as a retailer");
      navigate("/login");
      return;
    }

    fetchMarketplaceCrops();
    fetchOwnedCrops();
  }, [navigate]);

  const fetchMarketplaceCrops = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/retailer/crops", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Marketplace crops response:", response.data);
      response.data.forEach(crop => {
        console.log(`Crop ${crop._id}:`, {
          name: crop.name,
          price: crop.price,
          sellingPrice: crop.sellingPrice,
          distributorId: crop.distributorId,
          status: crop.status
        });
      });
      setMarketplaceCrops(response.data);
    } catch (error) {
      console.error("Error fetching marketplace crops:", error);
      toast.error("Failed to fetch marketplace crops");
    }
  };

  const fetchOwnedCrops = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/retailer/my-inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOwnedCrops(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching owned crops:", error);
      toast.error("Failed to fetch owned crops");
      setLoading(false);
    }
  };

  const handleBuyCrop = async (cropId, price, distributorWallet) => {
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

      // Get crop data for transaction
      const crop = marketplaceCrops.find(c => c._id === cropId);
      if (!crop) {
        toast.error("Crop not found");
        return;
      }

      // Check if crop is listed
      if (crop.status !== "listed") {
        toast.error("This crop is not available for purchase");
        return;
      }

      // Get distributor's wallet address
      if (!distributorWallet) {
        toast.error("This crop cannot be purchased as the distributor's wallet address is not available");
        return;
      }

      // Validate distributor wallet address format
      try {
        const validAddress = ethers.getAddress(distributorWallet);
        if (!validAddress) {
          throw new Error("Invalid distributor wallet address");
        }
      } catch (error) {
        console.error("Invalid distributor wallet address:", error);
        toast.error("Invalid distributor wallet address format");
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

      // Validate selling price
      if (typeof crop.sellingPrice !== 'number' || isNaN(crop.sellingPrice) || crop.sellingPrice <= 0) {
        toast.error("Invalid selling price for this crop");
        return;
      }

      // Prepare all transaction parameters
      const role = 'Distributor';
      const roleId = '2';
      const itemId = cropId;
      
      // Convert prices to Wei with proper validation
      let priceInWei;
      let costPriceInWei;
      try {
        priceInWei = ethers.parseEther(price.toString());
        costPriceInWei = ethers.parseEther(crop.sellingPrice.toString());
      } catch (error) {
        toast.error("Invalid price format");
        return;
      }

      // Get current timestamp for harvest date
      const harvestDate = Math.floor(Date.now() / 1000);
      const location = crop.location || 'Unknown';

      // Check user's balance
      const balance = await provider.getBalance(userAddress);
      if (balance < priceInWei) {
        toast.error("Insufficient funds in your wallet");
        return;
      }

      try {
        // Encode the function data
        const data = contract.interface.encodeFunctionData("recordTransaction", [
          role,
          roleId,
          itemId,
          priceInWei,
          costPriceInWei,
          harvestDate,
          location,
          distributorWallet
        ]);

        // Create transaction with proper data encoding
        const tx = await signer.sendTransaction({
          to: contractAddress,
          data: data,
          value: priceInWei,
          gasLimit: 200000,
          maxFeePerGas: ethers.parseUnits("20", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("1.5", "gwei")
        });

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          try {
            // Update backend
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await axios.post(
              "http://localhost:5000/api/retailer/buy-crop",
              {
                _id: cropId,
                blockchainTxHash: tx.hash,
                price: price.toString(),
                distributorWallet: distributorWallet,
                retailerWallet: userAddress
              },
              {
                headers: { 
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json"
                },
              }
            );

            if (response.data.success) {
              toast.success("Purchase successful!");
              // Refresh both lists
              await Promise.all([
                fetchMarketplaceCrops(),
                fetchOwnedCrops()
              ]);
              // Remove the purchased crop from marketplaceCrops state
              setMarketplaceCrops(prevCrops => 
                prevCrops.filter(crop => crop._id !== cropId)
              );
            } else {
              toast.error(response.data.error || "Failed to update purchase status");
            }
          } catch (error) {
            console.error("Backend update error:", error.response?.data || error.message);
            toast.error(error.response?.data?.error || "Failed to update purchase status");
          }
        } else {
          toast.error("Transaction failed");
        }
      } catch (error) {
        console.error("Transaction error details:", error);
        if (error.code === 4001) {
          toast.error("Transaction was rejected by user");
        } else if (error.code === -32603) {
          toast.error("Transaction failed. Please check your wallet balance and try again");
        } else if (error.message?.includes("execution reverted")) {
          toast.error("Transaction failed: The contract rejected the transaction. Please check the parameters and try again.");
        } else {
          toast.error(error.message || "Failed to complete purchase");
        }
        throw error;
      }
    } catch (error) {
      console.error("Buy crop error:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603) {
        toast.error("Transaction failed. Please check your wallet balance and try again");
      } else {
        toast.error(error.message || "Failed to complete purchase");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <RetailerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
                    {networkError.includes("Sepolia") && (
                  <button
                        onClick={getSepoliaETH}
                        className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                        Get Sepolia ETH
                  </button>
                    )}
                  </p>
                </div>
              </div>
          </div>
          )}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              {/* Owned Crops Section */}
              <div className="mb-12">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Owned Crops</h1>
                {ownedCrops.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 text-lg">No crops in inventory</p>
        </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Crop Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost Price (ETH)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purchase Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {ownedCrops.map((crop) => (
                            <tr key={crop._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {crop.image && (
                                    <img
                                      src={`http://localhost:5000/uploads/crops/${crop.image}`}
                                      alt={crop.name}
                                      className="h-10 w-10 rounded-full object-cover mr-3"
                                    />
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {crop.name}
          </div>
        </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{crop.costPrice}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{crop.quantity}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(crop.purchaseDate).toLocaleDateString()}
      </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  crop.status === "listed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {crop.status === "listed" ? "Listed for Consumers" : "In Stock"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
          <Link
                                  to={`/retailer/list-crop-for-consumer/${crop._id}`}
                                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
                                  List for Consumers
          </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Marketplace Crops Section */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Available Crops</h1>
                {marketplaceCrops.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 text-lg">No crops available for purchase</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Crop Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price (ETH)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Distributor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {marketplaceCrops.map((crop) => (
                            <tr key={crop._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {crop.image && (
                                    <img
                                      src={`http://localhost:5000/uploads/crops/${crop.image}`}
                                      alt={crop.name}
                                      className="h-10 w-10 rounded-full object-cover mr-3"
                                    />
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {crop.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {typeof crop.price === 'number' ? `${crop.price} ETH` : "Price not available"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{crop.quantity}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {crop.distributorId?.name || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    console.log("Buy button clicked for crop:", {
                                      id: crop._id,
                                      price: crop.price,
                                      distributorId: crop.distributorId
                                    });
                                    if (typeof crop.price !== 'number' || crop.price <= 0) {
                                      toast.error("Invalid price for this crop");
                                      return;
                                    }
                                    if (!crop.distributorId?.walletAddress) {
                                      toast.error("This crop cannot be purchased as the distributor's wallet address is not available");
                                      return;
                                    }
                                    handleBuyCrop(crop._id, crop.price, crop.distributorId.walletAddress);
                                  }}
                                  disabled={loading || typeof crop.price !== 'number' || crop.price <= 0 || !crop.distributorId?.walletAddress}
                                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50"
                                >
                                  {loading ? "Processing..." : "Buy"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard; 