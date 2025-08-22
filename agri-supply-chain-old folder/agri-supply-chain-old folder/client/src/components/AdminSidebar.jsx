import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaBox, FaChartLine, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      <nav className="mt-6">
        <Link
          to="/admin/dashboard"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaHome className="mr-3" />
          Dashboard
        </Link>
        <Link
          to="/admin/users"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaUsers className="mr-3" />
          User Management
        </Link>
        <Link
          to="/admin/supply-chain"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaBox className="mr-3" />
          Supply Chain
        </Link>
        <Link
          to="/admin/transactions"
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <FaChartLine className="mr-3" />
          Transactions
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

export default AdminSidebar; 