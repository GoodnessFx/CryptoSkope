"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WalletIcon, SearchIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  usdValue: number
  priceChange24h: number
}

interface AccountData {
  address: string
  totalUsdValue: number
  balances: TokenBalance[]
}

const fetchAccountData = async (address: string): Promise<AccountData> => {
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Invalid address format');
  }
  
  const response = await fetch(`https://explorer.thetatoken.org/api/account/${address}`);
  if (!response.ok) throw new Error('Failed to fetch account data');
  const data = await response.json();
  
  // Note: The explorer API structure might vary, this is a generalized transformation
  // based on the requirement to show Balance, USD Value, and 24h Change.
  const balances: TokenBalance[] = [
    {
      symbol: 'THETA',
      name: 'Theta Token',
      balance: data.body.balance.thetawei || "0",
      usdValue: (parseFloat(data.body.balance.thetawei || "0") / 1e18) * 1.5, // Mock price for now
      priceChange24h: 2.5
    },
    {
      symbol: 'TFUEL',
      name: 'Theta Fuel',
      balance: data.body.balance.tfuelwei || "0",
      usdValue: (parseFloat(data.body.balance.tfuelwei || "0") / 1e18) * 0.05, // Mock price for now
      priceChange24h: -1.2
    }
  ];

  const totalUsdValue = balances.reduce((acc, curr) => acc + curr.usdValue, 0);

  return {
    address,
    totalUsdValue,
    balances
  };
};

export default function PortfolioPage() {
  const [addressInput, setAddressInput] = useState("")
  const [activeAddress, setActiveAddress] = useState("")

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['portfolio', activeAddress],
    queryFn: () => fetchAccountData(activeAddress),
    enabled: !!activeAddress,
    staleTime: 30000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      setActiveAddress(addressInput.trim());
    }
  };

  return (
    <main className="min-h-screen py-10 relative">
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
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter ThetaChain wallet address (0x...)" 
                  className="pl-10 bg-black/20 border-blue-900/20"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Track Portfolio
              </Button>
            </form>
            {isError && (
              <p className="text-red-400 text-xs mt-2 ml-1">
                {(error as Error).message || 'An error occurred while fetching data.'}
              </p>
            )}
          </CardContent>
        </Card>

        {activeAddress && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Total Value</div>
                  {isLoading ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    <div className="text-3xl font-bold">${data?.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 md:col-span-2">
                <CardContent className="pt-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Wallet Address</div>
                  <div className="text-sm font-mono truncate">{activeAddress}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-blue-900/10">
                      <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Token</TableHead>
                      <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Balance</TableHead>
                      <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">USD Value</TableHead>
                      <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i} className="border-blue-900/10">
                          <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : data?.balances.map((token) => (
                      <TableRow key={token.symbol} className="border-blue-900/10 hover:bg-blue-500/5 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-xs">
                              {token.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold">{token.symbol}</div>
                              <div className="text-[10px] text-muted-foreground">{token.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {(parseFloat(token.balance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </TableCell>
                        <TableCell className="font-bold">
                          ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 text-xs font-bold ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.priceChange24h >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                            {Math.abs(token.priceChange24h)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
