"use client"

import { useState } from "react"
import { formatCurrency, formatCompactNumber, formatPercentage, getPriceChangeColor, Crypto } from "@/lib/mockData"
import { SparklineChart } from "./sparkline-chart"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"
import { useCrypto } from "@/lib/context/CryptoContext"
import { CoinDetailsDrawer } from "./coin-details-drawer"

type SortField = 'name' | 'price' | 'marketCap' | 'volume' | 'priceChange.24h' | null
type SortDirection = 'asc' | 'desc'

export function CryptoTable() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null)
  
  const { cryptoData, loading, error } = useCrypto();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedCryptos = [...(cryptoData || [])].sort((a, b) => {
    if (!sortField) return 0
    
    let comparison = 0
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === 'price') {
      comparison = a.price - b.price
    } else if (sortField === 'marketCap') {
      comparison = a.marketCap - b.marketCap
    } else if (sortField === 'volume') {
      comparison = a.volume - b.volume
    } else if (sortField === 'priceChange.24h') {
      comparison = a.priceChange['24h'] - b.priceChange['24h']
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  if (loading && !cryptoData) {
    return <div className="p-4 text-center">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading data: {error.message}</div>
  }

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden w-full max-w-full">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 gap-2">
        <h3 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-blue-400 truncate max-w-full">Cryptocurrency Prices</h3>
        {loading && <div className="text-[10px] sm:text-xs text-muted-foreground animate-pulse">Syncing...</div>}
      </div>
      <div className="overflow-x-auto no-scrollbar w-full">
        <div className="min-w-[600px] lg:min-w-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[40px] sm:w-[50px] pl-4 sm:pl-6 text-[10px] font-bold uppercase tracking-wider">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-transparent p-0 h-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-transparent p-0 h-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-transparent p-0 h-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"
                    onClick={() => handleSort('priceChange.24h')}
                  >
                    24h %
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-transparent p-0 h-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-transparent p-0 h-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"
                    onClick={() => handleSort('volume')}
                  >
                    Volume
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] sm:w-[120px] pr-4 sm:pr-6 hidden md:table-cell text-[10px] font-bold uppercase tracking-wider">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCryptos.map((crypto, index) => {
                const isPositive = crypto.priceChange['24h'] > 0
                const priceChangeColor = isPositive ? "text-green-500" : "text-red-500"
                const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon
                
                return (
                  <TableRow 
                    key={crypto.id} 
                    className="hover:bg-blue-500/5 cursor-pointer border-border/50 group transition-colors"
                    onClick={() => setSelectedCoinId(crypto.id)}
                  >
                    <TableCell className="font-mono text-[10px] sm:text-xs pl-4 sm:pl-6 text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 relative shrink-0">
                          <Image 
                            src={crypto.iconUrl} 
                            alt={crypto.name}
                            width={28}
                            height={28}
                            className="rounded-full group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${crypto.symbol}&background=random`;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm truncate">{crypto.name}</div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">{crypto.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs sm:text-sm">
                      {formatCurrency(crypto.price, 'USD', crypto.price < 1 ? 4 : 2)}
                    </TableCell>
                    <TableCell className={`text-right font-bold text-[10px] sm:text-xs ${priceChangeColor}`}>
                      <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                        <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {formatPercentage(crypto.priceChange['24h'])}
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-mono text-[10px] sm:text-xs">
                      ${formatCompactNumber(crypto.marketCap)}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell font-mono text-[10px] sm:text-xs">
                      ${formatCompactNumber(crypto.volume)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell pr-4 sm:pr-6">
                      <SparklineChart 
                        data={crypto.sparkline} 
                        color={isPositive ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <CoinDetailsDrawer 
        coinId={selectedCoinId} 
        onClose={() => setSelectedCoinId(null)} 
      />
    </div>
  )
}