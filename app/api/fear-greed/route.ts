import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1', {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Fear & Greed data');
    }

    const data = await response.json();
    const fng = data.data[0];

    return NextResponse.json({
      value: parseInt(fng.value),
      classification: fng.value_classification,
      timestamp: new Date(parseInt(fng.timestamp) * 1000).toISOString()
    });
  } catch (error) {
    console.error('Fear & Greed API Error:', error);
    // Return mock data if API is down
    return NextResponse.json({
      value: 50,
      classification: 'Neutral',
      timestamp: new Date().toISOString()
    });
  }
}
