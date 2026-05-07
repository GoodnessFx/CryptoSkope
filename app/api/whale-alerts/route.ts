import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Simple in-memory cache for graceful fallback
let cache: any[] = [];

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';
const WTFUEL_ADDRESS = '0x4Dc08B15Ea0E10B96c41Aec22Fab934Ba15c983e';
const THETA_STAKING_ADDRESS = '0x0000000000000000000000000000000000001000';

const TRANSFER_EVENT_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export async function GET() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const latestBlock = await provider.getBlockNumber();
    const startBlock = latestBlock - 10;

    const logs = await provider.getLogs({
      fromBlock: startBlock,
      toBlock: latestBlock,
      topics: [TRANSFER_EVENT_SIG]
    });

    const alerts = logs
      .filter(log => 
        log.address.toLowerCase() === WTFUEL_ADDRESS.toLowerCase() || 
        log.address.toLowerCase() === THETA_STAKING_ADDRESS.toLowerCase()
      )
      .map(log => {
        const asset = log.address.toLowerCase() === WTFUEL_ADDRESS.toLowerCase() ? 'WTFUEL' : 'THETA';
        const amountWei = ethers.BigNumber.from(log.data === '0x' ? log.topics[3] : log.data);
        const amount = ethers.utils.formatEther(amountWei);
        
        // Only keep large transfers > 100,000
        if (parseFloat(amount) < 100000) return null;

        const from = ethers.utils.hexStripZeros(log.topics[1]);
        const to = ethers.utils.hexStripZeros(log.topics[2]);
        
        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          txHash: log.transactionHash,
          type: 'transfer',
          amount: parseFloat(amount).toFixed(0),
          asset,
          from: `${from.slice(0, 6)}...${from.slice(-4)}`,
          to: `${to.slice(0, 6)}...${to.slice(-4)}`,
          timestamp: Date.now(), // Fallback to current time as block timestamp requires extra calls
          valueUsd: parseFloat(amount) * (asset === 'THETA' ? 1.5 : 0.05)
        };
      })
      .filter(Boolean) as any[];

    // Update cache with latest results
    if (alerts.length > 0) {
      // Keep only unique alerts, prioritize new ones
      const newCache = [...alerts, ...cache];
      cache = Array.from(new Map(newCache.map(item => [item.id, item])).values()).slice(0, 10);
    }

    return NextResponse.json(alerts.length > 0 ? alerts : cache.slice(0, 3), {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });

  } catch (error) {
    console.error('Whale Alert API Error:', error);
    // Return last 3 cached results on failure
    return NextResponse.json(cache.slice(0, 3));
  }
}
