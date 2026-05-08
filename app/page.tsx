"use client"

import { CryptoTable } from "@/components/crypto-table"
import { GaugeChart } from "@/components/gauge-chart"
import { MarketStats } from "@/components/market-stats"
import { NewsFeed } from "@/components/news-feed"
import { TrendingCoins } from "@/components/trending-coins"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { WhaleAlerts } from "@/components/whale-alerts"
import { useCrypto } from "@/lib/context/CryptoContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { error, refresh, loading } = useCrypto();

  return (
    <main className="min-h-screen py-6 relative overflow-x-hidden">
      <BackgroundBeams />
      <div className="container-fluid py-6 sm:py-10 relative z-10">
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-bold tracking-tight mb-2">Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Real-time market overview and network intelligence.</p>
            </div>
            {loading && <div className="text-xs text-muted-foreground animate-pulse self-start sm:self-auto">Syncing real-time data...</div>}
          </div>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Alert</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span>Failed to synchronize market data. The system is currently in read-only mode.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="h-7 text-[10px] uppercase tracking-wider font-bold"
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <MarketStats />
            
            <div className="mt-6">
              <CryptoTable />
            </div>
          </div>
          
          <aside className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8 lg:gap-0 lg:space-y-8">
              <GaugeChart />
              <WhaleAlerts />
            </div>
            <TrendingCoins />
          </aside>
        </div>
      </div>
    </main>
  )
}