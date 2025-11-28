'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Wallet,
    Settings,
    LogOut,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardSidebarProps {
    className?: string
    onNavigate?: () => void
}

export function DashboardSidebar({ className = "", onNavigate }: DashboardSidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: CreditCard },
        { href: '/analytics', label: 'Analytics', icon: PieChart },
        { href: '/budgets', label: 'Budgets', icon: Wallet },
        { href: '/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className={`flex flex-col w-64 h-screen glass border-r border-white/10 ${className}`}>
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Digital Wallet
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link key={item.href} href={item.href} onClick={onNavigate}>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 transition-all duration-300 ${isActive
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
