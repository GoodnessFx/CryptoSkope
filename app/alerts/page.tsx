"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  WavesIcon, 
  ExternalLinkIcon, 
  DownloadIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FilterIcon,
  RefreshCcwIcon,
  AlertCircleIcon
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface WhaleAlert {
  id: string
  txHash: string
  type: 'transfer' | 'swap'
  amount: string
  asset: 'TFUEL' | 'THETA' | 'WTFUEL' | 'USDC'
  from: string
  to: string
  timestamp: number
  valueUsd: number
}

interface WhaleAlertsResponse {
  alerts: WhaleAlert[]
  lastBlock: number
  fetchedAt: string
}

const ITEMS_PER_PAGE = 20

const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function AlertsPage() {
  const [filterAsset, setFilterAsset] = useState<string>("ALL")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [filterMinAmount, setFilterMinAmount] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery<WhaleAlertsResponse>({
    queryKey: ['whale-alerts'],
    queryFn: async () => {
      const r = await fetch('/api/whale-alerts');
      if (!r.ok) throw new Error('Failed to fetch whale alerts');
      return r.json();
    },
    refetchInterval: 15000,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterAsset, filterType, filterMinAmount])

  const filteredAlerts = useMemo(() => {
    if (!data?.alerts) return []
    return data.alerts.filter(alert => {
      const matchAsset = filterAsset === "ALL" || alert.asset === filterAsset
      const matchType = filterType === "ALL" || alert.type === filterType
      const matchAmount = !filterMinAmount || parseFloat(alert.amount) >= parseFloat(filterMinAmount)
      return matchAsset && matchType && matchAmount
    })
  }, [data, filterAsset, filterType, filterMinAmount])

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE)
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const exportCSV = () => {
    const headers = ['Time', 'Asset', 'Type', 'Amount', 'USD Value', 'From', 'To', 'TxHash']
    const rows = filteredAlerts.map(a => [
      new Date(a.timestamp).toISOString(),
      a.asset,
      a.type.toUpperCase(),
      a.amount,
      a.valueUsd.toFixed(2),
      a.from,
      a.to,
      a.txHash
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `whale-alerts-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getUsdValueColor = (value: number) => {
    if (value > 500000) return 'text-green-400'
    if (value > 100000) return 'text-amber-400'
    return 'text-white'
  }

  return (
    <main className="min-h-screen py-10 relative overflow-hidden">
      <BackgroundBeams />
      <div className="container mx-auto max-w-[1920px] px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Whale Alerts Explorer</h1>
            <p className="text-muted-foreground">Monitor high-value on-chain activity across the Theta Network.</p>
          </div>
          <Button 
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 gap-2 font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            disabled={filteredAlerts.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV ({filteredAlerts.length} results)
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
              <FilterIcon className="h-4 w-4" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Asset</label>
                <Select value={filterAsset} onValueChange={setFilterAsset}>
                  <SelectTrigger className="bg-black/20 border-blue-900/20">
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-blue-900/20">
                    <SelectItem value="ALL">All Assets</SelectItem>
                    <SelectItem value="THETA">THETA</SelectItem>
                    <SelectItem value="TFUEL">TFUEL</SelectItem>
                    <SelectItem value="WTFUEL">WTFUEL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-black/20 border-blue-900/20">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-blue-900/20">
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Min Amount</label>
                <Input 
                  type="number" 
                  placeholder="Min tokens..." 
                  className="bg-black/20 border-blue-900/20"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  onClick={() => {
                    setFilterAsset("ALL")
                    setFilterType("ALL")
                    setFilterMinAmount("")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
          <CardHeader className="pb-0 pt-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
              <WavesIcon className="h-4 w-4" />
              Real-Time Alert Feed
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] animate-pulse">
              Auto-refreshing every 15s
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted/50 animate-pulse rounded-md" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircleIcon className="h-10 w-10 text-red-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Failed to fetch alerts</h3>
                <Button variant="outline" onClick={() => refetch()} className="border-blue-900/20 text-blue-400">
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-blue-900/10 bg-blue-500/5">
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 pl-6">Time</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Asset</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 hidden sm:table-cell">Type</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Amount</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 hidden md:table-cell">USD Value</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">From / To</TableHead>
                        <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 text-right pr-6">View</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAlerts.length > 0 ? (
                        paginatedAlerts.map((alert) => (
                          <TableRow key={alert.id} className="border-blue-900/10 hover:bg-muted/20 transition-colors group">
                            <TableCell className="text-[10px] sm:text-xs text-muted-foreground pl-6">
                              {formatTimeAgo(alert.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] px-1.5 py-0 h-5 ${
                                alert.asset === 'TFUEL' ? 'bg-blue-500/20 text-blue-400' : 
                                alert.asset === 'THETA' ? 'bg-purple-500/20 text-purple-400' : 
                                alert.asset === 'USDC' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-white'
                              }`}>
                                {alert.asset}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant={alert.type === 'transfer' ? 'outline' : 'default'} className={`text-[10px] px-1.5 py-0 h-5 ${
                                alert.type === 'swap' ? 'bg-blue-600' : 'border-blue-500/20 text-blue-400'
                              }`}>
                                {alert.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {parseFloat(alert.amount).toLocaleString()}
                            </TableCell>
                            <TableCell className={`font-bold text-xs sm:text-sm hidden md:table-cell ${getUsdValueColor(alert.valueUsd)}`}>
                              ${alert.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 sm:gap-2 text-[10px] text-muted-foreground font-mono bg-black/20 p-1 sm:p-1.5 rounded w-fit">
                                <span className="truncate w-12 sm:w-20">{alert.from.slice(0, 4)}...{alert.from.slice(-4)}</span>
                                <ArrowRightIcon className="h-2 w-2 sm:h-3 sm:w-3 shrink-0" />
                                <span className="truncate w-12 sm:w-20">{alert.to.slice(0, 4)}...{alert.to.slice(-4)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <a 
                                href={`https://explorer.thetatoken.org/txs/${alert.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 transition-colors"
                              >
                                <ExternalLinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No whale alerts found matching the current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-blue-900/10 gap-4">
                    <div className="text-xs text-muted-foreground">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlerts.length)} of {filteredAlerts.length} alerts
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 border-blue-900/20"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <div className="text-xs font-bold px-2">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 border-blue-900/20"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
