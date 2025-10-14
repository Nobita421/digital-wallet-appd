import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = searchParams.get('page') || '0'
    const limit = searchParams.get('limit') || '10'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Proxy to backend
    const backendUrl = `${BACKEND_URL}/api/budgets?userId=${userId}&page=${page}&limit=${limit}`
    const response = await fetch(backendUrl)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets from backend' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Remove userId from body as it's sent as query param
    const { userId: _, ...budgetData } = body

    // Proxy to backend
    const backendUrl = `${BACKEND_URL}/api/budgets?userId=${userId}`
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}