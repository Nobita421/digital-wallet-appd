'use client'

import { DashboardSidebar } from './dashboard-sidebar'
import { MobileNav } from './mobile-nav'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <DashboardSidebar className="hidden md:flex fixed left-0 top-0" />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 border-b border-white/10 glass sticky top-0 z-50">
                <MobileNav />
                <h1 className="ml-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Digital Wallet
                </h1>
            </div>

            <main className="md:pl-64 min-h-screen transition-all duration-300">
                <div className="container mx-auto p-6 md:p-8 max-w-7xl space-y-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
