import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import UserInfoBox from '../../components/UserInfoBox';

const AdminSupplyChain = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCrops = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/admin/supply-chain', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success && Array.isArray(response.data.crops)) {
          setCrops(response.data.crops);
        } else {
          setCrops([]);
          toast.error('Failed to fetch crops: Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching crops:', error);
        setCrops([]);
        toast.error('Failed to fetch crops');
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [navigate]);

  const handleViewDetails = (crop) => {
    setSelectedCrop(crop);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Supply Chain Management</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crops.length > 0 ? (
                crops.map((crop) => (
                  <tr key={crop._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{crop.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.farmer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.distributor?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleViewDetails(crop)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No crops found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && selectedCrop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Crop Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedCrop.name}</p>
                    <p><strong>Description:</strong> {selectedCrop.description}</p>
                    <p><strong>Quantity:</strong> {selectedCrop.quantity}</p>
                    <p><strong>Selling Price:</strong> ${selectedCrop.sellingPrice}</p>
                    <p><strong>Cost Price:</strong> ${selectedCrop.costPrice}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> {selectedCrop.status}</p>
                    <p><strong>Listed By:</strong> {selectedCrop.listedBy}</p>
                    <p><strong>Listed For Consumer:</strong> {selectedCrop.listedForConsumer ? 'Yes' : 'No'}</p>
                    <p><strong>Item ID:</strong> {selectedCrop.itemId}</p>
                    <p><strong>Created At:</strong> {new Date(selectedCrop.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <strong>Farmer Details:</strong>
                  <div className="ml-4 mt-2 space-y-2">
                    <p>Name: {selectedCrop.farmer?.name || 'N/A'}</p>
                    <p>Email: {selectedCrop.farmer?.email || 'N/A'}</p>
                    <p>Wallet: {selectedCrop.farmer?.walletAddress || 'N/A'}</p>
                  </div>
                </div>

                {selectedCrop.distributor && (
                  <div className="mt-4">
                    <strong>Distributor Details:</strong>
                    <div className="ml-4 mt-2 space-y-2">
                      <p>Name: {selectedCrop.distributor?.name || 'N/A'}</p>
                      <p>Email: {selectedCrop.distributor?.email || 'N/A'}</p>
                      <p>Wallet: {selectedCrop.distributor?.walletAddress || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <strong>Supply Chain Journey:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-4">
                    {selectedCrop.supplyChain?.length > 0 ? (
                      selectedCrop.supplyChain.map((step, index) => (
                        <li key={step._id} className="text-sm bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-600">{step.role}</div>
                          <div className="mt-1 space-y-1">
                            <p><span className="font-medium">Role ID:</span> {step.roleId}</p>
                            <p><span className="font-medium">Item ID:</span> {step.itemId}</p>
                            <p><span className="font-medium">Selling Price:</span> ${step.sellingPrice}</p>
                            <p><span className="font-medium">Cost Price:</span> ${step.costPrice}</p>
                            <p><span className="font-medium">Harvest Date:</span> {new Date(step.harvestDate).toLocaleString()}</p>
                            <p><span className="font-medium">Location:</span> {step.location}</p>
                            <p><span className="font-medium">Transaction Date:</span> {new Date(step.transactionDate).toLocaleString()}</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No supply chain events recorded yet</li>
                    )}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupplyChain; 