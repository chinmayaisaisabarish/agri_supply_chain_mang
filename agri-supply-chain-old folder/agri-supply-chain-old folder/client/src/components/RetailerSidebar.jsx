import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaChartLine, FaUser, FaSignOutAlt, FaStore } from 'react-icons/fa';

const RetailerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Retailer Dashboard</h2>
      </div>
      <nav className="mt-6">
        <Link
          to="/retailer/dashboard"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaHome className="mr-3" />
          Dashboard
        </Link>
        <Link
          to="/retailer/marketplace"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaStore className="mr-3" />
          List for Consumers
        </Link>
        <Link
          to="/retailer/my-inventory"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaBox className="mr-3" />
          My Inventory
        </Link>
        <Link
          to="/retailer/transactions"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaChartLine className="mr-3" />
          Transactions
        </Link>
        <Link
          to="/retailer/profile"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaUser className="mr-3" />
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default RetailerSidebar; 