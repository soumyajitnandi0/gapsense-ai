"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState("Authenticating...")

    useEffect(() => {
        const token = searchParams.get("token")

        if (token) {
            // Store token in localStorage
            localStorage.setItem("token", token)
            setStatus("Authentication successful! Redirecting...")

            // Redirect to dashboard
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        } else {
            setStatus("Authentication failed. No token received.")
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        }
    }, [searchParams, router])

    return (
        <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-[#050707]">
            {/* Background effects similar to login page for consistency */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050707]/50 to-[#050707]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/20 text-primary border border-white/10 backdrop-blur-md shadow-[0_0_30px_-5px_hsl(var(--primary))] animate-bounce">
                        <Sparkles className="h-8 w-8 fill-current" />
                    </div>
                    <Card className="relative border-white/10 bg-[#0a0a0a]/50 backdrop-blur-2xl p-8 shadow-2xl w-full text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {status}
                        </h2>
                        <p className="text-muted-foreground">
                            Please wait while we complete the process.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
