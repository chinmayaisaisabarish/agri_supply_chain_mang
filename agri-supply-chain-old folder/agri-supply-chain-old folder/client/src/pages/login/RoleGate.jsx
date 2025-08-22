import { useRole } from '../../context/RoleContext';
import { useNavigate } from 'react-router-dom';

const RoleGate = () => {
  const { role } = useRole();
  const navigate = useNavigate();

  const capitalizedRole = role?.charAt(0).toUpperCase() + role?.slice(1);

  if (!role) {
    return (
      <div className="text-center text-xl text-red-600 mt-20">
        🚫 No role selected. Go back to{' '}
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Home</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-white px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-4">🔐 {capitalizedRole} Access</h1>
      <p className="text-gray-600 mb-8">Would you like to log in or create a new account?</p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-white border border-green-600 text-green-700 px-6 py-2 rounded-lg shadow hover:bg-green-50"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RoleGate;
