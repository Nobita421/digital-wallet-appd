"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { CreditCard, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Bill {
  id: string
  name: string
  amount: number
  currency: string
  dueDate: string
  category: string
  status: string
  description?: string
  isRecurring: boolean
}

interface BillPaymentModalProps {
  userId: string
  trigger?: React.ReactNode
  onPaymentComplete?: () => void
}

export default function BillPaymentModal({ userId, trigger, onPaymentComplete }: BillPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'list' | 'create' | 'pay'>('list')
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  
  // Form state for creating new bill
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    dueDate: new Date(),
    category: 'UTILITIES',
    description: '',
    isRecurring: false
  })

  useEffect(() => {
    if (isOpen) {
      fetchBills()
    }
  }, [isOpen])

  const fetchBills = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bills?userId=${userId}`)
      const data = await response.json()
      setBills(data.bills || [])
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBill = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData,
          dueDate: formData.dueDate.toISOString()
        })
      })

      if (response.ok) {
        // Reset form and refresh bills
        setFormData({
          name: '',
          amount: '',
          currency: 'USD',
          dueDate: new Date(),
          category: 'UTILITIES',
          description: '',
          isRecurring: false
        })
        setStep('list')
        await fetchBills()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create bill')
      }
    } catch (error) {
      console.error('Error creating bill:', error)
      alert('Failed to create bill. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayBill = async () => {
    if (!selectedBill) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/bills/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billId: selectedBill.id,
          userId
        })
      })

      if (response.ok) {
        setSelectedBill(null)
        setStep('list')
        await fetchBills()
        onPaymentComplete?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to pay bill')
      }
    } catch (error) {
      console.error('Error paying bill:', error)
      alert('Failed to pay bill. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Bills
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bill Management</DialogTitle>
          <DialogDescription>
            {step === 'list' && 'Manage and pay your bills'}
            {step === 'create' && 'Add a new bill'}
            {step === 'pay' && 'Confirm bill payment'}
          </DialogDescription>
        </DialogHeader>

        {step === 'list' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Bills</h3>
              <Button onClick={() => setStep('create')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Bill
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bills.length > 0 ? (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <Card key={bill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{bill.name}</h4>
                            {getStatusBadge(bill.status)}
                            {isOverdue(bill.dueDate) && bill.status !== 'PAID' && (
                              <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {bill.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-semibold">
                              {formatCurrency(bill.amount, bill.currency)}
                            </span>
                            <span>Due: {formatDate(bill.dueDate)}</span>
                            <Badge variant="outline" className="capitalize">
                              {bill.category.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {bill.status !== 'PAID' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedBill(bill)
                                setStep('pay')
                              }}
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4" />
                <p>No bills found</p>
                <Button 
                  onClick={() => setStep('create')} 
                  variant="outline" 
                  className="mt-4"
                >
                  Add Your First Bill
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input
                id="name"
                placeholder="Electricity Bill"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
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
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="GROCERIES">Groceries</SelectItem>
                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                  <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => date && setFormData({...formData, dueDate: date})}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Monthly electricity bill"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('list')}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBill}
                disabled={!formData.name || !formData.amount || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Creating...' : 'Create Bill'}
              </Button>
            </div>
          </div>
        )}

        {step === 'pay' && selectedBill && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bill:</span>
                  <span className="text-sm font-semibold">{selectedBill.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(selectedBill.amount, selectedBill.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Due Date:</span>
                  <span className="text-sm">{formatDate(selectedBill.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedBill.category.toLowerCase()}
                  </Badge>
                </div>
                {isOverdue(selectedBill.dueDate) && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">This bill is overdue</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedBill(null)
                  setStep('list')
                }}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button 
                onClick={handlePayBill}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(selectedBill.amount, selectedBill.currency)}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}