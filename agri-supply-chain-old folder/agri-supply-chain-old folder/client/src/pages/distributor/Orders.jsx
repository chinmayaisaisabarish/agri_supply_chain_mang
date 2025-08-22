import DistributorSidebar from '../../components/DistributorSidebar';
import { useState } from 'react';

const mockOrders = [
  {
    id: 1,
    retailer: 'AgroMart',
    crop: 'Tomatoes',
    qty: 100,
    price: 1800,
    status: 'In Transit',
    orderedAt: '2024-04-12',
  },
  {
    id: 2,
    retailer: 'GreenStore',
    crop: 'Wheat',
    qty: 250,
    price: 5500,
    status: 'Delivered',
    orderedAt: '2024-04-08',
  },
  {
    id: 3,
    retailer: 'FreshBox',
    crop: 'Onions',
    qty: 120,
    price: 1800,
    status: 'Pending',
    orderedAt: '2024-04-10',
  },
];

const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);

  const updateStatus = (id, newStatus) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <DistributorSidebar />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">📦 My Orders to Retailers</h1>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow p-5 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {order.crop} → {order.retailer}
                </h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'In Transit'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                <p>📦 Quantity: {order.qty} kg</p>
                <p>💰 Price: ₹{order.price}</p>
                <p>📅 Ordered On: {order.orderedAt}</p>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => updateStatus(order.id, 'In Transit')}
                  className="px-4 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                >
                  🚚 Mark In Transit
                </button>
                <button
                  onClick={() => updateStatus(order.id, 'Delivered')}
                  className="px-4 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300"
                >
                  ✅ Mark Delivered
                </button>
                <button onClick={() => updateStatus(order.id, 'Shipped')} className="btn-sm bg-blue-500 text-white">🚚 Mark Shipped</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
