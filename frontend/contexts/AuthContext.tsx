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
        localStorage.removeItem('lastActivity')
        setUser(null)
        router.push('/auth/login')
    }

    const updateActivity = () => {
        localStorage.setItem('lastActivity', Date.now().toString())
    }

    const checkInactivity = () => {
        const lastActivity = localStorage.getItem('lastActivity')
        if (lastActivity) {
            const thirtyDays = 30 * 24 * 60 * 60 * 1000
            if (Date.now() - Number(lastActivity) > thirtyDays) {
                logout()
                return true
            }
        }
        updateActivity()
        return false
    }

    const fetchUser = async (token: string) => {
        try {
            // Check inactivity before fetching
            if (checkInactivity()) return

            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
                updateActivity() // Refresh activity on successful fetch
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('lastActivity')
                setUser(null)
            }
        } catch (error) {
            console.error("Failed to fetch user", error)
            localStorage.removeItem('token')
            setUser(null)
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

        // Add event listeners to update activity on user interaction
        const handleInteraction = () => updateActivity()
        window.addEventListener('mousedown', handleInteraction)
        window.addEventListener('keydown', handleInteraction)

        return () => {
            window.removeEventListener('mousedown', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
        }
    }, [])

    const login = (token: string) => {
        localStorage.setItem('token', token)
        updateActivity()
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
