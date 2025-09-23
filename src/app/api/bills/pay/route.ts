import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { billId, userId } = body

    if (!billId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the bill
    const bill = await db.bill.findUnique({
      where: { id: billId }
    })

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      )
    }

    if (bill.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (bill.status === 'PAID') {
      return NextResponse.json(
        { error: 'Bill already paid' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const wallet = await db.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Check if user has sufficient balance
    if (wallet.balance < bill.amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    // Process payment
    try {
      // Update wallet balance
      await db.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - bill.amount }
      })

      // Update bill status
      const updatedBill = await db.bill.update({
        where: { id: billId },
        data: { status: 'PAID' }
      })

      // Create transaction record
      await db.transaction.create({
        data: {
          userId,
          type: 'BILL_PAYMENT',
          amount: bill.amount,
          currency: bill.currency,
          description: `Payment for ${bill.name}`,
          status: 'COMPLETED'
        }
      })

      return NextResponse.json({
        bill: updatedBill,
        message: 'Bill paid successfully'
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error paying bill:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}