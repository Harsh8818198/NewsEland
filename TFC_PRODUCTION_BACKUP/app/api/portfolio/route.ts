import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createPortfolio, getPortfolios, addHolding } from '@/lib/db/portfolios';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolios = await getPortfolios(userId);
    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolios' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ 
        error: 'Portfolio name required' 
      }, { status: 400 });
    }

    const portfolio = await createPortfolio(userId, name, description);
    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ 
      error: 'Failed to create portfolio' 
    }, { status: 500 });
  }
}
