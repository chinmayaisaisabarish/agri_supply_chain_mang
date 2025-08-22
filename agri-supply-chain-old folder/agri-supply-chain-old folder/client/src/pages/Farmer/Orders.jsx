// import { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import FarmerSidebar from '../../components/Sidebar';
// import { ethers } from 'ethers';
// import OrderContractABI from '../../contracts/OrderContract.json'; // Update path accordingly

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [wallet, setWallet] = useState('');

//   // Fetch orders from backend for the logged-in farmer
//   const fetchOrders = async () => {
//     const res = await fetch(`http://localhost/backend/api/orders/farmer.php?wallet=${wallet}`);
//     const data = await res.json();
//     setOrders(data);
//   };

//   // Connect to the wallet using ethers.js
//   const connectWallet = async () => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const accounts = await provider.send('eth_requestAccounts', []);
//     setWallet(accounts[0]);
//   };

//   useEffect(() => {
//     connectWallet();
//   }, []);

//   useEffect(() => {
//     if (wallet) fetchOrders();  // Fetch orders once the wallet is connected
//   }, [wallet]);

//   const handleAction = async (orderId, action, cropId, soldQty) => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(
//         import.meta.env.VITE_ORDER_CONTRACT_ADDRESS,
//         OrderContractABI,
//         signer
//       );

//       // Handle accepting/rejecting orders
//       if (action === 'accept') {
//         const tx = await contract.acceptOrder(orderId);
//         await tx.wait();
//       } else if (action === 'reject') {
//         const tx = await contract.rejectOrder(orderId);
//         await tx.wait();
//       }

//       const res = await fetch(`http://localhost/backend/api/orders/update.php`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ orderId, action, cropId, soldQty }),
//       });

//       const result = await res.json();
//       toast.success("✅ Order accepted & updated");
//       fetchOrders();
//     } catch (err) {
//       toast.error("❌ Order rejected");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 overflow-x-auto">
//       <FarmerSidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-4 text-green-800">📦 Incoming Orders</h1>
//         {orders.length === 0 ? (
//           <p>No orders yet.</p>
//         ) : (
//           <table className="w-full bg-white rounded shadow overflow-hidden text-sm">
//             <thead className="bg-green-100 text-green-800">
//               <tr>
//                 <th className="p-3">Order ID</th>
//                 <th className="p-3">Crop</th>
//                 <th className="p-3">Qty</th>
//                 <th className="p-3">Distributor Name</th>
//                 <th className="p-3">Distributor Email</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order, i) => (
//                 <tr key={i} className="border-b">
//                   <td className="p-3">{order.order_id}</td>
//                   <td className="p-3">{order.crop_name}</td>
//                   <td className="p-3">{order.quantity}</td>
//                   <td className="p-3 text-xs">{order.distributor_name}</td> {/* Distributor Name */}
//                   <td className="p-3 text-xs">{order.distributor_email}</td> {/* Distributor Email */}
//                   <td className="p-3 text-yellow-600 font-medium">{order.status}</td>
//                   <td className="p-3 space-x-2">
//                     <button
//                       onClick={() => handleAction(order.order_id, 'accept', order.crop_id, order.quantity)}
//                       className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                     >
//                       Accept
//                     </button>
//                     <button
//                       onClick={() => handleAction(order.order_id, 'reject')}
//                       className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//                     >
//                       Reject
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Orders;
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import FarmerSidebar from '../../components/Sidebar';
import { ethers } from 'ethers';
import OrderContractABI from '../../contracts/OrderContract.json';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState('');

  const fetchOrders = async () => {
    const res = await fetch(`http://localhost/backend/api/orders/farmer.php?wallet=${wallet}`);
    const data = await res.json();
    setOrders(data);
  };

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setWallet(accounts[0]);
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (wallet) fetchOrders();
  }, [wallet]);

  const handleAction = async (orderId, action, cropId, soldQty) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_ORDER_CONTRACT_ADDRESS,
        OrderContractABI,
        signer
      );

      if (action === 'accept') {
        const tx = await contract.acceptOrder(orderId);
        await tx.wait();
      } else if (action === 'reject') {
        const tx = await contract.rejectOrder(orderId);
        await tx.wait();
      }

      const res = await fetch(`http://localhost/backend/api/orders/update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, cropId, soldQty }),
      });

      const result = await res.json();
      toast.success("✅ Order " + action + "ed successfully");
      fetchOrders();
    } catch (err) {
      toast.error("❌ Failed to " + action + " order");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FarmerSidebar />
      <div className="w-full ml-64"> {/* Container with sidebar offset */}
        <div className="container mx-auto px-6 py-8"> {/* Centered content container */}
          <div className="max-w-6xl mx-auto"> {/* Max width container for table */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-green-800">📦 Incoming Orders</h1>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">No orders available at the moment.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50 text-green-800">
                      <tr>
                        <th className="px-6 py-4 text-left">Order ID</th>
                        <th className="px-6 py-4 text-left">Crop</th>
                        <th className="px-6 py-4 text-left">Qty</th>
                        <th className="px-6 py-4 text-left">Distributor Name</th>
                        <th className="px-6 py-4 text-left">Distributor Email</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{order.order_id}</td>
                          <td className="px-6 py-4 font-medium">{order.crop_name}</td>
                          <td className="px-6 py-4">{order.quantity} kg</td>
                          <td className="px-6 py-4">{order.distributor_name}</td>
                          <td className="px-6 py-4">{order.distributor_email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAction(order.order_id, 'accept', order.crop_id, order.quantity)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleAction(order.order_id, 'reject')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;