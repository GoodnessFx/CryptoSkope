import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      isTrust?: boolean;
      isBraveWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
      networkVersion: string;
    };
  }
}

interface NetworkInfo {
  chainId: string;
  name: string;
}

interface DetectedWallet {
  name: string;
  icon: string;
  available: boolean;
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wallets: DetectedWallet[] = [
        { name: 'MetaMask', icon: '🦊', available: !!window.ethereum?.isMetaMask },
        { name: 'Coinbase Wallet', icon: '🔵', available: !!window.ethereum?.isCoinbaseWallet },
        { name: 'Rabby', icon: '🐰', available: !!window.ethereum?.isRabby },
        { name: 'Trust Wallet', icon: '🛡️', available: !!window.ethereum?.isTrust },
        { name: 'Brave Wallet', icon: '🦁', available: !!window.ethereum?.isBraveWallet },
        { name: 'Browser Wallet', icon: '🌐', available: !!window.ethereum && !window.ethereum?.isMetaMask && !window.ethereum?.isCoinbaseWallet && !window.ethereum?.isRabby && !window.ethereum?.isTrust && !window.ethereum?.isBraveWallet },
      ];
      setDetectedWallets(wallets);
    }
  }, []);

  const hasAnyWallet = detectedWallets.some(w => w.available);

  const getNetworkInfo = useCallback((chainId: string): NetworkInfo => {
    const networks: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '361': 'ThetaChain Mainnet',
      '365': 'Theta Testnet',
      '137': 'Polygon Mainnet',
      '11155111': 'Sepolia Testnet',
    };
    return {
      chainId: parseInt(chainId, 16).toString(),
      name: networks[parseInt(chainId, 16).toString()] || `Chain ID: ${parseInt(chainId, 16).toString()}`,
    };
  }, []);

  const updateBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return;
    try {
      const hexBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const ethBalance = (parseInt(hexBalance, 16) / 1e18).toFixed(4);
      setBalance(ethBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, []);

  const updateNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(getNetworkInfo(chainId));
    } catch (err) {
      console.error('Error fetching network:', err);
    }
  }, [getNetworkInfo]);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateBalance(accounts[0]);
            updateNetwork();
            // Try to infer which wallet is connected
            const active = detectedWallets.find(w => w.available);
            if (active) setConnectedWalletName(active.name);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance('0');
        setNetwork(null);
        setConnectedWalletName(null);
      } else {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      if (account) {
        updateBalance(account);
        updateNetwork();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, updateBalance, updateNetwork]);

  const selectWallet = async (walletName: string) => {
    if (!window.ethereum) return;
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setConnectedWalletName(walletName);
      updateBalance(accounts[0]);
      updateNetwork();
      setIsOpen(false); // Close modal on success
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleWalletMenu = () => setIsOpen(!isOpen);
  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setNetwork(null);
    setConnectedWalletName(null);
    setIsOpen(false);
  };

  return {
    account,
    isConnecting,
    error,
    balance,
    network,
    isOpen,
    connectedWalletName,
    detectedWallets,
    hasAnyWallet,
    selectWallet,
    disconnectWallet,
    toggleWalletMenu,
    setIsOpen,
  };
};
