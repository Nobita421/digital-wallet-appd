'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    roles: string[]
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (credentials: any) => Promise<void>
    register: (userData: any) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Load token from local storage on mount
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            apiClient.setToken(storedToken)
        }
    }, [])

    const login = async (credentials: any) => {
        try {
            const response: any = await apiClient.login(credentials)
            const { token, ...userData } = response

            setToken(token)
            setUser(userData)
            apiClient.setToken(token)

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))

            router.push('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const register = async (userData: any) => {
        try {
            await apiClient.register(userData)
            // Optionally login automatically or redirect to login
            router.push('/login')
        } catch (error: any) {
            console.error('Registration failed:', error)
            // Re-throw with better message for the UI
            throw new Error(error.message || 'Registration failed. Please try again.')
        }
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        apiClient.clearToken()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
