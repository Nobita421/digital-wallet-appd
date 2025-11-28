"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import TransferModal from '@/components/transfer-modal'
import QRCodeModal from '@/components/qr-code-modal'
import BillPaymentModal from '@/components/bill-payment-modal'
import BudgetManagement from '@/components/budget-management'
import { apiClient } from '@/lib/api-client'
import {
  Send,
  Download,
  QrCode,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Wallet
} from 'lucide-react'

interface WalletData {
  balance: number
  currency: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  description?: string
  status: string
  createdAt: string
}

export default function Home() {
  const { user, isAuthenticated, token } = useAuth()
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Auth Protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const fetchData = async () => {
    if (!user?.id) return

    try {
      // Use apiClient which now handles the token automatically
      const walletData: any = await apiClient.getWallet()
      const transactionsData: any = await apiClient.getTransactions(0, 10)

      setWallet(walletData)
      setTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData()
    }
  }, [isAuthenticated, user?.id])

  const handleTransferComplete = () => {
    fetchData()
  }

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
      year: 'numeric'
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
        return <ArrowUpRight className="h-4 w-4 text-red-400" />
      case 'RECEIVE':
        return <ArrowDownRight className="h-4 w-4 text-green-400" />
      case 'BILL_PAYMENT':
        return <CreditCard className="h-4 w-4 text-blue-400" />
      case 'DEPOSIT':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'WITHDRAWAL':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Wallet className="h-4 w-4 text-gray-400" />
    }
  }

  if (!isAuthenticated) {
    return null // Or a loading spinner while redirecting
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-4 w-32 mt-2 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-xl bg-white/10" />
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Overview</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass hover:bg-white/10 border-white/10 text-white">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 font-medium mb-1">Total Balance</p>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
                {formatCurrency(wallet?.balance, wallet?.currency)}
              </h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex gap-3">
            <TransferModal
              currentUser={user!}
              onTransferComplete={handleTransferComplete}
              trigger={
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 border-none shadow-lg font-semibold">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Money
                </Button>
              }
            />
            <Button size="lg" variant="outline" className="bg-black/20 border-white/20 text-white hover:bg-black/30 backdrop-blur-sm">
              <ArrowUpRight className="h-5 w-5 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass glass-hover cursor-pointer border-white/5">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Send Money</h3>
              <p className="text-sm text-muted-foreground">Transfer to anyone</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover cursor-pointer border-white/5">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-green-500/20 text-green-400 ring-1 ring-green-500/50">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Request</h3>
              <p className="text-sm text-muted-foreground">Get paid instantly</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover cursor-pointer border-white/5">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <QRCodeModal
              userId={user?.id.toString() || '0'}
              trigger={
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="p-4 rounded-full bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">QR Code</h3>
                    <p className="text-sm text-muted-foreground">Scan or generate</p>
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>

        <Card className="glass glass-hover cursor-pointer border-white/5">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <BillPaymentModal
              userId={user?.id.toString() || '0'}
              onPaymentComplete={handleTransferComplete}
              trigger={
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="p-4 rounded-full bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pay Bills</h3>
                    <p className="text-sm text-muted-foreground">Utilities & more</p>
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">Transactions</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">Analytics</TabsTrigger>
          <TabsTrigger value="budgets" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No transactions found</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-black/20 border border-white/5">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{transaction.description || transaction.type}</p>
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
                        <p className={`font-bold ${transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT'
                          ? 'text-red-400'
                          : 'text-green-400'
                          }`}>
                          {transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT' ? '-' : '+'}
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
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="glass border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Spending Analytics</CardTitle>
              <CardDescription>Track your financial patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-muted-foreground">
                <div className="p-6 rounded-full bg-white/5 w-fit mx-auto mb-6 ring-1 ring-white/10">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
                <p>We are building powerful charts to help you visualize your spending.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManagement
            userId={user?.id.toString() || '0'}
            onBudgetUpdate={handleTransferComplete}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}