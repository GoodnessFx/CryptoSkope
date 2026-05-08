"use client"

import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { 
  BarChart3Icon, 
  BellIcon, 
  BookmarkIcon, 
  GlobeIcon, 
  LayoutGridIcon, 
  Search, 
  UserRoundIcon, 
  WalletIcon,
  LogOutIcon,
  GithubIcon,
  TwitterIcon,
  MenuIcon,
  XIcon
} from "lucide-react"
import { Input } from "./ui/input"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cryptos } from "@/lib/mockData"
import React from "react"
import { useWallet } from "@/hooks/useWallet"
import { signIn, signOut, useSession } from "next-auth/react"
import { ethers } from "ethers"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';

export function Header() {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [isThetaConnected, setIsThetaConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { 
    account, 
    isConnecting, 
    error, 
    toggleWalletMenu, 
    isOpen, 
    setIsOpen 
  } = useWallet();
  const { data: session } = useSession();

  React.useEffect(() => {
    const checkTheta = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        await provider.getBlockNumber();
        setIsThetaConnected(true);
      } catch (err) {
        setIsThetaConnected(false);
      }
    };
    checkTheta();
    const interval = setInterval(checkTheta, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = search.trim()
    ? cryptos.filter(c =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (highlighted >= 0 && filtered[highlighted]) {
        window.open(`https://www.coingecko.com/en/coins/${filtered[highlighted].id}`, "_blank");
        setShowSuggestions(false);
        return;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const match = cryptos.find(
          c => c.symbol.toLowerCase() === query || c.name.toLowerCase() === query
        );
        if (match) {
          window.open(`https://www.coingecko.com/en/coins/${match.id}`, "_blank");
        } else {
          window.open(`https://www.coingecko.com/en/search?query=${encodeURIComponent(search)}`, "_blank");
        }
        setShowSuggestions(false);
      }
    } else if (e.key === "ArrowDown") {
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
    setHighlighted(-1);
  };

  const handleSuggestionClick = (id: string) => {
    window.open(`https://www.coingecko.com/en/coins/${id}`, "_blank");
    setShowSuggestions(false);
  };

  const handleWalletClick = () => {
    setIsOpen(true);
  };

  // Hide suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-fluid flex h-16 items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <a href="/" className="flex items-center gap-1.5 sm:gap-3 relative group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="CS" 
                className="h-6 w-6 sm:h-8 sm:w-8 transition-transform group-hover:scale-110" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://ui-avatars.com/api/?name=CS&background=3b82f6&color=fff";
                }}
              />
              <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${isThetaConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            <span className="font-bold text-base sm:text-xl tracking-tight hidden xs:inline-block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              CryptoSkope
            </span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6">
            <a href="/theta" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary whitespace-nowrap">
              Theta OHLC
            </a>
            <a href="/coin/dex" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary whitespace-nowrap">
              DEX Explorer
            </a>
            <a href="/portfolio" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary whitespace-nowrap">
              Portfolio
            </a>
            <a href="/alerts" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary whitespace-nowrap">
              Alerts
            </a>
            <a href="/news" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary whitespace-nowrap">
              News
            </a>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-4">
          <div className="relative hidden lg:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search coins..."
              className="pl-8 md:w-[150px] lg:w-[280px] bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
              value={search}
              onChange={handleChange}
              onKeyDown={handleSearch}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-card border border-border rounded-md shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
                {filtered.map((coin, idx) => (
                  <div
                    key={coin.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted ${highlighted === idx ? 'bg-muted' : ''}`}
                    onMouseDown={() => handleSuggestionClick(coin.id)}
                    onMouseEnter={() => setHighlighted(idx)}
                  >
                    <img src={coin.iconUrl} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{coin.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full flex items-center gap-2 px-2.5 sm:px-3 border-blue-900/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-bold h-8 sm:h-9"
              onClick={handleWalletClick}
              disabled={isConnecting}
            >
              <WalletIcon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline text-xs sm:text-sm">
                {isConnecting 
                  ? "..." 
                  : account 
                    ? `${account.slice(0, 4)}...${account.slice(-2)}`
                    : "Connect"
                }
              </span>
            </Button>
            
            <ThemeToggle />

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button className="md:hidden h-8 w-8 sm:h-9 sm:w-9 p-0" variant="outline">
                  <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-zinc-950 border-white/10 p-0">
                <SheetHeader className="p-6 border-b border-white/5">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <img src="/logo.png" className="h-6 w-6" alt="Logo" />
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-bold">CryptoSkope</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-6 gap-6">
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Navigation</p>
                    <a href="/theta" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Theta OHLC</a>
                    <a href="/coin/dex" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">DEX Explorer</a>
                    <a href="/portfolio" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Portfolio</a>
                    <a href="/alerts" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Alerts</a>
                    <a href="/news" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">News</a>
                  </div>
                  
                  <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Account</p>
                    {session ? (
                      <div className="flex items-center gap-3">
                        <img src={session.user?.image || ""} className="h-8 w-8 rounded-full" alt="User" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => signOut()}>
                          <LogOutIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => signIn()}>
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* isOpen removed from here as WalletPopup is now in RootLayout */}
      </div>
    </header>
  )
}