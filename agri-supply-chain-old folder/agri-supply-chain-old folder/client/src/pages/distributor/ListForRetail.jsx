import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import DistributorSidebar from '../../components/DistributorSidebar';
import UserInfoBox from '../../components/UserInfoBox';

const ListForRetail = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      console.log("Fetching inventory...");
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/distributor/my-inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Inventory response:", response.data);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleListForRetail = async (inventoryId, currentPrice) => {
    try {
      setListing(true);
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
      fetchInventory();
    } catch (error) {
      console.error('Error listing crop:', error);
      toast.error(error.response?.data?.error || 'Failed to list crop');
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">List Crops for Retail</h1>
              {inventory.length === 0 ? (
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
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.cropId?.image && (
                                  <img
                                    src={`http://localhost:5000/uploads/crops/${item.cropId.image}`}
                                    alt={item.cropId.name}
                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                  />
                                )}
                                <div className="text-sm font-medium text-gray-900">
                                  {item.cropId?.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.cropId?.costPrice} ETH
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status === "sold"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {item.status === "sold" ? "Listed" : "Available"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleListForRetail(item._id, item.cropId?.costPrice)}
                                disabled={listing || item.status === "sold"}
                                className={`${
                                  item.status === "sold"
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                } text-white text-sm font-medium px-4 py-2 rounded transition-colors duration-200`}
                              >
                                {listing ? "Listing..." : item.status === "sold" ? "Already Listed" : "List for Retail"}
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default ListForRetail; 