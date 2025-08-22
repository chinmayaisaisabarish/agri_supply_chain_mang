const { ethers } = require('ethers');
const fs = require('fs');
const abi = require('../contracts/AgriSupplyChain.json').abi;
require('dotenv').config();

const args = process.argv.slice(2); // [role, roleId, itemId, sellingPrice, costPrice, harvestDate, location, farmerWallet]

async function recordTransaction() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.SUPPLYCHAIN_CONTRACT, abi, wallet);

  const [role, roleId, itemId, sellingPrice, costPrice, harvestDate, location, farmerWallet] = args;

  const tx = await contract.recordTransaction(
    role,
    roleId,
    itemId,
    ethers.utils.parseEther(sellingPrice),
    ethers.utils.parseEther(costPrice),
    harvestDate,
    location,
    farmerWallet,
    { value: ethers.utils.parseEther(sellingPrice) }
  );

  console.log("📦 Recording transaction:", tx.hash);
  await tx.wait();
  console.log("✅ Transaction confirmed!");
}

recordTransaction().catch((err) => console.error("❌ Blockchain Error:", err));
