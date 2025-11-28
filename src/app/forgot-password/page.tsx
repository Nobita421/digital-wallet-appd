"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Wallet, ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setIsLoading(false)
        setIsSubmitted(true)
        
        toast({
            title: "Reset link sent",
            description: "Check your email for password reset instructions.",
        })
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">DigiWallet</h1>
                </div>

                {!isSubmitted ? (
                    <>
                        {/* Form Header */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white">Forgot Password?</h2>
                            <p className="mt-2 text-gray-400">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>

                        {/* Reset Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    /* Success State */
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Check your email</h2>
                            <p className="mt-2 text-gray-400">
                                We sent a password reset link to<br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Didn't receive the email?{' '}
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-violet-400 hover:underline"
                            >
                                Click to resend
                            </button>
                        </p>
                    </div>
                )}

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}
