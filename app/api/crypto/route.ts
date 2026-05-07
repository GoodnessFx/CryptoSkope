import { NextResponse } from 'next/server';

// In-memory cache for CoinGecko fallback
let cryptoCache: any[] | null = null;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();
  
  // Return cache if it's fresh (less than 30s old)
  if (cryptoCache && (now - lastFetchTime < 30000)) {
    return NextResponse.json(cryptoCache);
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=theta-ecosystem&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d',
      {
        headers: {
          'Accept': 'application/json',
          'X-CG-API-KEY': process.env.COINGECKO_API_KEY || ''
        },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      if (cryptoCache) return NextResponse.json(cryptoCache);
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || `Failed to fetch data: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    cryptoCache = data;
    lastFetchTime = now;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    if (cryptoCache) return NextResponse.json(cryptoCache);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 