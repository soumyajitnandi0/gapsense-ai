"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { API_BASE } from "@/lib/api"

export default function LoginPage() {
    const { login } = useAuth()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || data.errors?.[0]?.msg || 'Login failed')
                return
            }

            login(data.token)
            router.push('/dashboard')
        } catch {
            setError('Could not connect to server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full relative overflow-hidden bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
                {/* Left Content Section - High Impact */}
                <div className="hidden lg:flex flex-col justify-center px-12 md:px-24 bg-primary border-r-8 border-black relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 left-10 w-32 h-32 border-8 border-black opacity-20 transform rotate-12"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-8 border-black opacity-20 transform -rotate-12"></div>
                    
                    <div className="relative z-10 space-y-12">
                        <Link href="/" className="flex items-center justify-center h-20 w-20 bg-white border-4 border-black text-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
                            <Sparkles className="h-10 w-10 fill-current text-black" />
                        </Link>
                        
                        <h2 className="text-7xl font-black uppercase tracking-tighter text-black leading-none">
                            Level Up <br/> <span className="bg-white px-2 border-4 border-black shadow-hard">Your Career</span>
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                                "Personalized 60-Day Roadmap",
                                "AI-Powered Skill Gap Analysis",
                                "Real-time Readiness Scoring",
                                "24/7 AI Career Coaching"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white border-4 border-black p-4 shadow-hard transform hover:-translate-y-1 transition-transform">
                                    <div className="h-8 w-8 bg-accent border-2 border-black flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-black" />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-sm text-black">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-black font-black uppercase tracking-widest text-sm border-l-8 border-black pl-6 italic">
                            &ldquo;GapSense changed how I prepare for interviews. I knew exactly what I was missing and how to fix it.&rdquo;
                        </p>
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="flex items-center justify-center p-8 md:p-12">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo Branding */}
                        <div className="flex flex-col items-center lg:hidden mb-8 space-y-4">
                            <Link href="/" className="flex items-center justify-center h-16 w-16 bg-primary border-4 border-black text-black shadow-hard">
                                <Sparkles className="h-8 w-8 fill-current text-black" />
                            </Link>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-black text-center">
                                Welcome back
                            </h1>
                        </div>

                        <div className="hidden lg:block space-y-2 mb-8 text-center lg:text-left">
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-black">
                                Welcome back
                            </h1>
                            <p className="text-black/60 font-black uppercase tracking-widest text-xs">
                                Enter your credentials to access your dashboard.
                            </p>
                        </div>

                        {/* Neo-Brutalist Panel */}
                        <div className="relative group">
                            <Card className="relative border-4 border-black rounded-none bg-white shadow-hard p-8 md:p-10">
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="bg-red-400 border-4 border-black px-4 py-3 text-[14px] font-black uppercase text-black shadow-hard">
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-black">Email Address</label>
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-white border-4 border-black text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-primary h-14 rounded-none text-[15px] font-bold shadow-hard"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black uppercase tracking-widest text-black">Password</label>
                                            <Link href="#" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">Forgot?</Link>
                                        </div>
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-white border-4 border-black text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-primary h-14 rounded-none text-[15px] font-bold shadow-hard"
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none h-14 rounded-none text-[16px] font-black uppercase tracking-widest transition-all"
                                    >
                                        {loading ? "Signing in..." : "Sign in"}
                                    </Button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t-4 border-black"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-4 font-black text-black border-4 border-black">Or continue with</span>
                                        </div>
                                    </div>

                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        className="w-full bg-white text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none h-14 rounded-none text-[16px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                        onClick={() => window.location.href = `${API_BASE}/auth/google`}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                        Google
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        <p className="text-center text-[13px] font-black uppercase tracking-widest text-black">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="bg-primary px-1 border-2 border-black hover:bg-primary/80 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
