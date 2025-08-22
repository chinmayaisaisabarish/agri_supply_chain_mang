import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';  // Import useRole hook
import AuthLayout from './AuthLayout';

const Register = () => {
  const { role } = useRole(); // Get role from context
  const [form, setForm] = useState({ name: '', email: '', password: '', sample: '' }); // Added sample to form state
  const navigate = useNavigate();

  // Update the form's role if the role in context changes
  useEffect(() => {
    if (role) {
      setForm((prevForm) => ({ ...prevForm, role })); // Set role in the form
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }), // Include role in the request payload
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      // Redirect based on the role
      if (role === 'farmer') navigate('/farmer/dashboard');
      else if (role === 'distributor') navigate('/distributor/dashboard');
      else navigate('/coming-soon');  // For unsupported roles
    } else {
      alert(data.error);
    }
  };

  return (
    <AuthLayout title="Create an Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Sample Input"
          value={form.sample}
          onChange={(e) => setForm({ ...form, sample: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="username"
          placeholder="sample"
          className="w-full border px-4 py-2 rounded"
          required
        />
      
        {/* Display the selected role */}
        <p className="text-sm text-gray-600 mb-2">Selected Role: <strong>{role}</strong></p>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
