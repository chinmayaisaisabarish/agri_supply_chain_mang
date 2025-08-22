import { useState } from 'react';
import DistributorSidebar from '../../components/DistributorSidebar';

const BlockchainStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/blockchain/get/${orderId}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Failed to fetch blockchain record');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <DistributorSidebar />
      <div className="flex-1 p-6 space-y-4">
        <h1 className="text-3xl font-bold text-blue-800">🔗 Blockchain Order Trace</h1>

        <div className="bg-white p-6 rounded-xl shadow max-w-md space-y-3">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="w-full border px-4 py-2 rounded"
          />
          <button
            onClick={fetchOrder}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔍 Fetch on Blockchain
          </button>

          {result && (
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p><strong>Crop:</strong> {result.cropName}</p>
              <p><strong>Distributor:</strong> {result.distributor}</p>
              <p><strong>Quantity:</strong> {result.quantity} kg</p>
              <p><strong>Price:</strong> ₹{result.price}</p>
              <p><strong>Date:</strong> {new Date(result.timestamp * 1000).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainStatus;
