import React from 'react';
import RetailerSidebar from '../../components/RetailerSidebar';
import { useWallet } from '../../context/WalletContext';
import { FaEthereum } from 'react-icons/fa';

const BlockchainStatus = () => {
  const { walletAddress, connectWallet } = useWallet();

  return (
    <div className="flex h-screen bg-gray-100">
      <RetailerSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Blockchain Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FaEthereum className="text-2xl text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Wallet Connection Status</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Current Wallet Address:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">
              {walletAddress || 'Not Connected'}
            </p>
          </div>
          
          {!walletAddress && (
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Connect MetaMask
            </button>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Network Information</h3>
            <p className="text-gray-600">
              This application runs on the Sepolia test network. Make sure your MetaMask is connected
              to the Sepolia network to interact with the blockchain features.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Smart Contract Integration</h3>
            <p className="text-gray-600">
              The retailer smart contract handles:
              <ul className="list-disc ml-6 mt-2">
                <li>Purchasing crops from distributors</li>
                <li>Listing products for consumers</li>
                <li>Managing inventory on the blockchain</li>
                <li>Recording transactions with distributors and consumers</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainStatus; 