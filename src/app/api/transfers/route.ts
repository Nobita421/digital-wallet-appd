import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, amount, currency, description } = body

    if (!senderId || !receiverId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: 'Cannot transfer to yourself' },
        { status: 400 }
      )
    }

    const transfer = await apiClient.createTransfer({
      senderId,
      receiverId,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      description
    })

    return NextResponse.json(transfer)
  } catch (error) {
    console.error('Error creating transfer:', error)
    return NextResponse.json(
      { error: 'Transfer failed' },
      { status: 500 }
    )
  }
}
