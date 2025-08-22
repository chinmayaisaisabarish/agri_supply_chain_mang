import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import axios from "axios";
import { useWallet } from "../../context/WalletContext";
import UserInfoBox from "../../components/UserInfoBox";
import DistributorSidebar from "../../components/DistributorSidebar";
import contractABI from "../../contracts/AgriSupplyChain.json";
import { Link } from "react-router-dom";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const DistributorDashboard = () => {
  const [marketplaceCrops, setMarketplaceCrops] = useState([]);
  const [ownedCrops, setOwnedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "distributor") {
      toast.error("Please login as a distributor");
      navigate("/login");
      return;
    }

    fetchMarketplaceCrops();
    fetchOwnedCrops();
  }, [navigate]);

  const fetchMarketplaceCrops = async () => {
    try {
      console.log("Fetching marketplace crops...");
      const response = await axios.get("http://localhost:5000/api/distributor/crops", {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Marketplace crops response:", response.data);
      setMarketplaceCrops(response.data);
    } catch (error) {
      console.error("Error fetching marketplace crops:", error);
      toast.error("Failed to fetch marketplace crops");
    }
  };

  const fetchOwnedCrops = async () => {
    try {
      console.log("Fetching owned crops...");
      const response = await axios.get("http://localhost:5000/api/distributor/my-inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Owned crops response:", response.data);
      setOwnedCrops(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching owned crops:", error);
      toast.error("Failed to fetch owned crops");
      setLoading(false);
    }
  };

  const handleBuyCrop = async (cropId, price, farmerWallet) => {
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

      // Check if crop is available
      if (crop.status !== "available") {
        toast.error("This crop is not available for purchase");
        return;
      }

      // Get farmer's wallet address from the crop data
      const farmerWalletAddress = crop.farmer?.walletAddress;
      if (!farmerWalletAddress) {
        toast.error("This crop cannot be purchased as the farmer's wallet address is not available");
        return;
      }

      // Validate farmer wallet address format
      try {
        const validAddress = ethers.getAddress(farmerWalletAddress);
        if (!validAddress) {
          throw new Error("Invalid farmer wallet address");
        }
      } catch (error) {
        console.error("Invalid farmer wallet address:", error);
        toast.error("Invalid farmer wallet address format");
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

      // Validate cost price
      if (typeof crop.sellingPrice !== 'number' || isNaN(crop.sellingPrice) || crop.sellingPrice <= 0) {
        toast.error("Invalid cost price for this crop");
        return;
      }

      // Prepare all transaction parameters
      const role = crop.role || 'Farmer';
      const roleId = crop.roleId || '1';
      const itemId = crop.itemId || cropId;
      
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

      // Validate and format harvest date
      let harvestDate;
      try {
        // Try to get harvest date from supply chain first
        const supplyChainEntry = crop.supplyChain?.[0];
        const harvestDateStr = supplyChainEntry?.harvestDate || crop.harvestDate;
        
        console.log("Raw harvest date data:", {
          supplyChainEntry,
          cropHarvestDate: crop.harvestDate,
          finalHarvestDateStr: harvestDateStr,
          type: typeof harvestDateStr
        });
        
        if (!harvestDateStr) {
          throw new Error("Harvest date is required");
        }

        // Parse the date string into a Date object
        let date;
        if (typeof harvestDateStr === 'string') {
          // Try different date formats
          date = new Date(harvestDateStr);
          console.log("First parse attempt:", {
            input: harvestDateStr,
            parsed: date.toISOString(),
            isValid: !isNaN(date.getTime())
          });
          
          if (isNaN(date.getTime())) {
            // Try parsing as ISO string
            const isoStr = harvestDateStr.replace(' ', 'T');
            date = new Date(isoStr);
            console.log("Second parse attempt (ISO):", {
              input: isoStr,
              parsed: date.toISOString(),
              isValid: !isNaN(date.getTime())
            });
          }
        } else if (typeof harvestDateStr === 'number') {
          // If it's already a timestamp
          date = new Date(harvestDateStr * 1000);
          console.log("Timestamp parse:", {
            input: harvestDateStr,
            parsed: date.toISOString(),
            isValid: !isNaN(date.getTime())
          });
        } else {
          throw new Error("Invalid harvest date format");
        }
        
        // Validate the date
        if (isNaN(date.getTime())) {
          throw new Error("Invalid harvest date format");
        }
        
        // Convert to Unix timestamp (seconds)
        harvestDate = Math.floor(date.getTime() / 1000);
        
        // Check if harvest date is in the future
        const now = Math.floor(Date.now() / 1000);
        const oneHourInSeconds = 3600;
        
        console.log("Date comparison:", {
          harvestDate,
          now,
          difference: harvestDate - now,
          oneHourInSeconds,
          isFuture: harvestDate > (now + oneHourInSeconds)
        });
        
        if (harvestDate > (now + oneHourInSeconds)) {
          // Instead of throwing an error, show a warning toast
          toast.warning("Note: This crop's harvest date is in the future. Please confirm this is correct.");
          // Continue with the transaction
        }

        console.log("Final harvest date details:", {
          original: harvestDateStr,
          parsed: date.toISOString(),
          timestamp: harvestDate,
          now: now,
          formattedDate: new Date(harvestDate * 1000).toISOString()
        });
      } catch (error) {
        console.error("Harvest date error:", error);
        toast.error(error.message || "Invalid harvest date");
        return;
      }

      const location = crop.location || crop.supplyChain?.[0]?.location || 'Unknown';

      // Check user's balance
      const balance = await provider.getBalance(userAddress);
      if (balance < priceInWei) {
        toast.error("Insufficient funds in your wallet");
        return;
      }

      // Send transaction with all required parameters
      try {
        // Show a loading toast while preparing the transaction
        const loadingToast = toast.loading("Preparing transaction...");

        console.log('Sending transaction with params:', {
          role,
          roleId,
          itemId,
          priceInWei: priceInWei.toString(),
          costPriceInWei: costPriceInWei.toString(),
          harvestDate: harvestDate.toString(),
          location,
          farmerWalletAddress
        });

        // Call the contract's recordTransaction function with proper parameter encoding
        const tx = await contract.recordTransaction(
          role,                   // string
          roleId,                 // string
          itemId,                 // string
          priceInWei,            // uint256
          costPriceInWei,        // uint256
          BigInt(harvestDate),   // uint256
          location,              // string
          farmerWalletAddress,   // address
          {
            value: priceInWei,   // Send ETH with the transaction
            gasLimit: 500000     // Set gas limit
          }
        );

        // Update loading message
        toast.update(loadingToast, {
          render: "Transaction submitted. Waiting for confirmation...",
          type: "info",
          isLoading: true
        });
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          // Transaction successful
          toast.update(loadingToast, {
            render: "Transaction confirmed!",
            type: "success",
            isLoading: false,
            autoClose: 5000
          });

          // Update backend with the transaction hash
          const user = JSON.parse(localStorage.getItem("user"));
          try {
            const response = await axios.post(
              "http://localhost:5000/api/distributor/buy-crop",
              {
                cropId,
                blockchainTxHash: receipt.hash,
                price: price.toString(),
                farmerWallet: farmerWalletAddress,
                distributorWallet: userAddress
              },
              {
                headers: { 
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json"
                },
              }
            );

            if (response.data.message === "Crop purchased successfully") {
              toast.success("Purchase successful!");
              
              // Fetch updated data
              const [marketplaceResponse, inventoryResponse] = await Promise.all([
                axios.get("http://localhost:5000/api/distributor/crops", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }),
                axios.get("http://localhost:5000/api/distributor/my-inventory", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })
              ]);

              // Update both states
              setMarketplaceCrops(marketplaceResponse.data);
              setOwnedCrops(inventoryResponse.data);
            } else {
              toast.error(response.data.error || "Failed to update purchase status");
            }
          } catch (error) {
            console.error("Backend update error:", error);
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

  const getSepoliaETH = async () => {
    try {
      const response = await fetch('https://sepoliafaucet.com/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Sepolia ETH requested successfully! Please wait a few minutes for it to arrive.");
      } else {
        toast.error("Failed to request Sepolia ETH. Please try again later.");
      }
    } catch (error) {
      console.error("Error requesting Sepolia ETH:", error);
      toast.error("Failed to request Sepolia ETH. Please try again later.");
    }
  };

  const handleListForRetail = async (inventoryId, currentPrice) => {
    try {
      setLoading(true);
      const sellingPrice = prompt('Enter selling price in ETH:', currentPrice);
      
      if (!sellingPrice) {
        toast.error('Please enter a valid price');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/distributor/list-for-retail',
        {
          inventoryId,
          price: sellingPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("List for retail response:", response.data);
      toast.success('Crop listed for retail successfully!');
      
      // Refresh both marketplace and owned crops
      await Promise.all([
        fetchMarketplaceCrops(),
        fetchOwnedCrops()
      ]);
    } catch (error) {
      console.error('Error listing crop:', error);
      toast.error(error.response?.data?.error || 'Failed to list crop');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <DistributorSidebar />
        <div className="flex-1 p-8">
          <UserInfoBox />
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DistributorSidebar />
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
                                  {crop.cropId?.image && (
                                    <img
                                      src={`http://localhost:5000/uploads/crops/${crop.cropId.image}`}
                                      alt={crop.cropId.name}
                                      className="h-10 w-10 rounded-full object-cover mr-3"
                                    />
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {crop.cropId?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {typeof crop.cropId?.costPrice === 'number' ? `${crop.cropId.costPrice} ETH` : "Price not available"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{crop.quantity}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(crop.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  crop.status === "listed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {crop.status === "listed" ? "Listed for Retail" : "In Stock"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleListForRetail(crop._id, crop.cropId?.costPrice)}
                                  disabled={crop.status === "listed"}
                                  className={`${
                                    crop.status === "listed"
                                      ? "bg-gray-300 cursor-not-allowed"
                                      : "bg-blue-500 hover:bg-blue-600"
                                  } text-white text-sm font-medium px-4 py-2 rounded transition-colors duration-200`}
                                >
                                  {crop.status === "listed" ? "Already Listed" : "List for Retail"}
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
                              Farmer
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
                                  {crop.sellingPrice} ETH
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{crop.quantity}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {crop.farmer?.name || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    if (typeof crop.sellingPrice !== 'number' || crop.sellingPrice <= 0) {
                                      toast.error("Invalid price for this crop");
                                      return;
                                    }
                                    if (!crop.farmer?.walletAddress) {
                                      toast.error("This crop cannot be purchased as the farmer's wallet address is not available");
                                      return;
                                    }
                                    handleBuyCrop(crop._id, crop.sellingPrice, crop.farmer.walletAddress);
                                  }}
                                  disabled={loading || typeof crop.sellingPrice !== 'number' || crop.sellingPrice <= 0 || !crop.farmer?.walletAddress}
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

export default DistributorDashboard;
