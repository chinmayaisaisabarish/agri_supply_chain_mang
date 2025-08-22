import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SupplyChainInfo = ({ cropId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplyChainInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/${cropId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching supply chain info:', error);
        toast.error('Failed to load supply chain information');
      } finally {
        setLoading(false);
      }
    };

    if (cropId) {
      fetchSupplyChainInfo();
    }
  }, [cropId]);

  if (loading) {
    return <div className="text-center py-4">Loading supply chain information...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Supply Chain Information</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500">No supply chain information available yet.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{transaction.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Date</p>
                  <p className="font-medium">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price (ETH)</p>
                  <p className="font-medium">{transaction.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{transaction.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Harvest Date</p>
                  <p className="font-medium">{new Date(transaction.harvestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <p className="font-medium break-all text-sm">
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${transaction.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {transaction.transactionHash}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplyChainInfo; 