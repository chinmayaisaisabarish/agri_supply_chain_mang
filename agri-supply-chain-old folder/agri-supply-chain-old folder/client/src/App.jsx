import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WalletProvider } from "./context/WalletContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/Farmer/Dashboard";
import DistributorDashboard from "./pages/distributor/Dashboard";
import RetailerDashboard from "./pages/Retailer/Dashboard";
import ConsumerDashboard from "./pages/Consumer/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminSupplyChain from "./pages/Admin/SupplyChain";
import AddCrop from "./pages/Farmer/AddCrop";
import FarmerOrders from "./pages/Farmer/Orders";
import DistributorOrders from "./pages/Distributor/Orders";
import RetailerOrders from "./pages/Retailer/Orders";
import FarmerTransactions from "./pages/Farmer/Transactions";
import DistributorTransactions from "./pages/Distributor/Transactions";
import RetailerTransactions from "./pages/Retailer/Transactions";
import DistributorInventory from "./pages/Distributor/Inventory";
import RetailerInventory from "./pages/Retailer/Inventory";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import ListCropForRetail from "./pages/distributor/ListCropForRetail";
import AdminTransactions from './pages/Admin/Transactions';
import ConsumerOrders from './pages/Consumer/Orders';
import ConsumerTransactions from './pages/Consumer/Transactions';

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/supply-chain"
              element={
                <PrivateRoute>
                  <AdminSupplyChain />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <PrivateRoute>
                  <AdminTransactions />
                </PrivateRoute>
              }
            />

            {/* Consumer routes */}
            <Route
              path="/consumer/dashboard"
              element={
                <PrivateRoute>
                  <ConsumerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/consumer/orders"
              element={
                <PrivateRoute>
                  <ConsumerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/consumer/transactions"
              element={
                <PrivateRoute>
                  <ConsumerTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/consumer/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <PrivateRoute>
                  <FarmerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/add-crop"
              element={
                <PrivateRoute>
                  <AddCrop />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <PrivateRoute>
                  <FarmerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/transactions"
              element={
                <PrivateRoute>
                  <FarmerTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/dashboard"
              element={
                <PrivateRoute>
                  <DistributorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/list-for-retail"
              element={
                <PrivateRoute>
                  <ListCropForRetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/my-inventory"
              element={
                <PrivateRoute>
                  <DistributorInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/orders"
              element={
                <PrivateRoute>
                  <DistributorOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/distributor/transactions"
              element={
                <PrivateRoute>
                  <DistributorTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/dashboard"
              element={
                <PrivateRoute>
                  <RetailerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/marketplace"
              element={
                <PrivateRoute>
                  <RetailerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/orders"
              element={
                <PrivateRoute>
                  <RetailerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/my-inventory"
              element={
                <PrivateRoute>
                  <RetailerInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/transactions"
              element={
                <PrivateRoute>
                  <RetailerTransactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/retailer/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;
