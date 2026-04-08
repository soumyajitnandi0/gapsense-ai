import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Layout, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-orbit-gradient pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

                {/* Abstract Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

                <div className="container relative z-10 px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-8 text-center">

                        {/* Pill Badge */}
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_15px_-3px_rgba(62,156,255,0.3)]">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Now in Early Access
                        </Badge>

                        {/* Typography */}
                        <div className="space-y-6 max-w-5xl">
                            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl font-heading leading-[1.1]">
                                <span className="block text-white drop-shadow-2xl">Master Your Career</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-primary animate-gradient-x pb-2">
                                    Readiness with AI
                                </span>
                            </h1>
                            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed">
                                Analyze your resume, identify skill gaps, and follow a <span className="text-white font-medium">personalized 60-day roadmap</span> to land your dream role.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-4">
                            <Link href="/auth/signup">
                                <Button variant="glow" size="lg" className="h-14 px-10 text-lg w-full sm:w-auto shadow-[0_0_30px_-5px_hsl(var(--primary))] hover:shadow-[0_0_50px_-5px_hsl(var(--primary))] transition-all duration-300 transform hover:scale-105">
                                    Get Started for Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/how-it-works">
                                <Button variant="outline" size="lg" className="h-14 px-10 text-lg w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all duration-300">
                                    See How It Works
                                </Button>
                            </Link>
                        </div>

                        {/* Trusted By */}
                        <div className="pt-10 pb-6 w-full max-w-4xl mx-auto opacity-70">
                            <p className="text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">Trusted by future engineers at</p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-50 hover:opacity-100 transition-opacity duration-300">
                                {['Google', 'Netflix', 'Amazon', 'Meta', 'Stripe'].map((brand) => (
                                    <span key={brand} className="text-lg md:text-xl font-bold font-heading text-white/40">{brand}</span>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Mockup - Window Chrome Style */}
                        <div className="mt-12 w-full max-w-6xl relative group">
                            {/* Glow behind the mockup */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                            <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl overflow-hidden transform group-hover:scale-[1.01] transition-transform duration-500 timeline-container">
                                {/* Window Header */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="mx-auto text-xs font-mono text-muted-foreground/50">dashboard.gapsense.ai</div>
                                </div>

                                {/* MOCKUP CONTENT */}
                                <div className="flex h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden">
                                    {/* Sidebar Wireframe */}
                                    <div className="hidden md:flex w-64 border-r border-white/10 bg-white/[0.02] p-4 flex-col gap-4">
                                        <div className="h-8 w-32 bg-white/10 rounded-md animate-pulse" />
                                        <div className="space-y-2 pt-4">
                                            <div className="h-8 w-full bg-primary/20 rounded-md border border-primary/20" />
                                            <div className="h-8 w-full bg-transparent rounded-md" />
                                            <div className="h-8 w-full bg-transparent rounded-md" />
                                            <div className="h-8 w-full bg-transparent rounded-md" />
                                        </div>
                                    </div>

                                    {/* Main Content Wireframe */}
                                    <div className="flex-1 p-4 md:p-8 space-y-6 overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <div className="h-8 w-48 bg-white/10 rounded-md" />
                                                <div className="h-4 w-64 bg-white/5 rounded-md" />
                                            </div>
                                            <div className="h-10 w-32 bg-primary/20 rounded-full" />
                                        </div>

                                        {/* Cards Grid Wireframe */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="h-32 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                                    <div className="h-4 w-4 bg-primary/50 rounded-full" />
                                                </div>
                                                <div className="h-10 w-16 bg-white/20 rounded" />
                                            </div>
                                            <div className="h-32 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                                    <div className="h-4 w-4 bg-purple-500/50 rounded-full" />
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full mt-6">
                                                    <div className="h-2 w-2/3 bg-purple-500 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="h-32 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                                    <div className="h-4 w-4 bg-yellow-500/50 rounded-full" />
                                                </div>
                                                <div className="h-10 w-24 bg-white/20 rounded" />
                                            </div>
                                        </div>

                                        {/* Chart Area Wireframe */}
                                        <div className="h-64 w-full rounded-xl border border-white/10 bg-white/5 p-6 flex items-end gap-4">
                                            <div className="w-full bg-primary/20 h-[40%] rounded-t-sm" />
                                            <div className="w-full bg-primary/30 h-[70%] rounded-t-sm" />
                                            <div className="w-full bg-primary/40 h-[50%] rounded-t-sm" />
                                            <div className="w-full bg-primary/60 h-[85%] rounded-t-sm" />
                                            <div className="w-full bg-primary/80 h-[60%] rounded-t-sm" />
                                            <div className="w-full bg-primary h-[90%] rounded-t-sm shadow-[0_0_15px_-3px_rgba(62,156,255,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-20 md:py-32 bg-black/50 relative">
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white font-heading">
                            Everything you need to <span className="text-primary">land the job</span>
                        </h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                            Comprehensive tools to bridge the gap between your current skills and your dream role.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Role Intelligence",
                                description: "AI analyzes job descriptions to extract critical skills and requirements.",
                                icon: Shield,
                                color: "text-blue-400"
                            },
                            {
                                title: "Readiness Score",
                                description: "Get a quantifiable score (0-100) representing your fit for the role.",
                                icon: BarChart3,
                                color: "text-cyan-400"
                            },
                            {
                                title: "Personalized Roadmap",
                                description: "A week-by-week learning plan tailored specifically to your missing skills.",
                                icon: Layout,
                                color: "text-purple-400"
                            },
                            {
                                title: "AI Career Coach",
                                description: "24/7 chat support to answer technical questions and mock interview prep.",
                                icon: Zap,
                                color: "text-yellow-400"
                            },
                            {
                                title: "Project Suggestions",
                                description: "Relevant project ideas to build your portfolio and demonstrate competency.",
                                icon: Layout,
                                color: "text-pink-400"
                            },
                            {
                                title: "Track Progress",
                                description: "Monitor your improvements and update your readiness score in real-time.",
                                icon: CheckCircle2,
                                color: "text-green-400"
                            },
                        ].map((feature, i) => (
                            <Card key={i} className="group hover:border-primary/50 transition-colors duration-300">
                                <CardHeader>
                                    <feature.icon className={`h-10 w-10 mb-2 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-20 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white font-heading">
                            Ready to accelerate your career?
                        </h2>
                        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                            Join thousands of students and professionals using GapSense AI to land their dream roles.
                        </p>
                        <Link href="/auth/signup">
                            <Button variant="glow" size="lg" className="h-14 px-10 text-lg">
                                Get Your Personalized Roadmap
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
