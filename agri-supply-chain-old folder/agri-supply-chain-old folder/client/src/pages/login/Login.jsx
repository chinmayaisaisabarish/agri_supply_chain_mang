import { useRole } from '../../context/RoleContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', sample: '' });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { role } = useRole();

  // Redirect to home if no role is selected
  useEffect(() => {
    if (!role) {
      navigate('/'); // Redirect to Landing Page if no role is selected
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, sample: form.sample }),
    });

    const data = await res.json();

    if (res.ok) {
      login(data.token || 'dummy-token');

      // ✅ Use setTimeout to fix React warning about navigate
      setTimeout(() => {
        if (role === 'farmer') navigate('/farmer/dashboard');
        else if (role === 'distributor') navigate('/distributor/dashboard');
        else navigate('/coming-soon');
      }, 100);
    } else {
      alert(data.error);
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Sample Text"
          className="w-full border px-4 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
