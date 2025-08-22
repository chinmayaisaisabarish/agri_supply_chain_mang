import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const WalletConnect = ({ onWalletConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get the provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get the network
      const network = await provider.getNetwork();
      
      // Get the chain ID
      const chainId = network.chainId;

      // Verify we're on the correct network (Sepolia testnet)
      if (chainId !== 11155111) {
        toast.error('Please switch to Sepolia testnet');
        setIsConnecting(false);
        return;
      }

      // Get the account balance
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balance);

      // Call the callback with wallet info
      onWalletConnected({
        address: account,
        balance: formattedBalance,
        chainId: chainId
      });

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-4">
        Please connect your MetaMask wallet to continue. Make sure you're on the Sepolia testnet.
      </p>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect; 