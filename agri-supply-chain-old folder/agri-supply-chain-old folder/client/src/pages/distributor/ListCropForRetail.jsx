import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import DistributorSidebar from "../../components/DistributorSidebar";
import UserInfoBox from "../../components/UserInfoBox";

const ListCropForRetail = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [listing, setListing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/distributor/my-inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelection = (crop) => {
    setSelectedCrop(crop);
    setSellingPrice(crop.costPrice.toString());
  };

  const handleListForRetail = async (e) => {
    e.preventDefault();
    if (!selectedCrop || !sellingPrice) {
      toast.error("Please select a crop and enter a selling price");
      return;
    }

    try {
      setListing(true);
      const response = await axios.post(
        "http://localhost:5000/api/distributor/list-for-retail",
        {
          cropId: selectedCrop._id,
          price: sellingPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message);
      
      // Update the inventory by removing the listed crop
      setInventory(prevInventory => 
        prevInventory.filter(crop => crop._id !== selectedCrop._id)
      );
      
      // Reset the form
      setSelectedCrop(null);
      setSellingPrice("");
      
      // Navigate back to dashboard
      navigate("/distributor/dashboard");
    } catch (error) {
      console.error("Error listing crop for retail:", error);
      toast.error(
        error.response?.data?.error || "Failed to list crop for retail"
      );
    } finally {
      setListing(false);
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
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">List Crop for Retail</h1>
              
              {/* Crop Details Form */}
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Crop Details</h2>
                </div>
                <div className="p-6">
                  {selectedCrop ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                          <div className="mt-1 text-sm text-gray-900">{selectedCrop.name}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cost Price (ETH)</label>
                          <div className="mt-1 text-sm text-gray-900">{selectedCrop.costPrice}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantity</label>
                          <div className="mt-1 text-sm text-gray-900">{selectedCrop.quantity} kg</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Farmer</label>
                          <div className="mt-1 text-sm text-gray-900">{selectedCrop.farmer?.name || "Unknown"}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                          <div className="mt-1 text-sm text-gray-900">{new Date(selectedCrop.harvestDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Location</label>
                          <div className="mt-1 text-sm text-gray-900">{selectedCrop.location}</div>
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
                          min={selectedCrop.costPrice}
                          step="0.01"
                          required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Must be higher than cost price: {selectedCrop.costPrice} ETH
                        </p>
                      </div>

                      <button
                        onClick={handleListForRetail}
                        disabled={listing || parseFloat(sellingPrice) <= selectedCrop.costPrice}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {listing ? "Listing..." : "List for Retail"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Select a crop to view details and list for retail
                    </div>
                  )}
                </div>
              </div>

              {/* Crop Selection Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Select Crop</h2>
                </div>
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
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((crop) => (
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
                            <button
                              onClick={() => handleCropSelection(crop)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ListCropForRetail; 