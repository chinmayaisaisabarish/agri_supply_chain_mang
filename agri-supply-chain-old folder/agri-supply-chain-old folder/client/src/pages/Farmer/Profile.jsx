import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useWallet } from "../../context/WalletContext";
import FarmerSidebar from "../../components/Sidebar";
import UserInfoBox from "../../components/UserInfoBox";
const FarmerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { walletAddress } = useWallet();

  useEffect(() => {
    fetchProfile();
    fetchWalletBalance();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/farmer/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blockchain/balance/${walletAddress}`);
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <FarmerSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          {/* User Info Box */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome, {profile?.name || "Farmer"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Wallet Address: {walletAddress}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">ETH Balance</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {walletBalance} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-lg text-gray-900">{profile?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role ID</label>
                <p className="mt-1 text-lg text-gray-900">{profile?.roleId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-lg text-gray-900">{profile?.role}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <p className="mt-1 text-lg text-gray-900 break-all">{walletAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;