'use client'

import { useState } from "react"
import { formatCompactNumber, formatPercentage, marketStats } from "@/lib/mockData"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const PIE_COLORS = ["#F7931A", "#627EEA", "#8884d8"] // BTC orange, ETH blue, Others purple

export function MarketStats() {
  const [aiSentiment, setAiSentiment] = useState<{ score: number, label: string, color: string }>({
    score: 74,
    label: "Bullish",
    color: "text-green-400"
  });

  const marketDistributionData = [
    { name: "BTC", value: marketStats.btcDominance },
    { name: "ETH", value: marketStats.ethDominance },
    { name: "Others", value: 100 - marketStats.btcDominance - marketStats.ethDominance }
  ]

  const fearGreedIndex = 62; // Mock value (0-100)
  let fgLabel = "Neutral";
  let fgColor = "bg-yellow-400";
  if (fearGreedIndex < 25) { fgLabel = "Extreme Fear"; fgColor = "bg-red-500"; }
  else if (fearGreedIndex < 50) { fgLabel = "Fear"; fgColor = "bg-orange-400"; }
  else if (fearGreedIndex < 75) { fgLabel = "Greed"; fgColor = "bg-green-400"; }
  else { fgLabel = "Extreme Greed"; fgColor = "bg-emerald-500"; }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg p-4 shadow border border-border">
        <h3 className="text-lg font-medium mb-4">Market Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Market Cap</span>
            <span className="font-medium">${formatCompactNumber(marketStats.totalMarketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">24h Volume</span>
            <span className="font-medium">${formatCompactNumber(marketStats.totalVolume24h)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">BTC Dominance</span>
            <span className="font-medium">{formatPercentage(marketStats.btcDominance)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow border border-border">
        <h3 className="text-lg font-medium mb-4">Network Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Assets</span>
            <span className="font-medium">{marketStats.totalCryptos.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchanges</span>
            <span className="font-medium">{marketStats.totalExchanges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Theta Nodes</span>
            <span className="font-medium text-blue-400">2,412</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow border border-border flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-3">Fear & Greed</h3>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div className={`h-full ${fgColor}`} style={{ width: `${fearGreedIndex}%` }}></div>
          </div>
          <div className="flex items-center justify-between w-full text-[10px] font-semibold opacity-50">
            <span>FEAR</span>
            <span>GREED</span>
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: fgColor.replace('bg-', 'text-') }}>{fearGreedIndex}</div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{fgLabel}</div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow border border-border flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1">
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">AI</span>
        </div>
        <h3 className="text-lg font-medium mb-3">Theta Sentiment</h3>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400">
            {aiSentiment.score}%
          </div>
          <div className={`text-sm font-bold uppercase tracking-widest ${aiSentiment.color}`}>
            {aiSentiment.label}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground text-center leading-tight px-4">
            AI analysis of social feeds & on-chain whale movements suggests strong accumulation.
          </div>
        </div>
      </div>
    </div>
  )
}