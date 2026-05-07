"use client";

import { SessionProvider } from "next-auth/react";
import { CryptoProvider } from "@/lib/context/CryptoContext";
import { WalletProvider } from "@/lib/context/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <CryptoProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </CryptoProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
} 