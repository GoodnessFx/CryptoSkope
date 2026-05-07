"use client"

import { useState, useMemo } from "react"
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
  FilterIcon
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
  type: string
  amount: string
  asset: string
  from: string
  to: string
  timestamp: number
  valueUsd: number
}

export default function AlertsPage() {
  const [assetFilter, setAssetFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [minAmount, setMinAmount] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data: allAlerts = [], isLoading } = useQuery<WhaleAlert[]>({
    queryKey: ['whale-alerts'],
    queryFn: () => fetch('/api/whale-alerts').then(r => r.json()),
    refetchInterval: 30000,
  });

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      const matchAsset = assetFilter === "ALL" || alert.asset === assetFilter;
      const matchType = typeFilter === "ALL" || alert.type.toUpperCase() === typeFilter;
      const matchAmount = !minAmount || parseFloat(alert.amount) >= parseFloat(minAmount);
      return matchAsset && matchType && matchAmount;
    });
  }, [allAlerts, assetFilter, typeFilter, minAmount]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize);
  const paginatedAlerts = filteredAlerts.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const headers = ["Time", "Asset", "Type", "Amount", "USD Value", "From", "To", "TxHash"];
    const rows = filteredAlerts.map(alert => [
      new Date(alert.timestamp).toISOString(),
      alert.asset,
      alert.type.toUpperCase(),
      alert.amount,
      alert.valueUsd,
      alert.from,
      alert.to,
      alert.txHash
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whale_alerts_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen py-10 relative">
      <BackgroundBeams />
      <div className="container mx-auto max-w-[1920px] px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Whale Alerts Explorer</h1>
            <p className="text-muted-foreground">Monitor large-scale on-chain transfers and swaps across the Theta network.</p>
          </div>
          <Button 
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={filteredAlerts.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
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
                <Select value={assetFilter} onValueChange={setAssetFilter}>
                  <SelectTrigger className="bg-black/20 border-blue-900/20">
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-blue-900/20">
                    <SelectItem value="ALL">All Assets</SelectItem>
                    <SelectItem value="THETA">THETA</SelectItem>
                    <SelectItem value="TFUEL">TFUEL</SelectItem>
                    <SelectItem value="WTFUEL">WTFUEL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-black/20 border-blue-900/20">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-blue-900/20">
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="SWAP">Swap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Min Amount</label>
                <Input 
                  type="number" 
                  placeholder="Min tokens..." 
                  className="bg-black/20 border-blue-900/20"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-900/20 hover:bg-blue-500/10 text-blue-400"
                  onClick={() => {
                    setAssetFilter("ALL");
                    setTypeFilter("ALL");
                    setMinAmount("");
                    setPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
          <CardHeader className="pb-0 pt-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
              <WavesIcon className="h-4 w-4" />
              Real-Time Alert Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-blue-900/10">
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Time</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Asset</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Type</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">Amount</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">USD Value</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4">From / To</TableHead>
                  <TableHead className="text-blue-400 uppercase tracking-widest text-[10px] font-bold py-4 text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-blue-900/10">
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((alert) => (
                    <TableRow key={alert.id} className="border-blue-900/10 hover:bg-blue-500/5 transition-colors group">
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold">
                        {alert.asset}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                          {alert.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {Number(alert.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-blue-400/90">
                        ${alert.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-black/20 p-1.5 rounded w-fit">
                          <span className="truncate w-16">{alert.from}</span>
                          <ArrowRightIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate w-16">{alert.to}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <a 
                          href={`https://www.thetatoken.org/txs/${alert.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 transition-colors"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
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
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-blue-900/10">
                <div className="text-xs text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredAlerts.length)} of {filteredAlerts.length} alerts
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-blue-900/20"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <div className="text-xs font-bold px-2">
                    Page {page} of {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-blue-900/20"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
