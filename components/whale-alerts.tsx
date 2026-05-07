"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { FishIcon, WavesIcon, ArrowRightIcon, ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"

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
    <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-blue-400">
          <WavesIcon className="h-4 w-4" />
          On-Chain Whale Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">Failed to load whale alerts</p>
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
                  <a 
                    href={`https://www.thetatoken.org/txs/${alert.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            ))}
            {alerts?.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground py-4">No whale activity detected in recent blocks</p>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
