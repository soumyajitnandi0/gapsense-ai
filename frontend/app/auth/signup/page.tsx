"use client"

import Link from "next/link"
import { Sparkles, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const API_BASE = 'http://localhost:5000/api'

export default function SignupPage() {
    const { login } = useAuth()
    const router = useRouter()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || data.errors?.[0]?.msg || 'Registration failed')
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
        <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden bg-[#050707]">

            {/* Dynamic Background with Deep Space Feel */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Large slowly moving orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[150px] animate-pulse delay-700" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050707]/50 to-[#050707]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">

                {/* Logo Branding */}
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <Link href="/" className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20 text-primary border border-white/10 backdrop-blur-md shadow-[0_0_30px_-5px_hsl(var(--primary))] mb-4">
                        <Sparkles className="h-6 w-6 fill-current" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-heading text-center">
                        Create your account
                    </h1>
                    <p className="text-muted-foreground text-center max-w-xs">
                        Join thousands of engineers accelerating their career with AI.
                    </p>
                </div>

                {/* Glassmorphic Card */}
                <div className="relative group">
                    {/* Glow Effect behind card */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                    <Card className="relative border-white/10 bg-[#0a0a0a]/50 backdrop-blur-2xl p-8 shadow-2xl">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Input
                                    id="name"
                                    placeholder="Full Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 h-12 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 h-12 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 h-12 rounded-lg"
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="glow"
                                    disabled={loading}
                                    className="w-full h-12 text-base font-semibold shadow-[0_0_20px_-5px_hsl(var(--primary))] bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 border-0"
                                >
                                    {loading ? 'Signing up...' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a]/0 px-2 text-muted-foreground backdrop-blur-xl">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button 
                            variant="outline" 
                            type="button" 
                            className="w-full bg-white/5 border-white/10 hover:bg-white/10 h-12 text-white font-medium"
                            onClick={() => window.location.href = `${API_BASE}/auth/google`}
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path stopColor="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path stopColor="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path stopColor="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path stopColor="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></svg>
                            Sign in with Google
                        </Button>

                        <p className="px-8 text-center text-sm text-muted-foreground mt-8">
                            <Link
                                href="/auth/login"
                                className="hover:text-white transition-colors underline underline-offset-4"
                            >
                                Already have an account? Sign In
                            </Link>
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
