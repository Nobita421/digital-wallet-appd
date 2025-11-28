"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect /dashboard to / (main page is the dashboard)
export default function DashboardPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/')
    }, [router])

    return null
}
