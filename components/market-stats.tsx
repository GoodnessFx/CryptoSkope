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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-900/20 shadow-xl overflow-hidden">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 sm:mb-4">Market Overview</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Market Cap</span>
            <span className="font-mono text-xs sm:text-sm font-bold truncate">${formatCompactNumber(marketStats.totalMarketCap)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">24h Vol</span>
            <span className="font-mono text-xs sm:text-sm font-bold truncate">${formatCompactNumber(marketStats.totalVolume24h)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">BTC Dom</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-orange-400 truncate">{formatPercentage(marketStats.btcDominance)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-900/20 shadow-xl overflow-hidden">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 sm:mb-4">Network Stats</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Assets</span>
            <span className="font-mono text-xs sm:text-sm font-bold truncate">{marketStats.totalCryptos.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Exchanges</span>
            <span className="font-mono text-xs sm:text-sm font-bold truncate">{marketStats.totalExchanges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Theta Nodes</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 truncate">2,412</span>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-900/20 shadow-xl flex flex-col overflow-hidden">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 sm:mb-4">Market Mood</h3>
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden mb-2 sm:mb-3 border border-white/5">
            <div className={`h-full ${fgColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${fearGreedIndex}%` }}></div>
          </div>
          <div className="flex items-center justify-between w-full text-[7px] sm:text-[8px] font-black opacity-40 uppercase tracking-tighter">
            <span>Fear</span>
            <span>Greed</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2 justify-center">
            <span className={`text-xl sm:text-2xl font-black font-mono ${fgColor.replace('bg-', 'text-')}`}>{fearGreedIndex}</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${fgColor.replace('bg-', 'text-')}`}>{fgLabel}</span>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-blue-900/20 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-1.5 sm:p-2">
          <div className="text-[7px] sm:text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded border border-blue-500/30 font-black tracking-tighter">AI AGENT</div>
        </div>
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 sm:mb-4">Theta Signal</h3>
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl sm:text-3xl font-black mb-0.5 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400 group-hover:scale-110 transition-transform font-mono">
            {aiSentiment.score}%
          </div>
          <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${aiSentiment.color}`}>
            {aiSentiment.label}
          </div>
          <div className="mt-2 sm:mt-3 text-[8px] sm:text-[9px] text-muted-foreground text-center leading-tight font-medium uppercase tracking-tighter">
            Accumulation Signal: <span className="text-blue-300">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}