"use client"

import { useState } from "react"
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
  CoinsIcon
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

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

  const { data, isLoading, isError, refetch } = useQuery<PortfolioData>({
    queryKey: ['portfolio', submittedAddress],
    queryFn: () => fetch(`/api/portfolio?address=${submittedAddress}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    }),
    enabled: !!submittedAddress,
    staleTime: 30000,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  return (
    <main className="min-h-screen py-10 relative overflow-hidden">
      <BackgroundBeams />
      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio Tracker</h1>
          <p className="text-muted-foreground">Track any ThetaChain wallet balances and value in real-time.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
              <WalletIcon className="h-4 w-4" />
              Wallet Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter ThetaChain wallet address (0x...)" 
                  className="pl-10 bg-black/20 border-blue-900/20 focus:border-blue-500/50 transition-colors"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
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
                    <Skeleton className="h-4 w-24 bg-muted/50" />
                    <Skeleton className="h-10 w-48 bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-muted/50" />
                    <Skeleton className="h-6 w-64 bg-muted/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
                      <Skeleton className="h-6 flex-1 bg-muted/50" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isError ? (
          <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircleIcon className="h-10 w-10 text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-red-400 mb-2">Could not load wallet data</h3>
              <p className="text-muted-foreground mb-6">Make sure this is a valid ThetaChain address and try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="border-red-500/20 hover:bg-red-500/10 text-red-400">
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        ) : data && submittedAddress ? (
          <div className="space-y-6">
            {/* Portfolio Summary Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Total Portfolio Value</div>
                    <div className="text-4xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                      ${data.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Active Wallet</span>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-blue-900/10">
                        <span className="text-xs font-mono text-blue-200">
                          {data.address.slice(0, 8)}...{data.address.slice(-8)}
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 hover:bg-blue-500/20 text-blue-400"
                          onClick={() => copyToClipboard(data.address)}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <a 
                      href={`https://explorer.thetatoken.org/account/${data.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                      View on ThetaScan
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Holdings Table */}
            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 overflow-hidden">
              <CardHeader className="border-b border-blue-900/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
                  <CoinsIcon className="h-4 w-4" />
                  Token Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {data.tokens.length > 0 ? (
                  <div className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-blue-900/10 bg-blue-500/5">
                          <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 pl-4">Token</TableHead>
                          <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Balance</TableHead>
                          <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 hidden sm:table-cell">Price</TableHead>
                          <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">USD Value</TableHead>
                          <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 hidden md:table-cell">24h Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.tokens.map((token) => (
                          <TableRow key={token.symbol} className="border-blue-900/10 hover:bg-blue-500/5 transition-colors">
                            <TableCell className="py-4 pl-4">
                              <div className="flex items-center gap-3">
                                <img src={token.iconUrl} alt={token.symbol} className="w-8 h-8 rounded-full bg-muted shadow-sm" />
                                <div>
                                  <div className="font-bold text-sm sm:text-base">{token.symbol}</div>
                                  <div className="text-[10px] text-muted-foreground uppercase hidden sm:block">{token.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                              ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </TableCell>
                            <TableCell className="font-bold text-blue-100 text-sm sm:text-base">
                              ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className={`flex items-center gap-1 text-xs font-bold ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change24h >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                                {Math.abs(token.change24h)}%
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 rounded-full bg-blue-500/10 mb-4">
                      <WalletIcon className="h-10 w-10 text-blue-400/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">No tokens found</h3>
                    <p className="text-sm text-muted-foreground">No assets detected for this wallet address on ThetaChain.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  )
}
