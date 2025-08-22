import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import AgriSupplyChain from "../contracts/AgriSupplyChain.json";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            setupProvider();
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          setupProvider();
        } else {
          setWalletAddress('');
          setIsConnected(false);
          setProvider(null);
          setSigner(null);
          setContract(null);
          setBalance("0");
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const setupProvider = async () => {
    try {
      // Create provider using ethers v6 syntax
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      
      // Get signer using ethers v6 syntax
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      // Create contract instance
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress || !ethers.isAddress(contractAddress)) {
        console.error('Invalid contract address');
        return;
      }

      const contract = new ethers.Contract(
        contractAddress,
        AgriSupplyChain.abi,
        web3Signer
      );

      setContract(contract);
      await getBalance(walletAddress);
    } catch (error) {
      console.error('Error setting up provider:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        await setupProvider();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setBalance("0");
  };

  const getBalance = async (address) => {
    try {
      if (!contract) return;
      const balance = await contract.getBalance(address);
      setBalance(ethers.formatEther(balance)); // Updated to ethers v6 syntax
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const value = {
    walletAddress,
    isConnected,
    provider,
    signer,
    contract,
    balance,
    connectWallet,
    disconnectWallet,
    getBalance,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}; 