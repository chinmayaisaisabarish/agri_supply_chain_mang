import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

console.log("✅ Landing Page Loaded");

const roles = [
  { name: 'Farmer', color: 'bg-green-600' },
  { name: 'Distributor', color: 'bg-blue-600' },
  { name: 'Retailer', color: 'bg-purple-600' },
  { name: 'Consumer', color: 'bg-yellow-500' },
  { name: 'Admin', color: 'bg-red-600' },
];

const LandingPage = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleSelect = (selectedRole) => {
    setRole(selectedRole.toLowerCase());
    navigate('/role'); // Navigating to '/role' after role is selected
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-green-800 mb-7">🌾 Agriculture Supply Chain Management using Blockchain</h1>
      <h2 className="text-xl mb-4 text-gray-700">Select your role to continue</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.name}
            onClick={() => handleSelect(role.name)}
            className={`${role.color} text-white font-semibold px-6 py-4 rounded-xl shadow hover:scale-105 transition`}
          >
            {role.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
