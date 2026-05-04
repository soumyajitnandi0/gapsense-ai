"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()
    const [status, setStatus] = useState("Authenticating...")

    useEffect(() => {
        const token = searchParams.get("token")

        if (token) {
            login(token)
            setStatus("Authentication successful! Redirecting...")
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        } else {
            setStatus("Authentication failed. No token received.")
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        }
    }, [searchParams, router, login])

    return (
        <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-background">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-20" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="flex flex-col items-center space-y-8">
                    {/* Logo Section */}
                    <div className="flex items-center justify-center h-20 w-20 bg-primary border-4 border-black text-black shadow-hard animate-bounce">
                        <Sparkles className="h-10 w-10 fill-current" />
                    </div>

                    {/* Status Panel */}
                    <div className="relative border-4 border-black bg-white shadow-hard p-10 w-full text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-12 w-12 border-4 border-black bg-accent flex items-center justify-center shadow-hard animate-spin-slow">
                                <Loader2 className="h-6 w-6 text-black animate-spin" />
                            </div>
                            
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
                                    {status}
                                </h2>
                                <p className="text-black/60 font-black uppercase tracking-widest text-[10px] border-t-2 border-black/10 pt-4">
                                    Please wait while we complete the process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="h-16 w-16 border-4 border-black bg-primary flex items-center justify-center shadow-hard">
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    )
}
