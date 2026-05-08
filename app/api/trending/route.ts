import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY ? { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY } : {})
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    
    // Return mock fallback data to prevent app crash
    return NextResponse.json({
      coins: [
        { item: { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', thumb: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', price_btc: 1, score: 0 } },
        { item: { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', thumb: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', price_btc: 0.05, score: 1 } },
        { item: { id: 'theta-token', symbol: 'THETA', name: 'Theta Network', thumb: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png', price_btc: 0.00001, score: 2 } }
      ]
    });
  }
} 