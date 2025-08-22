import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RoleProvider } from './context/RoleContext';
import { WalletProvider } from './context/WalletContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RoleProvider>
        <WalletProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </WalletProvider>
      </RoleProvider>
    </AuthProvider>
  </React.StrictMode>
);
