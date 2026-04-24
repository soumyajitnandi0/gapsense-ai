"use client"

import { Header } from "@/components/layout/Header"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null // Avoid flashing content before redirect
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Header />
            <main className="pt-36 min-h-screen transition-all duration-300 relative z-10 w-full px-8 mx-auto max-w-[none]">
                {children}
            </main>
        </div>
    )
}
