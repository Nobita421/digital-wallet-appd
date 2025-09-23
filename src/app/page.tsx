"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import TransferModal from '@/components/transfer-modal'
import QRCodeModal from '@/components/qr-code-modal'
import BillPaymentModal from '@/components/bill-payment-modal'
import BudgetManagement from '@/components/budget-management'
import { 
  Wallet, 
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
  XCircle
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
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const handleTransferComplete = () => {
    // Refresh wallet data after transfer
    const userId = 'cmfurffxs0000svlv7ls9z6vf'
    
    const refreshData = async () => {
      try {
        const walletResponse = await fetch(`/api/wallet?userId=${userId}`)
        const walletData = await walletResponse.json()
        
        const transactionsResponse = await fetch(`/api/transactions?userId=${userId}&limit=10`)
        const transactionsData = await transactionsResponse.json()
        
        setWallet(walletData)
        setTransactions(transactionsData.transactions || [])
      } catch (error) {
        console.error('Error refreshing data:', error)
      }
    }

    refreshData()
  }

  useEffect(() => {
    // Use the actual user ID from the seeded database
    const userId = 'cmfurffxs0000svlv7ls9z6vf' // This is the ID from the seeded user
    
    const fetchWalletData = async () => {
      try {
        // Fetch wallet data
        const walletResponse = await fetch(`/api/wallet?userId=${userId}`)
        const walletData = await walletResponse.json()
        
        // Fetch transactions
        const transactionsResponse = await fetch(`/api/transactions?userId=${userId}&limit=10`)
        const transactionsData = await transactionsResponse.json()
        
        setWallet(walletData)
        setTransactions(transactionsData.transactions || [])
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        // Fallback to mock data if API fails
        const mockWallet: WalletData = {
          balance: 2540.50,
          currency: 'USD'
        }
        
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'RECEIVE',
            amount: 500.00,
            currency: 'USD',
            description: 'Payment from John Doe',
            status: 'COMPLETED',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            type: 'SEND',
            amount: 120.50,
            currency: 'USD',
            description: 'Coffee Shop',
            status: 'COMPLETED',
            createdAt: '2024-01-14T15:45:00Z'
          },
          {
            id: '3',
            type: 'BILL_PAYMENT',
            amount: 85.00,
            currency: 'USD',
            description: 'Electricity Bill',
            status: 'COMPLETED',
            createdAt: '2024-01-13T09:20:00Z'
          },
          {
            id: '4',
            type: 'DEPOSIT',
            amount: 1000.00,
            currency: 'USD',
            description: 'Bank Transfer',
            status: 'COMPLETED',
            createdAt: '2024-01-12T14:10:00Z'
          }
        ]
        
        setWallet(mockWallet)
        setTransactions(mockTransactions)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const formatCurrency = (amount: number, currency?: string) => {
    try {
      // If currency is provided, format as currency. Otherwise fall back to a decimal format.
      if (currency) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(amount)
      }

      // Fallback: show as a decimal with two fraction digits so UI remains stable
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (err) {
      // If Intl fails for any reason, log and return a simple fixed string
      // This prevents the whole render from crashing due to bad data.
      // eslint-disable-next-line no-console
      console.error('formatCurrency error', err, amount, currency)
      return amount != null ? amount.toFixed(2) : '0.00'
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
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'SEND':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'RECEIVE':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />
      case 'BILL_PAYMENT':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'DEPOSIT':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'WITHDRAWAL':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Wallet className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Digital Wallet</h1>
            <p className="text-muted-foreground">Manage your finances securely</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Total Balance</CardTitle>
            <CardDescription className="text-blue-100">Your available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              {wallet ? formatCurrency(wallet.balance, wallet.currency) : '$0.00'}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </Button>
              <TransferModal 
                currentUser={{
                  id: 'cmfurffxs0000svlv7ls9z6vf',
                  name: 'John Doe',
                  email: 'john.doe@example.com'
                }}
                onTransferComplete={handleTransferComplete}
                trigger={
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <TransferModal 
                currentUser={{
                  id: 'cmfurffxs0000svlv7ls9z6vf',
                  name: 'John Doe',
                  email: 'john.doe@example.com'
                }}
                onTransferComplete={handleTransferComplete}
                trigger={
                  <div className="space-y-2">
                    <Send className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Send Money</h3>
                    <p className="text-sm text-muted-foreground">Transfer to anyone</p>
                  </div>
                }
              />
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Request Money</h3>
              <p className="text-sm text-muted-foreground">Get paid instantly</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <QRCodeModal 
                userId="cmfurffxs0000svlv7ls9z6vf"
                trigger={
                  <div className="space-y-2">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">QR Code</h3>
                    <p className="text-sm text-muted-foreground">Scan or generate</p>
                  </div>
                }
              />
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BillPaymentModal 
                userId="cmfurffxs0000svlv7ls9z6vf"
                onPaymentComplete={handleTransferComplete}
                trigger={
                  <div className="space-y-2">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <h3 className="font-semibold">Pay Bills</h3>
                    <p className="text-sm text-muted-foreground">Pay utilities & more</p>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-muted">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || transaction.type}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatDate(transaction.createdAt)}</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(transaction.status)}
                              <span className="capitalize">{transaction.status.toLowerCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT' 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }`}>
                          {transaction.type === 'SEND' || transaction.type === 'BILL_PAYMENT' ? '-' : '+'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Spending Analytics</CardTitle>
                <CardDescription>Track your financial patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budgets">
            <BudgetManagement 
              userId="cmfurffxs0000svlv7ls9z6vf"
              onBudgetUpdate={handleTransferComplete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}