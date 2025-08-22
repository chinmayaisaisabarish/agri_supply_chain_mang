import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SupplyChain = () => {
  const { cropId } = useParams();
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplyChain();
  }, [cropId]);

  const fetchSupplyChain = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/crops/chain/${cropId}`);
      setChainData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching supply chain:', error);
      toast.error('Failed to fetch supply chain information');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supply Chain Information</h1>
      
      {chainData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Crop Details</h2>
            <p className="text-gray-600">Name: {chainData.crop.name}</p>
            <p className="text-gray-600">Price: ${chainData.crop.price}</p>
            <p className="text-gray-600">Quantity: {chainData.crop.quantity}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Supply Chain</h2>
            <div className="space-y-4">
              {chainData.chain.map((step, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-semibold">{step.role}</h3>
                  <p className="text-gray-600">Name: {step.name}</p>
                  <p className="text-gray-600">Location: {step.location}</p>
                  <p className="text-gray-600">Date: {new Date(step.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChain; 