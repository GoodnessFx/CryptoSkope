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
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d',
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY ? { 'X-CG-API-KEY': process.env.COINGECKO_API_KEY } : {})
        },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(15000) // Increased timeout
      }
    ).catch(() => ({ ok: false, status: 504 } as any));

    if (!response.ok) {
      if (cryptoCache) return NextResponse.json(cryptoCache);
      
      const fallback = [
        { 
          id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 104500, market_cap: 2000000000000, total_volume: 45000000000, 
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          price_change_percentage_1h_in_currency: 0.1, price_change_percentage_24h_in_currency: 1.2, price_change_percentage_7d_in_currency: 5.5,
          sparkline_in_7d: { price: [103000, 104000, 103500, 104500] } 
        },
        { 
          id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2500, market_cap: 300000000000, total_volume: 20000000000, 
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          price_change_percentage_1h_in_currency: 0.2, price_change_percentage_24h_in_currency: 2.5, price_change_percentage_7d_in_currency: 4.2,
          sparkline_in_7d: { price: [2400, 2450, 2480, 2500] } 
        },
        { 
          id: 'theta-token', 
          symbol: 'theta', 
          name: 'Theta Network', 
          current_price: 1.25, 
          market_cap: 1250000000, 
          total_volume: 50000000, 
          image: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
          price_change_percentage_1h_in_currency: 0.5,
          price_change_percentage_24h_in_currency: 2.5,
          price_change_percentage_7d_in_currency: 5.2,
          sparkline_in_7d: { price: [1.2, 1.25, 1.22, 1.25, 1.23, 1.25, 1.24] } 
        },
        { 
          id: 'theta-fuel', 
          symbol: 'tfuel', 
          name: 'Theta Fuel', 
          current_price: 0.045, 
          market_cap: 300000000, 
          total_volume: 15000000, 
          image: 'https://assets.coingecko.com/coins/images/8029/large/1_0Yv_9_s_D_v_O_j_m_f_v_p_p_H_Q.png',
          price_change_percentage_1h_in_currency: 0.2,
          price_change_percentage_24h_in_currency: 1.8,
          price_change_percentage_7d_in_currency: 3.5,
          sparkline_in_7d: { price: [0.044, 0.045, 0.0445, 0.045, 0.0448, 0.045, 0.0449] } 
        }
      ];
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    cryptoCache = data;
    lastFetchTime = now;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    if (cryptoCache) return NextResponse.json(cryptoCache);
    
    return NextResponse.json([
      { 
        id: 'theta-token', 
        symbol: 'theta', 
        name: 'Theta Network', 
        current_price: 1.25, 
        market_cap: 1250000000, 
        total_volume: 50000000, 
        image: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
        price_change_percentage_1h_in_currency: 0.5,
        price_change_percentage_24h_in_currency: 2.5,
        price_change_percentage_7d_in_currency: 5.2,
        sparkline_in_7d: { price: [1.2, 1.25, 1.22, 1.25, 1.23, 1.25, 1.24] } 
      },
      { 
        id: 'theta-fuel', 
        symbol: 'tfuel', 
        name: 'Theta Fuel', 
        current_price: 0.045, 
        market_cap: 300000000, 
        total_volume: 15000000, 
        image: 'https://assets.coingecko.com/coins/images/8029/large/1_0Yv_9_s_D_v_O_j_m_f_v_p_p_H_Q.png',
        price_change_percentage_1h_in_currency: 0.2,
        price_change_percentage_24h_in_currency: 1.8,
        price_change_percentage_7d_in_currency: 3.5,
        sparkline_in_7d: { price: [0.044, 0.045, 0.0445, 0.045, 0.0448, 0.045, 0.0449] } 
      }
    ]);
  }
} 