"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Layout, Shield, Zap, Sparkles, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export default function LandingPage() {
    const { user } = useAuth()

    return (
        <div className="flex flex-col min-h-screen text-black bg-white selection:bg-primary selection:text-black">
            {/* High-End Background Grid */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            
            {/* Hero Section */}
            <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 z-10">
                {/* Dynamic Floating Elements */}
                <div className="absolute top-40 left-10 w-24 h-24 bg-primary border-4 border-black rotate-12 -z-10 animate-bounce hidden lg:block"></div>
                <div className="absolute top-60 right-20 w-16 h-16 bg-secondary border-4 border-black -rotate-12 -z-10 animate-pulse hidden lg:block"></div>
                <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-accent/20 border-4 border-black/10 rounded-full -z-10 hidden lg:block"></div>

                {/* Badge */}
                <div className="mb-10 inline-flex items-center gap-4 px-8 py-3 bg-white border-4 border-black shadow-hard transform -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default">
                    <Sparkles className="h-5 w-5 text-primary fill-primary animate-spin-slow" />
                    <span className="text-sm font-black text-black tracking-[0.3em] uppercase">
                        {user ? `System Active: ${user.name?.split(' ')[0]}` : '2026 Career Intelligence'}
                    </span>
                </div>

                {/* Main Headline */}
                <div className="relative mb-12">
                    <h1 className="max-w-5xl mx-auto text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter text-black leading-[0.85] uppercase">
                        Bridge the <span className="relative inline-block">
                            Gap
                            <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary -z-10"></div>
                        </span> between <br className="hidden md:block" />
                        Skills & <span className="bg-black text-white px-6 border-4 border-black shadow-hard-lg inline-block transform rotate-1 mt-4 md:mt-0">Success</span>
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="max-w-3xl mx-auto text-xl md:text-2xl font-black uppercase tracking-widest text-black/90 leading-relaxed mb-16 bg-white/50 backdrop-blur-sm p-4 border-x-4 border-black">
                    Stop guessing. Use AI to analyze your profile and generate a <strong className="text-black bg-accent px-2 border-2 border-black">mission-critical 60-day roadmap</strong> to land your dream role.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                    {user ? (
                        <Link href="/dashboard" className="w-full sm:w-auto group">
                            <button className="w-full sm:w-auto px-12 py-6 bg-primary text-black border-4 border-black shadow-hard-lg rounded-none text-2xl font-black uppercase tracking-widest group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-none transition-all flex items-center justify-center gap-4">
                                Enter Command Center <LayoutDashboard className="h-8 w-8" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/auth/signup" className="w-full sm:w-auto group">
                            <button className="w-full sm:w-auto px-12 py-6 bg-primary text-black border-4 border-black shadow-hard-lg rounded-none text-2xl font-black uppercase tracking-widest group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-none transition-all flex items-center justify-center gap-4">
                                Initialize Career <ArrowRight className="h-8 w-8" />
                            </button>
                        </Link>
                    )}
                    <Link href={user ? "/dashboard/profile" : "/how-it-works"} className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-12 py-6 bg-white border-4 border-black text-black rounded-none text-2xl font-black uppercase tracking-widest shadow-hard hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center">
                            {user ? 'Personnel File' : 'System Overview'}
                        </button>
                    </Link>
                </div>

                {/* Trusted By / Stats */}
                <div className="mt-32 w-full max-w-5xl mx-auto py-12 border-y-4 border-black/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: "Active Roadmaps", val: "12K+" },
                            { label: "Skills Indexed", val: "500K+" },
                            { label: "Success Rate", val: "94%" },
                            { label: "AI Models", val: "04" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-4xl font-black font-mono leading-none">{stat.val}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-40">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Mockup Section: Accurate to new UI */}
            <section className="relative w-full pb-32 px-4 flex justify-center z-10 -mt-20">
                <div className="w-full max-w-6xl relative group perspective-1000">
                    <div className="relative border-8 border-black bg-white shadow-hard-xl overflow-hidden transform group-hover:rotate-x-1 transition-transform duration-700">
                        {/* Browser Chrome */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b-8 border-black bg-zinc-900 text-white">
                            <div className="flex gap-3">
                                <div className="h-4 w-4 bg-red-500 border-2 border-black rounded-full" />
                                <div className="h-4 w-4 bg-yellow-500 border-2 border-black rounded-full" />
                                <div className="h-4 w-4 bg-green-500 border-2 border-black rounded-full" />
                            </div>
                            <div className="flex-1 max-w-md mx-auto text-[13px] font-black uppercase tracking-widest text-zinc-400 border-2 border-white/10 bg-white/5 px-6 py-2 rounded-none text-center">
                                SECURE_CONNECTION://GAPSENSE.AI/DASHBOARD
                            </div>
                        </div>

                        {/* Mockup Body: Mirrors actual Dashboard */}
                        <div className="flex h-[400px] md:h-[650px] w-full bg-zinc-50 p-8 gap-8 overflow-hidden relative">
                            {/* Dashboard Sidebar */}
                            <div className="hidden md:flex w-72 flex-col gap-6">
                                <div className="h-[300px] bg-zinc-900 border-4 border-black shadow-hard-sm relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-4 h-8 w-32 bg-white border-2 border-black"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-14 w-full bg-white border-4 border-black shadow-hard flex items-center justify-between px-4">
                                        <div className="h-3 w-24 bg-black/10"></div>
                                        <div className="h-4 w-4 border-2 border-black"></div>
                                    </div>
                                    <div className="h-14 w-full bg-white border-4 border-black shadow-hard flex items-center justify-between px-4">
                                        <div className="h-3 w-32 bg-black/10"></div>
                                        <div className="h-4 w-4 border-2 border-black"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Pane */}
                            <div className="flex-1 flex flex-col gap-8">
                                <div className="flex justify-between items-end border-b-4 border-black pb-8">
                                    <div className="h-12 w-80 bg-black"></div>
                                    <div className="flex gap-8">
                                        <div className="h-16 w-24 bg-primary border-4 border-black shadow-hard"></div>
                                        <div className="h-16 w-24 bg-secondary border-4 border-black shadow-hard"></div>
                                    </div>
                                </div>
                                {/* Metrics Cards */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="h-56 bg-white border-4 border-black shadow-hard-lg p-8 flex flex-col justify-between group-hover:bg-primary transition-colors">
                                        <div className="h-6 w-32 bg-black"></div>
                                        <div className="h-24 w-full bg-black/5 border-2 border-black flex items-end p-2 gap-2">
                                            <div className="flex-1 bg-black h-1/2"></div>
                                            <div className="flex-1 bg-black h-3/4"></div>
                                            <div className="flex-1 bg-black h-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-56 bg-white border-4 border-black shadow-hard-lg p-8 flex flex-col justify-between">
                                        <div className="h-6 w-32 bg-secondary border-2 border-black"></div>
                                        <div className="relative h-24 w-24 mx-auto border-8 border-black rounded-full flex items-center justify-center">
                                            <div className="h-8 w-8 bg-black"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section: Ultra Bold */}
            <section className="w-full py-24 md:py-40 bg-zinc-900 text-white relative">
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)', backgroundSize: '100px 100px' }}></div>
                <div className="container relative z-10 px-4 md:px-6">
                    <div className="text-center mb-32">
                        <h2 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-none mb-10">
                            The Career <br /> <span className="text-primary underline decoration-8">Stack</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl font-black uppercase tracking-[0.2em] text-white/60">
                            A heavy-duty suite of AI tools built to bridge your skill gap with surgical precision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {[
                            { title: "Target Intel", desc: "AI decompiles job descriptions into precise technical data points.", icon: Shield, color: "bg-primary" },
                            { title: "Readiness Meter", desc: "Proprietary scoring system to quantify your market fit in real-time.", icon: BarChart3, color: "bg-secondary" },
                            { title: "Tactical Roadmap", desc: "A high-precision learning plan tailored to your specific deficiencies.", icon: Layout, color: "bg-accent" },
                            { title: "AI Personnel", desc: "Interactive coaching agents for deep-level technical mastery.", icon: Zap, color: "bg-white" },
                            { title: "Repo Analysis", desc: "Deep-learning review of your codebases to verify skill density.", icon: Sparkles, color: "bg-primary" },
                            { title: "Execution Log", desc: "Track every milestone completed with detailed performance metrics.", icon: CheckCircle2, color: "bg-secondary" },
                        ].map((feat, i) => (
                            <div key={i} className="bg-zinc-800 p-12 border-4 border-white/10 hover:border-primary hover:bg-zinc-800/80 transition-all group relative overflow-hidden">
                                <div className={cn("h-20 w-20 border-4 border-black flex items-center justify-center shadow-hard mb-8 transition-transform group-hover:scale-110 group-hover:-rotate-6", feat.color)}>
                                    <feat.icon className="h-10 w-10 text-black" />
                                </div>
                                <h3 className="text-3xl font-black uppercase text-white mb-6 tracking-tight">{feat.title}</h3>
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs leading-relaxed group-hover:text-white transition-colors">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Call Section */}
            <section className="w-full py-40 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent -skew-x-12 translate-x-20"></div>
                <div className="container relative z-10 px-4 md:px-6">
                    <div className="bg-white border-8 border-black p-16 md:p-24 text-center max-w-6xl mx-auto shadow-hard-xl">
                        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-black mb-12 leading-none">
                            Ready to <br /> <span className="bg-secondary px-6 py-2 border-4 border-black shadow-hard inline-block transform rotate-2">Accelerate?</span>
                        </h2>
                        <div className="flex flex-col items-center gap-10">
                            <p className="max-w-2xl text-xl font-black uppercase tracking-widest text-black/60">
                                Join the elite tier of developers using GapSense AI to strategically automate their career progression.
                            </p>
                            <Link href="/auth/signup">
                                <button className="px-16 py-8 bg-black text-white border-4 border-black shadow-hard-lg text-3xl font-black uppercase tracking-widest hover:translate-x-3 hover:translate-y-3 hover:shadow-none transition-all active:scale-95">
                                    Get Roadmap // NOW
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-12 border-t-8 border-black bg-white flex flex-col items-center justify-center gap-8 px-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-black border-4 border-black flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-black uppercase tracking-tighter">GapSense AI</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">© 2026 Advanced Career Logic // Built for the next 1%</p>
            </footer>
        </div>
    )
}
