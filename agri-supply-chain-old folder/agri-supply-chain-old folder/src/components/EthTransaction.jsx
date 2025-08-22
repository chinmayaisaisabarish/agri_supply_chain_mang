import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useWallet } from '../context/WalletContext';
import contractABI from '../contracts/AgriSupplyChain.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const NETWORK_ID = import.meta.env.VITE_NETWORK_ID;

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_role",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_roleId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_itemId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_sellingPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_costPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_harvestDate",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      }
    ],
    "name": "recordTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const EthTransaction = ({ price, onTransactionComplete, cropData }) => {
  const { account, provider, isConnected, connectWallet, getBalance } = useWallet();
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (provider) {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());
      setContract(contract);
      getBalance(account).then(setBalance);
    }
  }, [provider, account, getBalance]);

  const handleTransaction = async () => {
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (error) {
        toast.error(error.message);
        return;
      }
    }

    try {
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      // Convert price to Wei
      const amountInWei = ethers.utils.parseEther(price.toString());
      
      // Convert harvest date to Unix timestamp
      const harvestDate = Math.floor(new Date(cropData.harvestDate).getTime() / 1000);
      
      // Record transaction
      const tx = await contractWithSigner.recordTransaction(
        cropData.role || 'farmer',
        cropData.roleId || '1',
        cropData.itemId || '1',
        amountInWei,
        ethers.utils.parseEther(cropData.costPrice.toString()),
        harvestDate,
        cropData.location,
        { value: amountInWei }
      );

      await tx.wait();
      toast.success('Transaction recorded successfully!');
      onTransactionComplete(tx.hash);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed: ' + error.message);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-2">Connected Account: {account}</p>
          <p className="mb-2">Balance: {balance} ETH</p>
          <p className="mb-2">Price: {price} ETH</p>
          <button
            onClick={handleTransaction}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Record Transaction
          </button>
        </div>
      )}
    </div>
  );
};

export default EthTransaction;