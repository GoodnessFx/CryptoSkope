"use client"

import React, { createContext, useContext, useCallback } from "react"
import { Crypto } from "@/lib/mockData"
import { useQuery } from "@tanstack/react-query"
import { useBlockListener } from "@/lib/hooks/useBlockListener"

interface CoinGeckoCrypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface CryptoContextType {
  cryptoData: Crypto[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

const fetchCrypto = async (): Promise<Crypto[]> => {
  const response = await fetch('/api/crypto', {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Failed to fetch data: ${response.status}`);
  }

  const data: CoinGeckoCrypto[] = await response.json();
  
  return data.map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    iconUrl: coin.image,
    price: coin.current_price,
    marketCap: coin.market_cap,
    volume: coin.total_volume,
    supply: 0,
    priceChange: {
      "1h": coin.price_change_percentage_1h_in_currency || 0,
      "24h": coin.price_change_percentage_24h_in_currency || 0,
      "7d": coin.price_change_percentage_7d_in_currency || 0
    },
    sparkline: coin.sparkline_in_7d?.price || []
  }));
};

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const { data: cryptoData = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['crypto-data'],
    queryFn: fetchCrypto,
  });

  useBlockListener([['crypto-data'], ['whale-alerts']]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <CryptoContext.Provider value={{ 
      cryptoData, 
      loading, 
      error: error instanceof Error ? error : error ? new Error('An error occurred') : null, 
      refresh 
    }}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}
