const { ethers } = require('ethers');
require('dotenv').config();
const contractABI = require('../contracts/AgriSupplyChain.json').abi;

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Initialize contract
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Export the contract instance and provider
module.exports = { contract, provider, wallet };
