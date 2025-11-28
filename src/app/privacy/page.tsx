"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                
                <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
                    <p className="text-lg text-gray-400">
                        Last updated: November 2025
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
                        <p>
                            At DigiWallet, we take your privacy seriously. This Privacy Policy explains how we 
                            collect, use, disclose, and safeguard your information when you use our digital wallet services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
                        <p>We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number</li>
                            <li><strong>Financial Information:</strong> Transaction history, wallet balance</li>
                            <li><strong>Device Information:</strong> IP address, browser type, device identifiers</li>
                            <li><strong>Usage Data:</strong> How you interact with our services</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related notifications</li>
                            <li>Detect and prevent fraud or unauthorized access</li>
                            <li>Communicate with you about products, services, and updates</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>256-bit SSL encryption for data transmission</li>
                            <li>Secure data storage with encryption at rest</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Two-factor authentication options</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">5. Information Sharing</h2>
                        <p>
                            We do not sell your personal information. We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>With your consent</li>
                            <li>To comply with legal requirements</li>
                            <li>To protect our rights and prevent fraud</li>
                            <li>With service providers who assist our operations</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">7. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                            and personalize content. You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">8. Children's Privacy</h2>
                        <p>
                            Our services are not intended for individuals under the age of 18. We do not knowingly 
                            collect personal information from children.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes 
                            by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-violet-400">privacy@digiwallet.com</p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-12">
                <div className="container mx-auto px-6 py-8 text-center text-gray-500">
                    <p>&copy; 2025 DigiWallet. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                        <Link href="/terms" className="text-violet-400 hover:underline">Terms of Service</Link>
                        <span>•</span>
                        <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
