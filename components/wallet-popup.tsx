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
    { name: 'MetaMask', description: 'The most popular Ethereum wallet', url: 'https://metamask.io/download/', icon: '🦊' },
    { name: 'Coinbase Wallet', description: 'Simple and secure by Coinbase', url: 'https://www.coinbase.com/wallet/downloads', icon: '🔵' },
    { name: 'Rabby', description: 'The best wallet for DeFi', url: 'https://rabby.io/', icon: '🐰' },
    { name: 'Trust Wallet', description: 'Mobile-first crypto wallet', url: 'https://trustwallet.com/download', icon: '🛡️' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="p-6">
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <AnimatePresence mode="wait">
            {account ? (
              /* MODE C: CONNECTED */
              <motion.div 
                key="connected"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/10 p-2.5">
                      <WalletIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Connected</h2>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{connectedWalletName || 'Browser Wallet'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    onClick={disconnectWallet}
                  >
                    <LogOutIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 rounded-xl bg-muted/30 p-4 border border-border/50">
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

                <div className="space-y-3">
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
                      {`${account.slice(0, 12)}...${account.slice(-10)}`}
                    </span>
                    {copied && <span className="text-[10px] font-bold text-green-400 uppercase">Copied!</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="border-blue-900/20 hover:bg-blue-500/5 text-blue-400 font-bold">
                    Send
                  </Button>
                  <Button variant="outline" className="border-blue-900/20 hover:bg-blue-500/5 text-blue-400 font-bold">
                    Receive
                  </Button>
                </div>
              </motion.div>
            ) : showDownload ? (
              /* MODE B: DOWNLOAD */
              <motion.div 
                key="download"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  {hasAnyWallet && (
                    <button 
                      onClick={() => setShowDownload(false)}
                      className="mb-4 flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
                    >
                      <ArrowLeftIcon className="h-3 w-3" /> Back
                    </button>
                  )}
                  <h2 className="text-xl font-bold">Get a Wallet</h2>
                  <p className="text-sm text-muted-foreground mt-1">To use CryptoSkope, you need a Web3 wallet. We recommend:</p>
                </div>

                <div className="grid gap-3">
                  {recommendedWallets.map((w) => (
                    <div key={w.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{w.icon}</span>
                        <div>
                          <div className="text-sm font-bold">{w.name}</div>
                          <div className="text-[10px] text-muted-foreground">{w.description}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-[10px] font-bold border-blue-900/20 text-blue-400 uppercase"
                        onClick={() => window.open(w.url, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Learn more about wallets at <a href="https://ethereum.org/wallets" target="_blank" className="text-blue-400 hover:underline">ethereum.org</a></p>
                </div>
              </motion.div>
            ) : (
              /* MODE A: PICKER */
              <motion.div 
                key="picker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold">Connect Wallet</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choose your wallet to connect to CryptoSkope</p>
                </div>

                <div className="grid gap-2">
                  {detectedWallets.filter(w => w.available).map((w) => (
                    <button
                      key={w.name}
                      disabled={isConnecting}
                      onClick={() => selectWallet(w.name)}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                          {w.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">{w.name}</div>
                          <div className="text-[10px] text-muted-foreground">Detected and Ready</div>
                        </div>
                      </div>
                      <div className="rounded-full bg-blue-500/10 p-1 group-hover:bg-blue-500/20 transition-colors">
                        <ChevronRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                <Separator className="bg-border/50" />
                
                <div className="text-center">
                  <button 
                    onClick={() => setShowDownload(true)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
                  >
                    <DownloadIcon className="h-3 w-3" /> Don't have a wallet?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
