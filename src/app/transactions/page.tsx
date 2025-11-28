"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Search,
  Filter,
  Download
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

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        const transactionsData: any = await apiClient.getTransactions(0, 50)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'SEND':
        return <ArrowUpRight className="h-5 w-5 text-red-400" />
      case 'RECEIVE':
        return <ArrowDownRight className="h-5 w-5 text-green-400" />
      case 'BILL_PAYMENT':
        return <CreditCard className="h-5 w-5 text-blue-400" />
      case 'DEPOSIT':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'WITHDRAWAL':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Wallet className="h-5 w-5 text-gray-400" />
    }
  }

  const filteredTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-12 w-full bg-white/10" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-white/10" />
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Transactions</h2>
            <p className="text-muted-foreground">View and manage your transaction history</p>
          </div>
          <Button variant="outline" className="glass hover:bg-white/10 border-white/10 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          <Button variant="outline" className="glass border-white/10 text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Transactions List */}
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-white">All Transactions</CardTitle>
            <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-black/20 border border-white/5">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{transaction.description || transaction.type.replace('_', ' ')}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatDate(transaction.createdAt)}</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize text-xs">{transaction.status.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT' || transaction.type === 'WITHDRAWAL'
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}>
                        {transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT' || transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                        {transaction.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
