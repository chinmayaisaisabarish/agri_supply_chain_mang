import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import RetailerSidebar from "../../components/RetailerSidebar";
import UserInfoBox from "../../components/UserInfoBox";

const ListForConsumer = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [listing, setListing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/retailer/my-inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
      
      // If an ID is provided in the URL, find and select that item
      if (id) {
        const item = response.data.find(item => item._id === id);
        if (item) {
          setSelectedItem(item);
          setSellingPrice(item.price.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (item) => {
    setSelectedItem(item);
    setSellingPrice(item.price.toString());
  };

  const handleListForConsumer = async (e) => {
    e.preventDefault();
    if (!selectedItem || !sellingPrice) {
      toast.error("Please select an item and enter a selling price");
      return;
    }

    try {
      setListing(true);
      const response = await axios.post(
        "http://localhost:5000/api/retailer/list-for-consumer",
        {
          cropId: selectedItem.cropId._id,
          price: sellingPrice,
          quantity: selectedItem.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message);
      
      // Update the inventory by removing the listed item
      setInventory(prevInventory => 
        prevInventory.filter(item => item._id !== selectedItem._id)
      );
      
      // Reset the form
      setSelectedItem(null);
      setSellingPrice("");
      
      // Navigate back to dashboard
      navigate("/retailer/dashboard");
    } catch (error) {
      console.error("Error listing item for consumer:", error);
      toast.error(
        error.response?.data?.error || "Failed to list item for consumer"
      );
    } finally {
      setListing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <RetailerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <RetailerSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">List for Consumers</h1>
          <UserInfoBox />
        </div>

        {/* Item Details Form */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-medium text-gray-900">Item Details</h2>
          </div>
          <div className="p-6">
            {selectedItem ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedItem.cropId?.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Price</label>
                    <div className="mt-1 text-sm text-gray-900">₹{selectedItem.price}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedItem.quantity}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distributor</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedItem.distributorId?.name}</div>
                  </div>
                </div>

                <div>
                  <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    id="sellingPrice"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    min={selectedItem.price}
                    step="0.01"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be higher than current price: ₹{selectedItem.price}
                  </p>
                </div>

                <button
                  onClick={handleListForConsumer}
                  disabled={listing || parseFloat(sellingPrice) <= selectedItem.price}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {listing ? "Listing..." : "List for Consumers"}
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select an item to view details and list for consumers
              </div>
            )}
          </div>
        </div>

        {/* Item Selection Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-medium text-gray-900">Select Item</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.cropId?.image && (
                          <img
                            src={`http://localhost:5000/uploads/${item.cropId.image}`}
                            alt={item.cropId?.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.cropId?.name}</div>
                          <div className="text-sm text-gray-500">{item.cropId?.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleItemSelection(item)}
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
    </div>
  );
};

export default ListForConsumer; 