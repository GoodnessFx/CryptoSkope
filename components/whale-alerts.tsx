"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { FishIcon, WavesIcon, ArrowRightIcon, ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { formatCompactNumber } from "@/lib/mockData"

interface WhaleAlert {
  id: string;
  txHash: string;
  type: 'transfer' | 'swap' | 'liquidity';
  amount: string;
  asset: string;
  from: string;
  to: string;
  timestamp: number;
  valueUsd: number;
}

interface WhaleAlertsResponse {
  alerts: WhaleAlert[];
  lastBlock: number;
  fetchedAt: string;
}

export function WhaleAlerts() {
  const { data, isLoading, isError, refetch } = useQuery<WhaleAlertsResponse>({
    queryKey: ['whale-alerts'],
    queryFn: async () => {
      const r = await fetch('/api/whale-alerts');
      if (!r.ok) throw new Error('Failed to fetch whale alerts');
      return r.json();
    },
    refetchInterval: 30000,
  });

  const alerts = data?.alerts;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20 overflow-hidden">
      <CardHeader className="pb-2 border-b border-white/5">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center justify-between">
          Whale Alerts
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] text-muted-foreground">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto no-scrollbar p-3 space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sync Error</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="h-8 text-[10px] gap-2 border-blue-500/20 hover:bg-blue-500/10"
              >
                <RefreshCcwIcon className="h-3 w-3" />
                Retry
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {alerts?.map((alert: WhaleAlert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 relative overflow-hidden group transition-colors hover:bg-blue-500/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] h-4 px-1.5 font-bold">
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-full bg-blue-500/20 text-blue-400">
                      <FishIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold truncate">
                      {Number(alert.amount).toLocaleString()} {alert.asset}
                    </div>
                    <div className="text-[10px] text-muted-foreground ml-auto font-mono shrink-0">
                      ${formatCompactNumber(alert.valueUsd)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono bg-black/40 p-1.5 rounded-md border border-white/5 overflow-hidden">
                    <span className="truncate flex-1 min-w-0">{alert.from.slice(0, 6)}...{alert.from.slice(-4)}</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 shrink-0 text-blue-500/50" />
                    <span className="truncate flex-1 min-w-0">{alert.to.slice(0, 6)}...{alert.to.slice(-4)}</span>
                    <a 
                      href={`https://explorer.thetatoken.org/tx/${alert.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <div className="py-10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Waiting for whale activity...</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
     </Card>
   )
 }
