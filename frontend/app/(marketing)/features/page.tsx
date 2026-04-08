import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Layout, Shield, Zap, Search, Globe, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative w-full py-20 overflow-hidden">
                <div className="absolute inset-0 bg-orbit-gradient pointer-events-none opacity-50" />
                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <Badge variant="secondary" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm rounded-full">
                        Powerful Capabilities
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-heading mb-6">
                        Tools to <span className="text-primary glow-text">Supercharge</span> Your Career
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed mb-8">
                        From resume analysis to personalized learning paths, GapSense AI provides everything you need to bridge the gap to your dream role.
                    </p>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="container px-4 md:px-6 py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: "Resume Parser",
                            desc: "Uses NLP to extract skills, experience, and keywords from your resume with high precision.",
                            icon: Code,
                            color: "text-blue-400"
                        },
                        {
                            title: "Gap Analysis Engine",
                            desc: "Compares your profile against millions of job descriptions to find critical missing skills.",
                            icon: Search,
                            color: "text-cyan-400"
                        },
                        {
                            title: "Dynamic Roadmap",
                            desc: "Generates a week-by-week study plan tailored to your specific schedule and learning style.",
                            icon: Layout,
                            color: "text-purple-400"
                        },
                        {
                            title: "Readiness Scorer",
                            desc: "Quantifies your job fit with a score from 0-100, updated in real-time as you learn.",
                            icon: BarChart3,
                            color: "text-green-400"
                        },
                        {
                            title: "AI Project Mentor",
                            desc: "Suggests portfolio projects and provides code reviews and architectural guidance.",
                            icon: Zap,
                            color: "text-yellow-400"
                        },
                        {
                            title: "Market Insights",
                            desc: "Real-time data on salary trends, demand for specific skills, and hiring velocity.",
                            icon: Globe,
                            color: "text-pink-400"
                        }
                    ].map((feature, i) => (
                        <Card key={i} className="group hover:border-primary/50 transition-colors duration-300 bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <feature.icon className={`h-10 w-10 mb-2 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-muted-foreground">{feature.desc}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="w-full py-20 relative overflow-hidden mt-12">
                <div className="absolute inset-0 bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="container relative z-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white font-heading mb-4">Start your journey today</h2>
                    <Link href="/auth/signup">
                        <Button variant="glow" size="lg" className="h-12 px-8">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
