import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

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

    // Proxy to backend
    const backendUrl = `${BACKEND_URL}/api/bills/pay?billId=${billId}&userId=${userId}`
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to pay bill' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error paying bill:', error)
    return NextResponse.json(
      { error: 'Failed to pay bill' },
      { status: 500 }
    )
  }
}