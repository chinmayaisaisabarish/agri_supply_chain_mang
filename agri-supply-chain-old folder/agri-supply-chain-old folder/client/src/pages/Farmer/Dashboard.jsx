import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import FarmerSidebar from "../../components/Sidebar";
import UserInfoBox from "../../components/UserInfoBox";
import { useWallet } from "../../context/WalletContext";

const FarmerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress } = useWallet();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/farmer/crops", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCrops(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crops:", error);
      toast.error("Failed to fetch crops");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <FarmerSidebar />
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
      <FarmerSidebar />
      <div className="flex-1 overflow-auto relative">
        <UserInfoBox />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Crops</h1>
            <Link
              to="/farmer/add-crop"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add New Crop
            </Link>
          </div>

          {crops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No crops added yet.</p>
              <Link
                to="/farmer/add-crop"
                className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block"
              >
                Add your first crop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <div
                  key={crop._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {crop.image && (
                    <img
                      src={`http://localhost:5000/uploads/crops/${crop.image}`}
                      alt={crop.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{crop.name}</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Quantity:</span> {crop.quantity} kg
                      </div>
                      <div>
                        <span className="font-medium">Selling Price:</span> {crop.sellingPrice} ETH
                      </div>
                      <div>
                        <span className="font-medium">Cost Price:</span> {crop.costPrice} ETH
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            crop.status === "available"
                              ? "bg-green-100 text-green-800"
                              : crop.status === "sold"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {crop.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Link
                        to={`/farmer/crops/${crop._id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View Details
                      </Link>
                      <span className="text-sm text-gray-500">
                        Added: {new Date(crop.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;