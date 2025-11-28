"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
    Wallet, ArrowRight, Loader2, User, Mail, Phone, Lock, 
    CheckCircle2, Globe, Smartphone, PiggyBank, TrendingUp
} from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const { register } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please ensure both passwords are the same.",
            })
            return
        }

        setIsLoading(true)

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            })
            toast({
                title: "Account created!",
                description: "You have successfully registered. Please log in.",
            })
            router.push('/login')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: error.message || "Please check your details and try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        { icon: Globe, title: "Global Transfers", desc: "Send money worldwide instantly" },
        { icon: Smartphone, title: "Mobile First", desc: "Manage finances on the go" },
        { icon: PiggyBank, title: "Smart Savings", desc: "Automated savings goals" },
        { icon: TrendingUp, title: "Investment Ready", desc: "Grow your wealth easily" },
    ]

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-black relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="w-full max-w-lg relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">DigiWallet</span>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                        </div>
                        <div className={`w-16 h-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                            2
                        </div>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            {step === 1 ? "Create your account" : "Secure your account"}
                        </h2>
                        <p className="text-gray-400">
                            {step === 1 ? "Start your financial journey today" : "Set up your password to continue"}
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 1 ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300 text-sm font-medium">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                autoComplete="name"
                                                minLength={3}
                                                maxLength={20}
                                                className="pl-12 h-14 bg-gray-900/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                autoComplete="email"
                                                className="pl-12 h-14 bg-gray-900/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-300 text-sm font-medium">
                                        Phone Number <span className="text-gray-600">(optional)</span>
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                autoComplete="tel"
                                                className="pl-12 h-14 bg-gray-900/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (formData.name && formData.email) {
                                            setStep(2)
                                        } else {
                                            toast({
                                                variant: "destructive",
                                                title: "Required fields",
                                                description: "Please fill in your name and email.",
                                            })
                                        }
                                    }}
                                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Create Password</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                autoComplete="new-password"
                                                minLength={6}
                                                className="pl-12 h-14 bg-gray-900/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">Confirm Password</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                autoComplete="new-password"
                                                minLength={6}
                                                className="pl-12 h-14 bg-gray-900/80 border-gray-800 text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        variant="outline"
                                        className="flex-1 h-14 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-[2] h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-between overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />
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
                            Start your
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
                                financial journey
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-white/80 max-w-md">
                            Join thousands of users who trust DigiWallet for their everyday transactions.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
                            >
                                <feature.icon className="w-8 h-8 text-white mb-2" />
                                <h3 className="font-semibold text-white">{feature.title}</h3>
                                <p className="text-sm text-white/70">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
                        <p className="text-white/90 italic mb-4">
                            "DigiWallet has completely transformed how I manage my money. The interface is intuitive and transfers are instant!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                S
                            </div>
                            <div>
                                <div className="font-semibold text-white">Sarah Johnson</div>
                                <div className="text-sm text-white/70">Small Business Owner</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
