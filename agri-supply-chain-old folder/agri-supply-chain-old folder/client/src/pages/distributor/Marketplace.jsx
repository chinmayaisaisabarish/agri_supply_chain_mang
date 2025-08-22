// src/pages/distributor/Marketplace.jsx
import { useState, useEffect } from 'react';
import DistributorSidebar from '../../components/DistributorSidebar';
import { useCart } from '../../context/CartContext';

const Marketplace = () => {
  const [search, setSearch] = useState('');
  const [crops, setCrops] = useState([]);
  const { addToCart } = useCart();

  // Fetch crops from backend
  const fetchCrops = async () => {
    try {
      const response = await fetch('/api/crops'); // 🔁 Replace with your actual API endpoint
      const data = await response.json();
      setCrops(data);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchCrops();
    const interval = setInterval(() => {
      fetchCrops();
    }, 10000); // 10s

    return () => clearInterval(interval);
  }, []);

  // Filter crops based on search input
  const filteredCrops = crops.filter(
    (crop) =>
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.location.toLowerCase().includes(search.toLowerCase()) ||
      crop.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <DistributorSidebar role="distributor" />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">🌾 Crop Marketplace</h1>

        {/* Search Filters */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search crop / region / type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 w-full max-w-md border rounded-lg shadow-sm"
          />
        </div>

        {/* Crop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition"
            >
              <img
                src={crop.image}
                alt={crop.name}
                className="rounded-lg w-full h-40 object-cover mb-3"
              />
              <h2 className="text-xl font-semibold text-gray-800">{crop.name}</h2>
              <p className="text-sm text-gray-500">From: {crop.farmer} ({crop.location})</p>
              <p className="text-sm text-gray-600">Type: {crop.type}</p>
              <p className="text-sm text-gray-600">Qty: {crop.quantity} kg</p>
              <p className="text-sm text-green-700 font-semibold">₹{crop.price}/kg</p>

              <button
                onClick={() => addToCart(crop)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                ➕ Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
