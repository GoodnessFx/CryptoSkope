import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';
const EXPLORER_API_BASE = 'https://explorer.thetatoken.org:8443/api';

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

  try {
    console.log('Whale Alerts: Starting fetch...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    // Add a simple check with timeout
    const blockPromise = provider.getBlockNumber();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('RPC Timeout')), 8000)
    );
    lastBlock = await Promise.race([blockPromise, timeoutPromise]) as number;
    console.log(`Whale Alerts: Current block ${lastBlock}`);

    // Fetch live prices with robustness
    let tfuelPrice = 0.03; // Default fallback
    try {
      const baseUrl = new URL(request.url).origin;
      const priceRes = await fetch(`${baseUrl}/api/crypto`, { 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000) // 5s timeout for internal fetch
      });
      if (priceRes.ok) {
        const prices = await priceRes.json();
        const found = prices.find((c: any) => c.id === 'theta-fuel');
        if (found) tfuelPrice = found.current_price;
      }
    } catch (err) {
      console.warn('Whale Alerts: Could not fetch live TFUEL price, using fallback:', err);
    }

    // 1. Fetch from RPC (Last 5 blocks)
    const blocks: any[] = [];
    for (let i = 0; i < 5; i++) {
      try {
        const block = await provider.getBlockWithTransactions(lastBlock - i);
        if (block) blocks.push(block);
      } catch (err) {
        console.error(`Error fetching block ${lastBlock - i}:`, err);
      }
    }

    const rpcAlerts: WhaleAlert[] = [];

    blocks.forEach(block => {
      if (!block.transactions) return;
      block.transactions.forEach((tx: any) => {
        try {
          const valueInEth = ethers.utils.formatEther(tx.value || 0);
          const valueNum = parseFloat(valueInEth);

          // Filter: TFUEL transfers > 50,000
          if (valueNum > 50000) {
            rpcAlerts.push({
              id: tx.hash,
              txHash: tx.hash,
              type: tx.data === '0x' ? 'transfer' : 'swap',
              asset: 'TFUEL',
              amount: valueNum.toFixed(2),
              from: tx.from,
              to: tx.to || 'Contract Creation',
              timestamp: (block.timestamp || Date.now() / 1000) * 1000,
              valueUsd: valueNum * tfuelPrice
            });
          }
        } catch (err) {
          console.error(`Error processing transaction ${tx.hash}:`, err);
        }
      });
    });

    // 2. Fetch from Explorer API (Recent large txs)
    let explorerAlerts: WhaleAlert[] = [];
    try {
      const explorerRes = await fetch(`${EXPLORER_API_BASE}/transactions/recent`, { next: { revalidate: 15 } });
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
      console.error('Explorer API Error:', err);
    }



    // 3. Combine and Deduplicate
    const combined = [...rpcAlerts, ...explorerAlerts];
    const uniqueMap = new Map();
    combined.forEach(a => uniqueMap.set(a.txHash, a));
    
    alerts = Array.from(uniqueMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

  } catch (error) {
    console.error('Whale Alerts RPC Error, falling back to Explorer API:', error);
    
    // Fallback: Fetch from Explorer API transactions list
    try {
      const fallbackRes = await fetch(`${EXPLORER_API_BASE}/transactions?type=2&pageSize=20`, { next: { revalidate: 15 } });
      const fallbackData = await fallbackRes.json();
      
      alerts = (fallbackData.body || []).map((tx: any) => {
        const amount = ethers.utils.formatEther(tx.value);
        return {
          id: tx.hash,
          txHash: tx.hash,
          type: 'transfer',
          asset: 'TFUEL',
          amount: parseFloat(amount).toFixed(2),
          from: tx.from,
          to: tx.to,
          timestamp: parseInt(tx.timestamp) * 1000,
          valueUsd: parseFloat(amount) * 0.03
        };
      }).sort((a, b) => b.timestamp - a.timestamp);
    } catch (fallbackError) {
      console.error('Whale Alerts Fallback Error:', fallbackError);
      return NextResponse.json({ 
        error: 'Failed to fetch alerts', 
        details: (fallbackError as Error).message,
        alerts: [], 
        lastBlock: 0, 
        fetchedAt 
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    alerts,
    lastBlock,
    fetchedAt
  });
}
