"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            {/* Header */}
            <header className="border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">DigiWallet</span>
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="glass border-white/10 text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                
                <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
                    <p className="text-lg text-gray-400">
                        Last updated: November 2025
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using DigiWallet's services, you agree to be bound by these Terms of Service. 
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">2. Description of Services</h2>
                        <p>
                            DigiWallet provides digital wallet services including but not limited to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Money transfers between users</li>
                            <li>Bill payments</li>
                            <li>Budget management tools</li>
                            <li>Transaction history and analytics</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">3. Account Registration</h2>
                        <p>
                            To use our services, you must create an account with accurate and complete information. 
                            You are responsible for maintaining the confidentiality of your account credentials.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">4. User Responsibilities</h2>
                        <p>
                            You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate information</li>
                            <li>Keep your account secure</li>
                            <li>Not use the service for illegal activities</li>
                            <li>Comply with all applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">5. Transaction Policies</h2>
                        <p>
                            All transactions are subject to our verification processes. We reserve the right to 
                            delay or refuse any transaction that appears suspicious or violates our policies.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">6. Privacy</h2>
                        <p>
                            Your privacy is important to us. Please review our{' '}
                            <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
                            {' '}to understand how we collect, use, and protect your information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">7. Limitation of Liability</h2>
                        <p>
                            DigiWallet shall not be liable for any indirect, incidental, special, consequential, 
                            or punitive damages resulting from your use of or inability to use the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">8. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. We will notify users of any 
                            material changes via email or through the application.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">9. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at support@digiwallet.com.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-12">
                <div className="container mx-auto px-6 py-8 text-center text-gray-500">
                    <p>&copy; 2025 DigiWallet. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
