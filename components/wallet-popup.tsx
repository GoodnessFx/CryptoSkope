"use client"

import { Button } from "./ui/button"
import { 
  WalletIcon, 
  CopyIcon, 
  ExternalLinkIcon, 
  LogOutIcon, 
  ChevronRightIcon, 
  NetworkIcon,
  XIcon,
  ArrowLeftIcon,
  DownloadIcon,
  GlobeIcon
} from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useState, useEffect } from "react"
import { Separator } from "./ui/separator"
import { motion, AnimatePresence } from "framer-motion"

export function WalletPopup() {
  const { 
    account, 
    balance, 
    network, 
    disconnectWallet, 
    isOpen, 
    setIsOpen, 
    detectedWallets, 
    hasAnyWallet, 
    selectWallet,
    connectedWalletName,
    isConnecting
  } = useWallet();
  
  const [showDownload, setShowDownload] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-switch to download mode if no wallet detected
  useEffect(() => {
    if (isOpen && !hasAnyWallet) {
      setShowDownload(true);
    }
  }, [isOpen, hasAnyWallet]);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (account && network) {
      const explorerUrl = network.chainId === '361' 
        ? `https://explorer.thetatoken.org/account/${account}`
        : `https://etherscan.io/address/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const recommendedWallets = [
    { name: 'Coinbase Wallet', description: 'Simple and secure by Coinbase', url: 'https://www.coinbase.com/wallet/downloads', icon: '🔵', extensionCheck: () => !!(window as any).ethereum?.isCoinbaseWallet || !!(window as any).coinbaseWalletExtension },
    { name: 'Rabby', description: 'The best wallet for DeFi', url: 'https://rabby.io/', icon: '🐰', extensionCheck: () => !!(window as any).ethereum?.isRabby },
    { name: 'Trust Wallet', description: 'Mobile-first crypto wallet', url: 'https://trustwallet.com/download', icon: '🛡️', extensionCheck: () => !!(window as any).ethereum?.isTrust },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Card / Bottom Sheet */}
      <motion.div 
        initial={typeof window !== 'undefined' && window.innerWidth < 640 
          ? { opacity: 0, y: "100%" } 
          : { opacity: 0, scale: 0.95, y: 20 }
        }
        animate={typeof window !== 'undefined' && window.innerWidth < 640
          ? { opacity: 1, y: 0 }
          : { opacity: 1, scale: 1, y: 0 }
        }
        exit={typeof window !== 'undefined' && window.innerWidth < 640
          ? { opacity: 0, y: "100%" }
          : { opacity: 0, scale: 0.95, y: 20 }
        }
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[400px] bg-zinc-950 border border-white/10 rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden mt-auto sm:mt-0"
      >
        <div className="p-6 pb-10 sm:pb-6">
          {/* Handle for mobile bottom sheet */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-all z-10 hidden sm:block"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            {account ? (
              /* MODE C: CONNECTED */
              <motion.div 
                key="connected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <WalletIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Connected</h2>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{connectedWalletName || 'Browser Wallet'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    onClick={disconnectWallet}
                  >
                    <LogOutIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 rounded-xl bg-muted/30 p-4 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${network?.chainId === '361' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-bold text-blue-400">{network?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Balance</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{balance} ETH / TFUEL</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallet Address</span>
                    <div className="flex gap-2">
                      <button onClick={copyAddress} className="text-blue-400 hover:text-blue-300 transition-colors">
                        <CopyIcon className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={viewOnExplorer} className="text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 border border-blue-900/10 flex items-center justify-between">
                    <span className="font-mono text-sm text-blue-100">
                      {`${account.slice(0, 8)}...${account.slice(-8)}`}
                    </span>
                    {copied && <span className="text-[10px] font-bold text-green-400 uppercase">Copied!</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-blue-900/20 hover:bg-blue-500/5 text-blue-400 font-bold h-10">
                    Send
                  </Button>
                  <Button variant="outline" className="border-blue-900/20 hover:bg-blue-500/5 text-blue-400 font-bold h-10">
                    Receive
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* MODE A: PICKER (Merged with Redirect Logic) */
              <motion.div 
                key="picker"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Connect Wallet</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choose your wallet to connect to CryptoSkope</p>
                </div>

                <div className="grid gap-2">
                  {recommendedWallets.map((w) => {
                    const isInstalled = w.extensionCheck();
                    return (
                      <button
                        key={w.name}
                        disabled={isConnecting}
                        onClick={() => {
                          if (isInstalled) {
                            selectWallet(w.name);
                          } else {
                            window.open(w.url, '_blank');
                          }
                        }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                            {w.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm">{w.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {isInstalled ? 'Extension Detected' : 'Download Extension'}
                            </div>
                          </div>
                        </div>
                        <div className="h-8 px-3 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          {isInstalled ? 'Connect' : 'Download'}
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* MetaMask as fallback since it's common */}
                  <button
                    disabled={isConnecting}
                    onClick={() => {
                      if (!!(window as any).ethereum?.isMetaMask) {
                        selectWallet('MetaMask');
                      } else {
                        window.open('https://metamask.io/download/', '_blank');
                      }
                    }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                        🦊
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">MetaMask</div>
                        <div className="text-[10px] text-muted-foreground">
                          {!!(window as any).ethereum?.isMetaMask ? 'Extension Detected' : 'Download Extension'}
                        </div>
                      </div>
                    </div>
                    <div className="h-8 px-3 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {!!(window as any).ethereum?.isMetaMask ? 'Connect' : 'Download'}
                    </div>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">New to Web3? <a href="https://ethereum.org/wallets" target="_blank" className="text-blue-400 hover:underline">Learn about wallets</a></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
