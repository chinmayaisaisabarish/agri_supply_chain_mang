import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWallet } from "../context/WalletContext";

const UserInfoBox = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0");
  const { walletAddress } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      navigate("/login");
      return;
    }

    fetchUserInfo(token, user);
    if (walletAddress) {
      fetchWalletBalance(walletAddress);
    }
  }, [navigate, walletAddress]);

  const fetchUserInfo = async (token, user) => {
    try {
      let response;
      if (user.role === "farmer") {
        response = await axios.get("http://localhost:5000/api/farmer/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
      } else if (user.role === "distributor") {
        response = await axios.get("http://localhost:5000/api/distributor/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
      } else if (user.role === "retailer") {
        response = await axios.get("http://localhost:5000/api/retailer/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
      } else if (user.role === "consumer") {
        response = await axios.get("http://localhost:5000/api/consumer/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
      } else if (user.role === "admin") {
        setUserInfo(user);
        return;
      } else {
        throw new Error("Invalid user role");
      }
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  const fetchWalletBalance = async (address) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/blockchain/balance/${address}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{userInfo.name}</h2>
          <p className="text-sm text-gray-600">{userInfo.role}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Wallet Address:</p>
          <p className="text-sm font-mono">{walletAddress}</p>
          <p className="text-sm text-gray-600 mt-1">Balance: {walletBalance} ETH</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoBox; 