"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Search, User, Mail } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface TransferModalProps {
  currentUser: User
  onTransferComplete?: () => void
  trigger?: React.ReactNode
}

export default function TransferModal({ currentUser, onTransferComplete, trigger }: TransferModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'search' | 'confirm'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: 'cmfurffxs0000svlv7ls9z6vf',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    {
      id: 'user_2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    {
      id: 'user_3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com'
    }
  ]

  const filteredUsers = mockUsers.filter(user => 
    user.id !== currentUser.id &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setStep('confirm')
  }

  const handleTransfer = async () => {
    if (!selectedUser || !amount) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          amount: parseFloat(amount),
          currency,
          description
        })
      })

      if (response.ok) {
        // Reset form and close modal
        setAmount('')
        setDescription('')
        setSelectedUser(null)
        setStep('search')
        setIsOpen(false)
        onTransferComplete?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Transfer failed')
      }
    } catch (error) {
      console.error('Error processing transfer:', error)
      alert('Transfer failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(num)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Money
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            {step === 'search' ? 'Search for a user to send money to' : 'Confirm transfer details'}
          </DialogDescription>
        </DialogHeader>

        {step === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Card 
                    key={user.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUserSelect(user)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="outline">Select</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'confirm' && selectedUser && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recipient</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
              />
              {amount && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(amount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('search')}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button 
                onClick={handleTransfer}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Send ${formatCurrency(amount)}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}