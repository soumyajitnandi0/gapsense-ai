import Link from "next/link"
import { ArrowUpRight, BarChart3, CheckCircle2, Layout, Shield, Zap, Search, Globe, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/PremiumCard"

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-background">
            {/* Hero Section */}
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
                <div className="mb-6 px-4 py-1.5 bg-accent text-black border-4 border-black shadow-hard uppercase font-black tracking-widest text-xs flex items-center gap-2">
                    <span className="h-3 w-3 bg-black animate-pulse" />
                    Now in Early Access
                </div>
                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    Supercharge<br/><span className="bg-primary px-4 border-4 border-black shadow-hard inline-block mt-4">Your Career</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    From resume analysis to personalized learning paths, GapSense AI provides everything you need to bridge the gap to your dream role.
                </p>
                <div className="flex items-center gap-6">
                    <Link href="/auth/signup">
                        <Button className="bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none rounded-none px-8 h-16 text-lg font-black uppercase tracking-widest transition-all">
                            Get Started for Free
                            <ArrowUpRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                    <Link href="/how-it-works">
                        <Button variant="outline" className="bg-white text-black border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none rounded-none px-8 h-16 text-lg font-black uppercase tracking-widest transition-all">
                            See How It Works
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="w-full py-12 md:py-20 relative z-10 max-w-7xl mx-auto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: "Resume Parser",
                            desc: "Uses NLP to extract skills, experience, and keywords from your resume with high precision.",
                            icon: Code,
                        },
                        {
                            title: "Gap Analysis Engine",
                            desc: "Compares your profile against millions of job descriptions to find critical missing skills.",
                            icon: Search,
                        },
                        {
                            title: "Dynamic Roadmap",
                            desc: "Generates a week-by-week study plan tailored to your specific schedule and learning style.",
                            icon: Layout,
                        },
                        {
                            title: "Readiness Scorer",
                            desc: "Quantifies your job fit with a score from 0-100, updated in real-time as you learn.",
                            icon: BarChart3,
                        },
                        {
                            title: "AI Project Mentor",
                            desc: "Suggests portfolio projects and provides code reviews and architectural guidance.",
                            icon: Zap,
                        },
                        {
                            title: "Market Insights",
                            desc: "Real-time data on salary trends, demand for specific skills, and hiring velocity.",
                            icon: Globe,
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white border-4 border-black p-8 shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all flex flex-col gap-6 cursor-pointer group">
                            <div className="h-16 w-16 bg-accent border-4 border-black flex items-center justify-center shadow-hard group-hover:bg-primary transition-colors">
                                <feature.icon className="h-8 w-8 text-black" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase tracking-widest text-black">{feature.title}</h3>
                                <p className="text-[13px] font-black uppercase tracking-widest text-black/70 leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
