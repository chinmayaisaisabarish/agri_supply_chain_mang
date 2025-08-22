import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Farmer/Dashboard';
import AddCrop from './pages/Farmer/AddCrop';
import Orders from './pages/farmer/Orders';
import Transactions from './pages/Farmer/Transactions';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import FarmerDashboard from './pages/Farmer/Dashboard';
import DistributorDashboard from './pages/distributor/Dashboard';
import BlockchainStatus from './pages/distributor/BlockchainStatus';
// Import Distributor components
import Marketplace from './pages/distributor/Marketplace';
import DistributorOrders from './pages/distributor/Orders';
import Inventory from './pages/distributor/Inventory';
import RetailerProducts from './pages/distributor/RetailerProducts';
import Reports from './pages/distributor/Reports';
import Cart from './pages/distributor/Cart';

// Import Retailer components
import RetailerDashboard from './pages/retailer/Dashboard';
import RetailerMarketplace from './pages/retailer/Marketplace';
import RetailerOrders from './pages/retailer/Orders';
import RetailerInventory from './pages/retailer/Inventory';
import RetailerTransactions from './pages/retailer/Transactions';
import RetailerReports from './pages/retailer/Reports';
import RetailerCart from './pages/retailer/Cart';
import RetailerBlockchainStatus from './pages/retailer/BlockchainStatus';
import ConsumerProducts from './pages/retailer/ConsumerProducts';
import ListCropForConsumer from './pages/retailer/ListCropForConsumer';

// Import LandingPage component
import LandingPage from './pages/LandingPage';

// Import the ComingSoon page
import ComingSoon from './pages/ComingSoon';

// Import the RoleGate component
import RoleGate from './pages/login/RoleGate';

// Import Profile component
import Profile from './pages/Farmer/Profile';

// Import Consumer components
import ConsumerDashboard from './pages/Consumer/Dashboard';
import SupplyChain from './pages/Consumer/SupplyChain';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/role" element={<RoleGate />} />

        {/* Farmer Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute roles={['farmer']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/add-crop"
          element={
            <ProtectedRoute roles={['farmer']}>
              <AddCrop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/orders"
          element={
            <ProtectedRoute roles={['farmer']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/transactions"
          element={
            <ProtectedRoute roles={['farmer']}>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/profile"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Distributor Routes */}
        <Route
          path="/distributor/dashboard"
          element={
            <ProtectedRoute roles={['distributor']}>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/marketplace"
          element={
            <ProtectedRoute roles={['distributor']}>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/orders"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <DistributorOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/inventory"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/retailer-products"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <RetailerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/reports"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/cart"
          element={
            <ProtectedRoute roles={['distributor']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/blockchain"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <BlockchainStatus />
            </ProtectedRoute>
          }
        />

        {/* Retailer Routes */}
        <Route
          path="/retailer/dashboard"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/marketplace"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerMarketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/my-inventory"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/consumer-products"
          element={
            <ProtectedRoute roles={['retailer']}>
              <ConsumerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/transactions"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/orders"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/reports"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/cart"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/blockchain"
          element={
            <ProtectedRoute roles={['retailer']}>
              <RetailerBlockchainStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/list-crop/:cropId"
          element={
            <ProtectedRoute roles={['retailer']}>
              <ListCropForConsumer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/profile"
          element={
            <ProtectedRoute roles={['retailer']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Consumer Routes */}
        <Route
          path="/consumer/dashboard"
          element={
            <ProtectedRoute roles={['consumer']}>
              <ConsumerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consumer/supply-chain/:cropId"
          element={
            <ProtectedRoute roles={['consumer']}>
              <SupplyChain />
            </ProtectedRoute>
          }
        />

        {/* Common/Fallback Routes */}
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/coming-soon" />} />
      </Routes>
    </Router>
  );
}
