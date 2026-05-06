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
    <main className="min-h-screen py-6 relative">
      <BackgroundBeams />
      <div className="container mx-auto max-w-[1920px] px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {loading && <div className="text-xs text-muted-foreground animate-pulse">Syncing real-time data...</div>}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Alert</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to synchronize market data. The system is currently in read-only mode.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="ml-4 h-7 text-[10px] uppercase tracking-wider font-bold"
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketStats />
            
            <div className="mt-6">
              <CryptoTable />
            </div>
          </div>
          
          <div className="space-y-6">
            <WhaleAlerts />
            <TrendingCoins />
            <GaugeChart />
          </div>
        </div>
      </div>
    </main>
  )
}