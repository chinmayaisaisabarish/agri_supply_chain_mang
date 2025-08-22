import { useState } from 'react';
import DistributorSidebar from '../../components/DistributorSidebar';

const RetailerProducts = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Tomatoes',
      price: 20,
      quantity: 100,
      available: true,
    },
    {
      id: 2,
      name: 'Wheat',
      price: 28,
      quantity: 250,
      available: false,
    },
  ]);

  const [form, setForm] = useState({ name: '', price: '', quantity: '', available: true });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    };
    setProducts([...products, newProduct]);
    setForm({ name: '', price: '', quantity: '', available: true });
  };

  const toggleAvailability = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, available: !p.available } : p
      )
    );
  };

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <DistributorSidebar />

      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-blue-800">🛍️ List Products for Retailers</h1>

        {/* Add Product Form */}
        <form
          onSubmit={addProduct}
          className="bg-white shadow-md p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Crop Name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price (₹/kg)"
            value={form.price}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity (kg)"
            value={form.quantity}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="accent-blue-600"
            />
            Available for Purchase
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              ➕ Add Product
            </button>
          </div>
        </form>

        {/* Listed Products */}
        <div className="bg-white shadow rounded-xl p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">📦 My Product Listings</h2>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="px-4 py-2">Crop</th>
                <th className="px-4 py-2">Price (₹/kg)</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-b hover:bg-blue-50 transition">
                  <td className="px-4 py-2">{prod.name}</td>
                  <td className="px-4 py-2">₹{prod.price}</td>
                  <td className="px-4 py-2">{prod.quantity} kg</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        prod.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {prod.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => toggleAvailability(prod.id)}
                      className="text-blue-600 hover:underline"
                    >
                      🔄 Toggle
                    </button>
                    <button
                      onClick={() => removeProduct(prod.id)}
                      className="text-red-600 hover:underline"
                    >
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetailerProducts;
