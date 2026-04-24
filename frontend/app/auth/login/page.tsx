"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const API_BASE = 'http://localhost:5000/api'

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
        } catch (err) {
            setError('Could not connect to server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center relative overflow-hidden bg-[#FAF9F6] py-12">
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo Branding */}
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <Link href="/" className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-400 text-white shadow-md mb-4 hover:scale-105 transition-transform duration-300">
                        <Sparkles className="h-7 w-7 fill-current" />
                    </Link>
                    <h1 className="text-3xl font-medium tracking-tight text-[#111] font-heading text-center">
                        Welcome back
                    </h1>
                    <p className="text-[#2B2D2B]/60 text-center">
                        Enter your credentials to access your dashboard.
                    </p>
                </div>

                {/* Glassmorphic Panel */}
                <div className="relative group">
                    <Card className="relative border border-[#111]/5 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl bg-red-50/50 border border-red-200 px-4 py-3 text-[14px] font-medium text-red-600">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#111] ml-1">Email Address</label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-[#FAF9F6] border border-[#111]/5 text-[#111] placeholder:text-[#2B2D2B]/30 focus-visible:ring-amber-400/50 h-12 rounded-xl text-[15px] font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold text-[#111]">Password</label>
                                    <Link href="#" className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors">Forgot?</Link>
                                </div>
                                <Input
                                    id="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#FAF9F6] border border-[#111]/5 text-[#111] placeholder:text-[#2B2D2B]/30 focus-visible:ring-amber-400/50 h-12 rounded-xl text-[15px] font-medium"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-[15px] font-bold text-white bg-[#111] hover:bg-[#1a1a1a] transition-colors shadow-md disabled:opacity-50"
                                >
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </button>
                            </div>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#111]/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                                <span className="bg-white px-4 text-[#2B2D2B]/40">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full bg-white border border-[#111]/5 hover:bg-[#FAF9F6] h-12 rounded-xl text-[#111] text-[15px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-3"
                            onClick={() => window.location.href = `${API_BASE}/auth/google`}
                        >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path stopColor="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path stopColor="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path stopColor="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path stopColor="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></svg>
                            Google
                        </button>

                        <p className="text-center text-[14px] font-medium text-[#2B2D2B]/60 mt-8">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-amber-500 hover:text-amber-600 transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
