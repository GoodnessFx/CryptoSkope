"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

export function GaugeChart() {
  const [mounted, setMounted] = useState(false)
  
  const { data: fng, isLoading } = useQuery({
    queryKey: ['fear-greed'],
    queryFn: async () => {
      const r = await fetch('/api/fear-greed');
      if (!r.ok) throw new Error('Failed to fetch fear-greed data');
      return r.json();
    },
    staleTime: 1000 * 60 * 60
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const value = fng?.value ?? 50
  const classification = fng?.classification ?? "Neutral"
  const rotation = (value / 100) * 180
  
  let gradientColor = "bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
  let classColor = "text-yellow-500"
  
  if (classification === "Extreme Fear") {
    classColor = "text-red-600"
  } else if (classification === "Fear") {
    classColor = "text-orange-500"
  } else if (classification === "Neutral") {
    classColor = "text-yellow-500"
  } else if (classification === "Greed") {
    classColor = "text-lime-500"
  } else if (classification === "Extreme Greed") {
    classColor = "text-green-600"
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-blue-900/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">Fear & Greed Index</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
            <div className="mt-6 text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
              {/* Semi-circle Gauge Background */}
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-muted/20"></div>
              
              {/* Colored Gauge Strip */}
              <div 
                className={`absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent transition-all duration-1000 ease-out`}
                style={{ 
                  borderTopColor: value < 25 ? '#ef4444' : value < 45 ? '#f97316' : value < 55 ? '#eab308' : value < 75 ? '#84cc16' : '#22c55e',
                  borderRightColor: value < 75 ? 'transparent' : '#22c55e',
                  transform: `rotate(${rotation - 45}deg)`
                }}
              ></div>

              {/* Needle */}
              <div 
                className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-primary origin-bottom transition-transform duration-1000 ease-out rounded-full"
                style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-lg"></div>
              </div>
              
              {/* Label Markers */}
              <div className="absolute bottom-1 left-2 text-[8px] font-bold text-red-500/80 uppercase tracking-tighter">Fear</div>
              <div className="absolute bottom-1 right-2 text-[8px] font-bold text-green-500/80 uppercase tracking-tighter text-right">Greed</div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-4xl font-black tracking-tighter font-mono">{value}</div>
              <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${classColor}`}>{classification}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-widest">
                Last Updated: {fng?.timestamp ? new Date(fng.timestamp).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}