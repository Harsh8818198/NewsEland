import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addHolding, removeHolding, updateHolding } from '@/lib/db/portfolios';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioId, symbol, companyName, quantity, purchasePrice } = await request.json();

    if (!portfolioId || !symbol) {
      return NextResponse.json({ 
        error: 'Portfolio ID and symbol required' 
      }, { status: 400 });
    }

    const holding = await addHolding(
      portfolioId, 
      symbol, 
      companyName,
      quantity, 
      purchasePrice
    );

    return NextResponse.json({ holding });
  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json({ 
      error: 'Failed to add holding',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const holdingId = searchParams.get('id');

    if (!holdingId) {
      return NextResponse.json({ 
        error: 'Holding ID required' 
      }, { status: 400 });
    }

    await removeHolding(holdingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing holding:', error);
    return NextResponse.json({ 
      error: 'Failed to remove holding' 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { holdingId, ...updates } = await request.json();

    if (!holdingId) {
      return NextResponse.json({ 
        error: 'Holding ID required' 
      }, { status: 400 });
    }

    const holding = await updateHolding(holdingId, updates);
    return NextResponse.json({ holding });
  } catch (error) {
    console.error('Error updating holding:', error);
    return NextResponse.json({ 
      error: 'Failed to update holding' 
    }, { status: 500 });
  }
}
