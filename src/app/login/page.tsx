"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Wallet, ArrowRight, Loader2, Mail, Lock, Sparkles, Shield, Zap, CreditCard } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await login({ email, password })
            toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
            })
            router.push('/')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login failed",
                description: error.message || "Please check your credentials and try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl" />
                    
                    {/* Floating Shapes */}
                    <div className="absolute top-32 right-20 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-100" />
                    <div className="absolute top-48 left-32 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-300" />
                    <div className="absolute bottom-40 left-20 w-5 h-5 bg-white/25 rounded-full animate-bounce delay-500" />
                    <div className="absolute bottom-60 right-32 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-700" />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">DigiWallet</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Welcome back to
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">
                                your finances
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-white/80 max-w-md">
                            Securely access your digital wallet and manage all your transactions in one place.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <Shield className="w-8 h-8 text-emerald-300 mb-2" />
                            <h3 className="font-semibold text-white">Bank-Level Security</h3>
                            <p className="text-sm text-white/70">256-bit encryption</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <Zap className="w-8 h-8 text-yellow-300 mb-2" />
                            <h3 className="font-semibold text-white">Instant Transfers</h3>
                            <p className="text-sm text-white/70">Send money in seconds</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="relative z-10 flex items-center gap-8">
                    <div>
                        <div className="text-3xl font-bold text-white">50K+</div>
                        <div className="text-sm text-white/70">Active Users</div>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div>
                        <div className="text-3xl font-bold text-white">$2M+</div>
                        <div className="text-sm text-white/70">Transactions</div>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div>
                        <div className="text-3xl font-bold text-white">99.9%</div>
                        <div className="text-sm text-white/70">Uptime</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">DigiWallet</h1>
                    </div>

                    {/* Form Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white">Sign in</h2>
                        <p className="mt-2 text-gray-400">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {/* Login Form */}
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
                                    autoComplete="email"
                                    className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-300">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-900 text-gray-500">New to DigiWallet?</span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center w-full h-14 border-2 border-gray-700 hover:border-violet-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Create an Account
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
