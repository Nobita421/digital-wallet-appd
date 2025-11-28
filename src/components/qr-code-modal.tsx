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
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Copy, Download, Share2, Clock } from 'lucide-react'
import { toast } from "sonner"

interface QRCodeModalProps {
  userId: string
  trigger?: React.ReactNode
}

export default function QRCodeModal({ userId, trigger }: QRCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<'form' | 'generated'>('form')
  const [qrCode, setQRCode] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [purpose, setPurpose] = useState('payment')
  const [description, setDescription] = useState('')
  const [expiresIn, setExpiresIn] = useState('24')

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const expiresAt = expiresIn === 'never' ? null : new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000)

      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: amount || null,
          currency,
          purpose,
          description: description || null,
          expiresAt
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQRCode(data)
        setStep('generated')
        toast.success('QR code generated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode.code)
      toast.success('QR code copied to clipboard!')
    }
  }

  const downloadQRCode = () => {
    if (qrCode) {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `qrcode-${qrCode.code}.png`
        link.href = url
        link.click()
      }
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

  const getExpiryTime = (hours: string) => {
    if (hours === 'never') return 'Never'
    const h = parseInt(hours)
    if (h === 1) return '1 hour'
    if (h < 24) return `${h} hours`
    if (h === 24) return '1 day'
    if (h === 168) return '1 week'
    return `${Math.floor(h / 24)} days`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate QR Code</DialogTitle>
          <DialogDescription>
            {step === 'form' ? 'Create a QR code for payments or transfers' : 'Your QR code is ready'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="request">Request Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
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
                placeholder="What's this QR code for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expires In</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="24">1 day</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                  <SelectItem value="720">1 month</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </div>
        )}

        {step === 'generated' && qrCode && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">QR Code Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Purpose:</span>
                  <Badge variant="outline" className="capitalize">
                    {qrCode.purpose}
                  </Badge>
                </div>
                {qrCode.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(qrCode.amount.toString())}
                    </span>
                  </div>
                )}
                {qrCode.expiresAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expires:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(qrCode.expiresAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center py-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={qrCode.code}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'QR Code',
                    text: qrCode.description || 'Scan this QR code',
                    url: qrCode.code
                  })
                } else {
                  copyToClipboard()
                }
              }} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setStep('form')
                setQRCode(null)
                setAmount('')
                setDescription('')
              }}
              className="w-full"
            >
              Generate Another
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}