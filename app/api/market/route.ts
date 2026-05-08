import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isPro = !!process.env.COINGECKO_PRO_API_KEY;
    const url = isPro 
      ? 'https://pro-api.coingecko.com/api/v3/global' 
      : 'https://api.coingecko.com/api/v3/global';
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        ...(isPro ? { 'x-cg-pro-api-key': process.env.COINGECKO_PRO_API_KEY! } : {})
      },
      next: { revalidate: 300 } // Global data doesn't change that fast
    });

    if (!response.ok) {
      // Return mock data if API fails
      return NextResponse.json({
        data: {
          total_market_cap: { usd: 2500000000000 },
          total_volume: { usd: 80000000000 },
          market_cap_percentage: { btc: 52.5, eth: 16.8 },
          active_cryptocurrencies: 12000,
          markets: 900
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({
      data: {
        total_market_cap: { usd: 2500000000000 },
        total_volume: { usd: 80000000000 },
        market_cap_percentage: { btc: 52.5, eth: 16.8 },
        active_cryptocurrencies: 12000,
        markets: 900
      }
    });
  }
} 