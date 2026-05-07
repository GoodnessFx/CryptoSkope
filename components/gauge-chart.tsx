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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Fear & Greed Index</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-24">
              <Skeleton className="absolute top-0 left-0 right-0 h-40 rounded-t-full" />
            </div>
            <div className="mt-6 text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-24">
              <div className={`absolute top-0 left-0 right-0 h-40 rounded-t-full overflow-hidden ${gradientColor}`}></div>
              <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-full bg-card"></div>
              <div className="absolute top-0 left-0 right-0 h-20 rounded-t-full"></div>
              
              {/* Needle */}
              <div 
                className="absolute top-20 left-1/2 w-1 h-20 bg-primary origin-bottom transform -translate-x-1/2"
                style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
              ></div>
              
              {/* Center point */}
              <div className="absolute top-20 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Labels */}
              <div className="absolute top-6 left-2 text-[10px] text-red-600 font-semibold">Extreme<br/>Fear</div>
              <div className="absolute top-6 right-2 text-[10px] text-green-600 font-semibold">Extreme<br/>Greed</div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-3xl font-bold">{value}</div>
              <div className={`text-sm font-semibold mt-1 ${classColor}`}>{classification}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Updated: {fng?.timestamp ? new Date(fng.timestamp).toLocaleDateString() : 'Loading...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}