"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Wallet, Plus, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { toast } from "sonner"

interface Budget {
  id: string
  name: string
  amount: number
  currency: string
  category: string
  period: string
  spent: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface BudgetManagementProps {
  userId: string
  onBudgetUpdate?: () => void
}

export default function BudgetManagement({ userId, onBudgetUpdate }: BudgetManagementProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    category: '',
    period: 'MONTHLY',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  })

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      import('@/lib/api-client').then(async ({ apiClient }) => {
        const data: any = await apiClient.getBudgets()
        setBudgets(data.budgets || [])
      })
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async () => {
    setIsCreating(true)
    try {
      import('@/lib/api-client').then(async ({ apiClient }) => {
        await apiClient.createBudget({
          ...formData,
          amount: parseFloat(formData.amount),
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString()
        })

        // Reset form and refresh budgets
        setFormData({
          name: '',
          amount: '',
          currency: 'USD',
          category: '',
          period: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        setIsDialogOpen(false)
        await fetchBudgets()
        onBudgetUpdate?.()
      }).catch(error => {
        console.error('Error creating budget:', error)
        toast.error('Failed to create budget. Please try again.')
      })
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error('Failed to create budget. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const getProgressPercentage = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <Target className="h-4 w-4 text-green-500" />
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRemaining = (budget: Budget) => {
    return budget.amount - budget.spent
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Budget Management</h3>
          <p className="text-sm text-muted-foreground">Track your spending limits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set a spending limit for a specific category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  placeholder="Monthly Food Budget"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                    className="rounded-md border"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBudget}
                  disabled={!formData.name || !formData.amount || !formData.category || isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Budget'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => {
            const percentage = getProgressPercentage(budget.spent, budget.amount)
            const remaining = getRemaining(budget)
            const daysRemaining = getDaysRemaining(budget.endDate)

            return (
              <Card key={budget.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(percentage)}
                      <Badge variant="outline" className="capitalize">
                        {budget.period.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{budget.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: {formatCurrency(budget.spent, budget.currency)}</span>
                      <span>Budget: {formatCurrency(budget.amount, budget.currency)}</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span className={remaining < 0 ? 'text-red-500' : ''}>
                        {remaining >= 0 ? 'Remaining: ' : 'Over: '}
                        {formatCurrency(Math.abs(remaining), budget.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{formatDate(budget.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">{formatDate(budget.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      <span className={remaining < 0 ? 'text-red-500' : 'text-green-500'}>
                        {remaining >= 0 ? 'On track' : 'Over budget'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}