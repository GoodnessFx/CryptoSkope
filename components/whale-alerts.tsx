"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { FishIcon, WavesIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WhaleAlert {
  id: string;
  type: 'transfer' | 'swap' | 'liquidity';
  amount: string;
  asset: string;
  from: string;
  to: string;
  timestamp: number;
  valueUsd: number;
}

export function WhaleAlerts() {
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);

  useEffect(() => {
    // Simulated real-time whale alerts
    const assets = ['THETA', 'TFUEL', 'WTFUEL', 'USDC'];
    
    const generateAlert = (): WhaleAlert => {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const amount = (Math.random() * 1000000 + 500000).toFixed(0);
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: Math.random() > 0.5 ? 'transfer' : 'swap',
        amount,
        asset,
        from: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        to: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        timestamp: Date.now(),
        valueUsd: Number(amount) * (asset === 'THETA' ? 1.5 : 0.05),
      };
    };

    // Initial alerts
    setAlerts(Array.from({ length: 3 }, generateAlert));

    const interval = setInterval(() => {
      setAlerts(prev => [generateAlert(), ...prev.slice(0, 4)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
          <WavesIcon className="h-4 w-4" />
          On-Chain Whale Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 rounded-lg bg-muted/30 border border-border/50 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                  {alert.type.toUpperCase()}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                  <FishIcon className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold">
                  {Number(alert.amount).toLocaleString()} {alert.asset}
                </div>
                <div className="text-[10px] text-muted-foreground ml-auto">
                  ≈ ${alert.valueUsd.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-black/20 p-1.5 rounded">
                <span className="truncate w-20">{alert.from}</span>
                <ArrowRightIcon className="h-3 w-3 shrink-0" />
                <span className="truncate w-20">{alert.to}</span>
                <ExternalLinkIcon className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
