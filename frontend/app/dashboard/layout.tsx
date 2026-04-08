"use client"

import { Sidebar } from "@/components/layout/Sidebar"
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

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const savedState = localStorage.getItem('sidebarOpen')
        if (savedState !== null) {
            setIsSidebarOpen(savedState === 'true')
        }
    }, [])

    const toggleSidebar = () => {
        const newState = !isSidebarOpen
        setIsSidebarOpen(newState)
        localStorage.setItem('sidebarOpen', String(newState))
    }

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null // Avoid flashing content before redirect
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-orbit-gradient pointer-events-none fixed" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none fixed"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none fixed"></div>

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <Header isOpen={isSidebarOpen} />
            <main
                className={`pt-16 min-h-screen transition-all duration-300 relative z-10 ${isMounted && isSidebarOpen ? 'pl-64' : 'pl-[60px]'
                    }`}
            >
                <div className="p-4 md:p-6 lg:p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
