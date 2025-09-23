import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const qrCodes = await db.qRCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.qRCode.count({
      where: { userId }
    })

    return NextResponse.json({
      qrCodes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, currency, purpose, metadata, expiresAt } = body

    if (!userId || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a unique QR code
    const code = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const qrCode = await db.qRCode.create({
      data: {
        userId,
        code,
        amount: amount ? parseFloat(amount) : null,
        currency: currency || 'USD',
        purpose,
        metadata: metadata ? JSON.stringify(metadata) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}