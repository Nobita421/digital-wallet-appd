"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/dashboard-layout'
import BudgetManagement from '@/components/budget-management'

export default function BudgetsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Budgets</h2>
          <p className="text-muted-foreground">Manage your spending limits and financial goals</p>
        </div>

        {/* Budget Management Component */}
        <BudgetManagement
          userId={user?.id.toString() || '0'}
          onBudgetUpdate={() => {}}
        />
      </div>
    </DashboardLayout>
  )
}
