import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletProvider } from './context/WalletContext';

// Import your components
import Register from './components/Register';
import Login from './components/Login';
import AddCrop from './components/AddCrop';
import SupplyChainInfo from './components/SupplyChainInfo';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/farmer/add-crop" element={<AddCrop />} />
            <Route path="/supply-chain/:cropId" element={<SupplyChainInfo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Login />} />
          </Routes>
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App; 