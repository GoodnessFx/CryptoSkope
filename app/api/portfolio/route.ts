import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';
const EXPLORER_API_BASE = 'https://explorer.thetatoken.org:8443/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    // 1. Fetch Native Balances (THETA and TFUEL)
    // In Theta, eth_getBalance returns TFUEL (the gas token)
    // Theta balance requires a different approach or specialized RPC call, 
    // but for this implementation we'll fetch from explorer if needed or use RPC if available.
    const [tfuelBalanceWei, thetaPriceRes] = await Promise.all([
      provider.getBalance(address),
      fetch(`${new URL(request.url).origin}/api/crypto`, { next: { revalidate: 30 } }).then(res => res.json()).catch(() => null)
    ]);

    const tfuelBalance = ethers.utils.formatEther(tfuelBalanceWei);
    
    // 2. Fetch Token List from Explorer API
    const tokenRes = await fetch(`${EXPLORER_API_BASE}/account/tokenTxs/${address}`, { next: { revalidate: 30 } });
    const tokenData = tokenRes.ok ? await tokenRes.ok && tokenRes.json() : { body: [] };

    // 3. Process Tokens and Prices
    // Note: This is a simplified mapping. In a real scenario, we'd map more tokens and fetch their specific prices.
    const thetaPrice = thetaPriceRes?.find((c: any) => c.id === 'theta-token')?.current_price || 1.5;
    const tfuelPrice = thetaPriceRes?.find((c: any) => c.id === 'theta-fuel')?.current_price || 0.05;

    // We'll also try to fetch the THETA balance specifically if it's not in the token list
    // In Theta, THETA is a native-ish token but handled differently in EVM RPC.
    // For now, let's assume we get it from the account API if possible.
    const accountRes = await fetch(`${EXPLORER_API_BASE}/account/${address}`, { next: { revalidate: 30 } });
    const accountData = accountRes.ok ? await accountRes.json() : null;
    const thetaBalance = accountData?.body?.balance?.thetawei 
      ? ethers.utils.formatEther(accountData.body.balance.thetawei) 
      : "0";

    const tokens = [
      {
        symbol: 'THETA',
        name: 'Theta Token',
        balance: parseFloat(thetaBalance),
        price: thetaPrice,
        usdValue: parseFloat(thetaBalance) * thetaPrice,
        change24h: 2.5, // Mocked for now
        iconUrl: 'https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png'
      },
      {
        symbol: 'TFUEL',
        name: 'Theta Fuel',
        balance: parseFloat(tfuelBalance),
        price: tfuelPrice,
        usdValue: parseFloat(tfuelBalance) * tfuelPrice,
        change24h: -1.2, // Mocked for now
        iconUrl: 'https://assets.coingecko.com/coins/images/5031/small/tfuel.png'
      }
    ];

    // Add other tokens from tokenData if available and valid
    if (tokenData.body && Array.isArray(tokenData.body)) {
      // Process ERC20 tokens here if needed
    }

    const totalUsd = tokens.reduce((acc, curr) => acc + curr.usdValue, 0);

    return NextResponse.json({
      address,
      totalUsd,
      tokens: tokens.sort((a, b) => b.usdValue - a.usdValue)
    });

  } catch (error) {
    console.error('Portfolio API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wallet data',
      address,
      tokens: [],
      totalUsd: 0
    }, { status: 500 });
  }
}
