import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import UserInfoBox from '../../components/UserInfoBox';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
      toast.error('Please login as admin');
      navigate('/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard statistics');
      setLoading(false);
    }
  };

  const getUserCount = (role) => {
    const userStat = stats?.users?.find(stat => stat._id === role);
    return userStat?.count || 0;
  };

  const getCropCount = (status) => {
    const cropStat = stats?.crops?.find(stat => stat._id === status);
    return cropStat?.count || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <UserInfoBox />
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Users</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {stats?.users?.reduce((acc, curr) => acc + curr.count, 0) || 0}
              </p>
              <div className="mt-2 space-y-1">
                <div><span className="text-green-600">Farmers: {getUserCount('farmer')}</span></div>
                <div><span className="text-blue-600">Distributors: {getUserCount('distributor')}</span></div>
                <div><span className="text-purple-600">Retailers: {getUserCount('retailer')}</span></div>
                <div><span className="text-orange-600">Consumers: {getUserCount('consumer')}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Crops</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {stats?.crops?.reduce((acc, curr) => acc + curr.count, 0) || 0}
              </p>
              <div className="mt-2">
                <div><span className="text-green-600">Available: {getCropCount('available')}</span></div>
                <div><span className="text-blue-600">In Transit: {getCropCount('in_transit')}</span></div>
                <div><span className="text-purple-600">Sold: {getCropCount('sold')}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats?.transactions || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                Total recorded transactions
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">System Status</h3>
              <p className="text-green-600 mt-2">All Systems Operational</p>
              <p className="text-sm text-gray-600 mt-2">
                Last Updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700">User Management</h3>
              <p className="text-sm text-gray-600 mt-2">Manage all users and their status</p>
            </button>

            <button
              onClick={() => navigate('/admin/supply-chain')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700">Supply Chain</h3>
              <p className="text-sm text-gray-600 mt-2">View complete crop journey</p>
            </button>

            <button
              onClick={() => navigate('/admin/transactions')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
              <p className="text-sm text-gray-600 mt-2">View and export all transactions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 