import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Layout, Shield, Zap, Sparkles } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen text-black bg-background">
            {/* Hero Section */}
            <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
                
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 px-6 py-2 bg-accent border-4 border-black shadow-hard">
                    <span className="h-3 w-3 rounded-none bg-black animate-pulse"></span>
                    <span className="text-sm font-black text-black tracking-widest uppercase">Early Access</span>
                </div>

                {/* Main Headline */}
                <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter text-black leading-none mb-8 uppercase">
                    Master Your Career Readiness with <span className="bg-primary px-4 border-4 border-black shadow-hard text-black inline-block mt-4 md:mt-0">AI</span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl mx-auto text-xl font-black uppercase tracking-widest text-black/80 leading-relaxed mb-12">
                    Analyze your resume, identify skill gaps, and follow a <strong className="text-black bg-secondary px-1 border-2 border-black">personalized 60-day roadmap</strong> to land your dream role today.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                    <Link href="/auth/signup" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-10 py-5 bg-primary text-black border-4 border-black shadow-hard rounded-none text-xl font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                            Get Started Free <ArrowRight className="h-6 w-6" />
                        </button>
                    </Link>
                    <Link href="/how-it-works" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-10 py-5 bg-white border-4 border-black text-black rounded-none text-xl font-black uppercase tracking-widest shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center">
                            See How It Works
                        </button>
                    </Link>
                </div>

                {/* Trusted By */}
                <div className="mt-24 w-full max-w-4xl mx-auto animate-in fade-in duration-1000 delay-700">
                    <p className="text-[13px] text-[#2B2D2B]/40 font-semibold uppercase tracking-widest mb-8">Trusted by future engineers at</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 contrast-125 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Google', 'Netflix', 'Amazon', 'Meta', 'Stripe'].map((brand) => (
                            <span key={brand} className="text-xl md:text-2xl font-bold font-heading text-[#111] tracking-tight">{brand}</span>
                        ))}
                    </div>
                </div>

            </section>

            {/* Dashboard Mockup Section */}
            <section className="relative w-full pb-32 px-4 flex justify-center z-10 -mt-10">
                <div className="w-full max-w-6xl relative group">
                    <div className="relative border-8 border-black bg-white shadow-hard-lg overflow-hidden">
                        {/* Browser Chrome */}
                        <div className="flex items-center gap-2 px-6 py-4 border-b-8 border-black bg-accent">
                            <div className="flex gap-2">
                                <div className="h-4 w-4 bg-white border-2 border-black" />
                                <div className="h-4 w-4 bg-white border-2 border-black" />
                                <div className="h-4 w-4 bg-white border-2 border-black" />
                            </div>
                            <div className="mx-auto text-[13px] font-black uppercase tracking-widest text-black border-2 border-black bg-white px-4 py-1 shadow-hard">gapsense.ai</div>
                        </div>

                        {/* Mockup Body */}
                        <div className="flex h-[350px] md:h-[600px] w-full bg-background p-6 lg:p-10 gap-8 overflow-hidden relative">
                            {/* Dashboard Sidebar */}
                            <div className="hidden md:flex w-64 bg-white border-4 border-black p-6 flex-col gap-6 shadow-hard">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center shadow-hard">
                                       <Sparkles className="text-black h-6 w-6" /> 
                                    </div>
                                    <div className="h-4 w-24 bg-black border-2 border-black"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-12 w-full bg-accent border-4 border-black shadow-hard"></div>
                                    <div className="h-10 w-full border-4 border-black bg-white"></div>
                                    <div className="h-10 w-full border-4 border-black bg-white"></div>
                                </div>
                            </div>

                            {/* Main Content Pane */}
                            <div className="flex-1 flex flex-col gap-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="space-y-3">
                                        <div className="h-8 w-64 bg-black"></div>
                                        <div className="h-4 w-40 bg-black/40"></div>
                                    </div>
                                    <div className="h-12 w-32 bg-white border-4 border-black shadow-hard"></div>
                                </div>
                                {/* Metrics Cards */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="h-36 bg-white border-4 border-black shadow-hard p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-black/20"></div>
                                        <div className="h-12 w-20 bg-primary border-4 border-black shadow-hard"></div>
                                    </div>
                                    <div className="h-36 bg-white border-4 border-black shadow-hard p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-black/20"></div>
                                        <div className="h-12 w-20 bg-secondary border-4 border-black shadow-hard"></div>
                                    </div>
                                    <div className="h-36 bg-white border-4 border-black shadow-hard p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-black/20"></div>
                                        <div className="h-4 w-full bg-white border-2 border-black mt-auto">
                                            <div className="h-full w-2/3 bg-black"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Chart Area */}
                                <div className="flex-1 bg-white border-4 border-black shadow-hard p-8 flex items-end gap-x-6">
                                    <div className="w-full bg-accent border-4 border-black border-b-0 h-[30%]"></div>
                                    <div className="w-full bg-secondary border-4 border-black border-b-0 h-[50%]"></div>
                                    <div className="w-full bg-primary border-4 border-black border-b-0 h-[40%]"></div>
                                    <div className="w-full bg-accent border-4 border-black border-b-0 h-[70%]"></div>
                                    <div className="w-full bg-black border-4 border-black border-b-0 h-[90%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Base */}
            <section className="w-full py-24 md:py-32 bg-secondary border-y-8 border-black">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black mb-6">
                            Everything you need to <span className="bg-primary px-2 border-4 border-black shadow-hard inline-block transform -rotate-2">land the job</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl font-black uppercase tracking-widest text-black/80">
                            Comprehensive tools designed by industry leaders to bridge the gap between your current skills and your dream engineering role.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            { title: "Role Intelligence", desc: "AI analyzes job descriptions to extract critical skills and technical requirements.", icon: Shield },
                            { title: "Readiness Score", desc: "Get a quantifiable score (0-100) representing your exact fit for the role.", icon: BarChart3 },
                            { title: "Personalized Roadmap", desc: "A week-by-week learning plan tailored specifically to your missing skills.", icon: Layout },
                            { title: "AI Career Coach", desc: "24/7 technical chat support to answer queries and do mock interview prep.", icon: Zap },
                            { title: "Project Analysis", desc: "GitHub integration reads your code and evaluates your skill depths globally.", icon: Sparkles },
                            { title: "Track Progress", desc: "Monitor your improvements and update your readiness score interactively.", icon: CheckCircle2 },
                        ].map((feat, i) => (
                            <div key={i} className="bg-white p-10 border-4 border-black shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all group flex flex-col">
                                <div className="h-16 w-16 bg-accent border-4 border-black flex items-center justify-center shadow-hard mb-6">
                                    <feat.icon className="h-8 w-8 text-black" />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-black mb-4">{feat.title}</h3>
                                <p className="text-black/80 font-black uppercase tracking-widest text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA App Bottom */}
            <section className="w-full py-32 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="bg-primary border-8 border-black p-12 md:p-24 text-center max-w-6xl mx-auto shadow-hard-lg">
                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black mb-8">
                                Ready to accelerate your career?
                            </h2>
                            <p className="max-w-2xl mx-auto text-xl font-black uppercase tracking-widest text-black/80 mb-12 bg-white border-4 border-black shadow-hard p-4">
                                Join thousands of progressive students using GapSense AI to strategically land their dream engineering setups.
                            </p>
                            <Link href="/auth/signup">
                                <button className="px-12 py-6 bg-black text-white border-4 border-black shadow-hard text-2xl font-black uppercase tracking-widest hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all">
                                    Get Your Roadmap
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
