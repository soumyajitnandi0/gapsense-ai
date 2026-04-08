"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = 'http://localhost:5000/api'

interface User {
    id: string
    name: string
    email: string
    picture?: string
    authProvider: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        router.push('/auth/login')
    }

    const fetchUser = async (token: string) => {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                // Backend returns { user: { id, name, email, picture, authProvider, ... } }
                setUser(data.user)
            } else {
                logout()
            }
        } catch (error) {
            console.error("Failed to fetch user", error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchUser(token)
        } else {
            setLoading(false)
        }
    }, [])

    const login = (token: string) => {
        localStorage.setItem('token', token)
        fetchUser(token)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
