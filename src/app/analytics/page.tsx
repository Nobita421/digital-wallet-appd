"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar
} from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  description?: string
  status: string
  createdAt: string
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        const transactionsData: any = await apiClient.getTransactions(0, 100)
        setTransactions(transactionsData.transactions || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      fetchData()
    }
  }, [isAuthenticated, user?.id])

  const formatCurrency = (amount: number | undefined | null, currency: string = 'USD') => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0.00'
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    } catch (err) {
      return `$${amount.toFixed(2)}`
    }
  }

  // Calculate analytics
  const totalIncome = transactions
    .filter(t => t.type === 'RECEIVE' || t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'SEND' || t.type === 'BILL_PAYMENT' || t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0)

  const netChange = totalIncome - totalExpenses

  const transactionsByType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Analytics</h2>
          <p className="text-muted-foreground">Track your financial patterns and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                  <ArrowDownRight className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Change</p>
                  <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netChange)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${netChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {netChange >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Transaction Types
              </CardTitle>
              <CardDescription>Breakdown by transaction type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(transactionsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white capitalize">{type.replace('_', ' ').toLowerCase()}</span>
                    <span className="text-muted-foreground">{count} transactions</span>
                  </div>
                ))}
                {Object.keys(transactionsByType).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
              <CardDescription>Your financial summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-white">Total Transactions</span>
                  </div>
                  <span className="text-muted-foreground">{transactions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-white">Average Transaction</span>
                  </div>
                  <span className="text-muted-foreground">
                    {transactions.length > 0
                      ? formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
                      : '$0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
