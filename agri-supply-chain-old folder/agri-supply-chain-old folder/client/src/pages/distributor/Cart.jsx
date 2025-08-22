// import { useCart } from '../../context/CartContext';
// import DistributorSidebar from '../../components/DistributorSidebar';
// import { useNavigate } from 'react-router-dom';

// const Cart = () => {
//   const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
//   const navigate = useNavigate();

//   const placeOrder = async () => {
//     const payload = {
//       distributorId: 1, // or from JWT user.id
//       items: cart.map(crop => ({
//         cropId: crop.id,
//         quantity: crop.quantity,
//         total: crop.price * crop.quantity,
//       })),
//     };

//     const res = await fetch('http://localhost:5000/api/distributor/order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       alert(data.message);
//       clearCart();
//       navigate('/distributor/orders');
//     } else {
//       alert(data.error);
//     }
//   };

//   const totalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   return (
//     <div className="flex min-h-screen bg-green-50">
//       <DistributorSidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-3xl font-bold text-green-800 mb-6">🛒 Cart</h1>

//         {cart.length === 0 ? (
//           <p>Your cart is empty.</p>
//         ) : (
//           <div className="space-y-4">
//             {cart.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-white p-4 rounded-xl shadow flex items-center justify-between"
//               >
//                 <div>
//                   <h2 className="font-semibold text-green-700">{item.name}</h2>
//                   <p>₹{item.price} ×</p>
//                   <input
//                     type="number"
//                     min="1"
//                     value={item.quantity}
//                     onChange={(e) => updateQuantity(item.id, +e.target.value)}
//                     className="w-16 px-2 py-1 border rounded ml-2"
//                   />
//                 </div>
//                 <button
//                   className="text-red-600 hover:underline"
//                   onClick={() => removeFromCart(item.id)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}

//             <div className="text-xl font-bold text-right mt-4">
//               Total: ₹{totalCost}
//             </div>

//             <button
//               className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//               onClick={placeOrder}
//             >
//               ✅ Place Order
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Cart;
import { useCart } from '../../context/CartContext';
import DistributorSidebar from '../../components/DistributorSidebar';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <DistributorSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">🛒 My Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded-xl shadow"
              >
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">{item.farmer} ({item.location})</p>
                  <p className="text-sm">₹{item.price} / kg</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-20 border rounded px-2 py-1"
                  />
                  <p className="text-gray-700 font-medium">₹{item.price * item.quantity}</p>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <h2 className="text-xl font-semibold text-blue-800">Total: ₹{total}</h2>
              <button
                onClick={() => {
                  alert('✅ Order Placed (mock)');
                  clearCart();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                🧾 Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
