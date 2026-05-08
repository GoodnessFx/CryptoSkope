"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  WalletIcon, 
  SearchIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  CopyIcon, 
  ExternalLinkIcon,
  AlertCircleIcon,
  CoinsIcon,
  RefreshCcwIcon,
  ArrowRightIcon
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { useWallet } from "@/hooks/useWallet"

interface TokenHoldings {
  symbol: string
  name: string
  balance: number
  price: number
  usdValue: number
  change24h: number
  iconUrl: string
}

interface PortfolioData {
  address: string
  totalUsd: number
  tokens: TokenHoldings[]
}

export default function PortfolioPage() {
  const [addressInput, setAddressInput] = useState("")
  const [submittedAddress, setSubmittedAddress] = useState("")
  const { account } = useWallet()

  // Auto-fill from connected wallet if available and nothing is searched
  useEffect(() => {
    if (account && !submittedAddress && !addressInput) {
      setAddressInput(account);
      setSubmittedAddress(account);
    }
  }, [account, submittedAddress, addressInput]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<PortfolioData>({
    queryKey: ['portfolio', submittedAddress],
    queryFn: () => fetch(`/api/portfolio?address=${submittedAddress}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    }),
    enabled: !!submittedAddress,
    staleTime: 60000,
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = addressInput.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      setSubmittedAddress(cleanAddress);
    } else {
      toast.error("Invalid address format", {
        description: "Please enter a valid ThetaChain address (0x...)"
      });
    }
  };

  const useConnectedWallet = () => {
    if (account) {
      setAddressInput(account);
      setSubmittedAddress(account);
    } else {
      toast.info("Wallet not connected", {
        description: "Please connect your wallet using the button in the header."
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  return (
    <main className="min-h-screen py-6 sm:py-10 relative overflow-x-hidden">
      <BackgroundBeams />
      <div className="container-fluid relative z-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-bold mb-2">Portfolio Tracker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track any ThetaChain wallet balances and value in real-time.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 mb-6 sm:mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] sm:text-xs font-bold flex items-center justify-between uppercase tracking-widest text-blue-400">
              <div className="flex items-center gap-2">
                <WalletIcon className="h-3.5 w-3.5" />
                Wallet Lookup
              </div>
              {account && submittedAddress !== account && (
                <button 
                  onClick={useConnectedWallet}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 normal-case"
                >
                  <span className="hidden xs:inline">Use connected:</span> {account.slice(0, 6)}...
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter ThetaChain address (0x...)" 
                  className="pl-10 bg-black/20 border-blue-900/20 focus:border-blue-500/50 transition-colors h-11 sm:h-12 text-sm"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold h-11 sm:h-12 px-8 shadow-[0_0_15px_rgba(37,99,235,0.3)] w-full sm:w-auto shrink-0">
                Track Portfolio
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-muted/50" />
                    <Skeleton className="h-8 w-48 bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32 bg-muted/50" />
                    <Skeleton className="h-6 w-full max-w-[300px] bg-muted/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-20 w-full bg-muted/20 rounded-xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
              <div className="p-3 rounded-full bg-red-500/10 mb-4">
                <AlertCircleIcon className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Sync failure</h3>
              <p className="text-muted-foreground text-sm max-w-[280px] mb-6">We couldn't reach the Theta network. Please check the address and try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="border-red-500/20 hover:bg-red-500/10 text-red-400 gap-2">
                <RefreshCcwIcon className="h-4 w-4" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        ) : data && submittedAddress ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Portfolio Summary Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <WalletIcon className="h-24 w-24 -rotate-12" />
              </div>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Total Portfolio Value</div>
                      {isFetching && <RefreshCcwIcon className="h-2.5 w-2.5 animate-spin text-blue-400/50" />}
                    </div>
                    <div className="text-3xl sm:text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] font-mono">
                      ${data.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Network Identity</span>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-blue-900/10 backdrop-blur-md">
                        <span className="text-xs font-mono text-blue-200">
                          {data.address.slice(0, 10)}...{data.address.slice(-10)}
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          onClick={() => copyToClipboard(data.address)}
                        >
                          <CopyIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <a 
                      href={`https://explorer.thetatoken.org/account/${data.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider group/link"
                    >
                      View on ThetaScan
                      <ArrowRightIcon className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Holdings Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
                  <CoinsIcon className="h-3.5 w-3.5" />
                  Asset Allocation
                </h3>
                <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400 bg-blue-500/5 px-2 py-0.5 font-bold">
                  {data.tokens.length} {data.tokens.length === 1 ? 'TOKEN' : 'TOKENS'}
                </Badge>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {data.tokens.length > 0 ? (
                  data.tokens.map((token) => (
                    <Card key={token.symbol} className="bg-card/50 backdrop-blur-sm border-blue-900/10 hover:border-blue-500/30 transition-all group overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 relative shrink-0 rounded-full bg-muted/30 p-1 border border-white/5">
                              <img src={token.iconUrl} alt={token.symbol} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-sm sm:text-lg truncate group-hover:text-blue-400 transition-colors">{token.symbol}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-tight truncate">{token.name}</div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <div className="font-mono text-sm sm:text-lg font-bold">
                              {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                              ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </div>
                          </div>

                          <div className="text-right shrink-0 min-w-[80px] sm:min-w-[120px]">
                            <div className="font-mono text-sm sm:text-lg font-black text-blue-100">
                              ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`flex items-center justify-end gap-1 text-[10px] sm:text-xs font-bold ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h >= 0 ? <TrendingUpIcon className="h-2.5 w-2.5" /> : <TrendingDownIcon className="h-2.5 w-2.5" />}
                              {Math.abs(token.change24h)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-2xl border border-dashed border-blue-900/20">
                    <div className="p-4 rounded-full bg-blue-500/10 mb-4">
                      <WalletIcon className="h-10 w-10 text-blue-400/30" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Quiet Waters</h3>
                    <p className="text-sm text-muted-foreground max-w-[260px]">No assets detected for this wallet address on the ThetaChain network.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center mb-6 animate-pulse">
              <SearchIcon className="h-8 w-8 text-blue-400/20" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-muted-foreground/50 uppercase tracking-widest">Network Observer</h3>
            <p className="text-sm text-muted-foreground max-w-[320px]">Enter a ThetaChain wallet address above to start tracking real-time asset allocations and portfolio value.</p>
          </div>
        )}
      </div>
    </main>
  )
}
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  )
}
