import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import DistributorSidebar from "../../components/DistributorSidebar";
import UserInfoBox from "../../components/UserInfoBox";

const ListCropsForRetailers = () => {
  const [purchasedCrops, setPurchasedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchasedCrops();
  }, []);

  const fetchPurchasedCrops = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/distributor/purchased-crops", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPurchasedCrops(response.data);
    } catch (error) {
      console.error("Error fetching purchased crops:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to fetch purchased crops");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelection = (cropId) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId)
        ? prev.filter((id) => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleListCrops = async () => {
    try {
      if (selectedCrops.length === 0) {
        toast.error("Please select at least one crop");
        return;
      }

      if (!price || isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/distributor/list-crops",
        {
          cropIds: selectedCrops,
          price: parseFloat(price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Crops listed successfully for retailers");
      setSelectedCrops([]);
      setPrice("");
      fetchPurchasedCrops();
    } catch (error) {
      console.error("Error listing crops:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to list crops");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <DistributorSidebar />
        <div className="flex-1 overflow-auto relative">
          <UserInfoBox />
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DistributorSidebar />
      <div className="flex-1 overflow-auto relative">
        <UserInfoBox />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">List Crops for Retailers</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Selling Price (ETH)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter price per unit"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handleListCrops}
              disabled={selectedCrops.length === 0 || !price}
              className={`px-4 py-2 rounded-md text-white ${
                selectedCrops.length === 0 || !price
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              List Selected Crops
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchasedCrops.map((crop) => (
                    <tr key={crop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCrops.includes(crop._id)}
                          onChange={() => handleCropSelection(crop._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
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
                        <div className="text-sm text-gray-900">{crop.itemId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(crop.purchaseDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{crop.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            crop.status === "listed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {crop.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCropsForRetailers; 