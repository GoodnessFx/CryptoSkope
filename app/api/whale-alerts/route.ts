import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URLS = [
  'https://eth-rpc-api.thetatoken.org/rpc',
  'https://theta-bridge-rpc.thetatoken.org/rpc'
];
const EXPLORER_API_BASE = 'https://explorer.thetatoken.org:8443/api';

// In-memory cache to survive RPC/API failures
let globalCache: {
  alerts: WhaleAlert[];
  lastBlock: number;
  fetchedAt: string;
} | null = null;

interface WhaleAlert {
  id: string;
  txHash: string;
  type: 'transfer' | 'swap';
  asset: 'TFUEL' | 'THETA' | 'WTFUEL' | 'USDC';
  amount: string;
  from: string;
  to: string;
  timestamp: number;
  valueUsd: number;
}

export async function GET(request: Request) {
  const fetchedAt = new Date().toISOString();
  let alerts: WhaleAlert[] = [];
  let lastBlock = 0;

  // Try each RPC until one works
  let provider = null;
  for (const url of RPC_URLS) {
    try {
      const tempProvider = new ethers.providers.JsonRpcProvider(url);
      const blockPromise = tempProvider.getBlockNumber();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('RPC Timeout')), 3000)
      );
      lastBlock = await Promise.race([blockPromise, timeoutPromise]) as number;
      provider = tempProvider;
      break; 
    } catch (err) {
      console.warn(`RPC ${url} failed, trying next...`);
    }
  }

  try {
    // Use a safe fallback price or fetch from CoinGecko directly to avoid internal fetch issues
    let tfuelPrice = 0.045; 
    try {
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=theta-fuel&vs_currencies=usd', { 
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);
      
      if (priceRes && priceRes.ok) {
        const pData = await priceRes.json();
        if (pData['theta-fuel']) tfuelPrice = pData['theta-fuel'].usd;
      }
    } catch (err) {
      // Use fallback 0.045
    }

    // 1. Fetch from RPC (Last 5 blocks)
    const blocks: any[] = [];
    if (provider && lastBlock > 0) {
      const startBlock = lastBlock;
      const endBlock = Math.max(0, lastBlock - 5);
      
      for (let i = startBlock; i > endBlock; i--) {
        try {
          const block = await provider.getBlockWithTransactions(i);
          if (block) blocks.push(block);
        } catch (err) {
          // Skip individual block failure
        }
      }
    }

    const rpcAlerts: WhaleAlert[] = [];

    blocks.forEach(block => {
      if (!block || !block.transactions) return;
      block.transactions.forEach((tx: any) => {
        try {
          // Robust value parsing
          const rawValue = tx.value ? tx.value.toString() : '0';
          const valueInEth = ethers.utils.formatEther(rawValue);
          const valueNum = parseFloat(valueInEth);

          if (valueNum > 50000) {
            rpcAlerts.push({
              id: tx.hash || `rpc-${Math.random()}`,
              txHash: tx.hash,
              type: (tx.data && tx.data !== '0x') ? 'swap' : 'transfer',
              asset: 'TFUEL',
              amount: valueNum.toFixed(2),
              from: tx.from,
              to: tx.to || 'Contract Interaction',
              timestamp: (block.timestamp || Date.now() / 1000) * 1000,
              valueUsd: valueNum * tfuelPrice
            });
          }
        } catch (err) {
          // Skip individual tx failure
        }
      });
    });

    // 2. Fetch from Explorer API
    let explorerAlerts: WhaleAlert[] = [];
    try {
      const explorerRes = await fetch(`${EXPLORER_API_BASE}/transactions/recent`, { 
        next: { revalidate: 15 },
        signal: AbortSignal.timeout(5000)
      });
      if (explorerRes.ok) {
        const explorerData = await explorerRes.json();
        if (explorerData.body && Array.isArray(explorerData.body)) {
          explorerAlerts = explorerData.body.map((tx: any) => {
            const amount = ethers.utils.formatEther(tx.value || 0);
            return {
              id: tx.hash,
              txHash: tx.hash,
              type: tx.data === '0x' ? 'transfer' : 'swap',
              asset: 'TFUEL',
              amount: parseFloat(amount).toFixed(2),
              from: tx.from,
              to: tx.to,
              timestamp: parseInt(tx.timestamp || Date.now() / 1000) * 1000,
              valueUsd: parseFloat(amount) * tfuelPrice
            };
          });
        }
      }
    } catch (err) {
      // Explorer failure is fine if we have RPC data
    }

    // 3. Combine and Deduplicate
    const combined = [...rpcAlerts, ...explorerAlerts];
    const uniqueMap = new Map();
    combined.forEach(a => uniqueMap.set(a.txHash, a));
    
    alerts = Array.from(uniqueMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    // Update Cache on success
    if (alerts.length > 0) {
      globalCache = { alerts, lastBlock, fetchedAt };
    }

  } catch (error) {
    console.error('Whale Alerts Error, using cache if available:', error);
    if (globalCache) {
      return NextResponse.json({ ...globalCache, isFromCache: true });
    }
    
    // Last resort: Fallback API
    try {
      const fallbackRes = await fetch(`${EXPLORER_API_BASE}/transactions?type=2&pageSize=20`, { 
        next: { revalidate: 15 },
        signal: AbortSignal.timeout(5000)
      });
      const fallbackData = await fallbackRes.json();
      alerts = (fallbackData.body || []).map((tx: any) => {
        const amount = ethers.utils.formatEther(tx.value || 0);
        return {
          id: tx.hash,
          txHash: tx.hash,
          type: 'transfer',
          asset: 'TFUEL',
          amount: parseFloat(amount).toFixed(2),
          from: tx.from,
          to: tx.to,
          timestamp: parseInt(tx.timestamp || Date.now() / 1000) * 1000,
          valueUsd: parseFloat(amount) * 0.03
        };
      });
      if (alerts.length > 0) {
        globalCache = { alerts, lastBlock: 0, fetchedAt };
      }
    } catch (fError) {
       // Return empty instead of 500 if everything fails
       return NextResponse.json({ alerts: [], lastBlock: 0, fetchedAt, error: 'Network failure' });
    }
  }

  return NextResponse.json({
    alerts,
    lastBlock,
    fetchedAt
  });
}
