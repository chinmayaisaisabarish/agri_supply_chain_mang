import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const [selected] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(selected);
        onConnect(selected);
        toast.success(`✅ Connected: ${selected}`);
      } catch (err) {
        toast.error('❌ Wallet connection failed');
      }
    } else {
      toast.warn('🔌 Please install MetaMask');
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="text-sm text-blue-700">Wallet: {account || 'Not Connected'}</div>
  );
};

export default WalletConnect;
