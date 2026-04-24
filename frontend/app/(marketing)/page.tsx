import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Layout, Shield, Zap, Sparkles } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen text-[#2B2D2B] bg-[#FAF9F6]">
            {/* Hero Section */}
            <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
                
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#111]/10 shadow-[0_2px_10px_rgb(0,0,0,0.02)] animate-in slide-in-from-bottom-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-[#111] tracking-wide uppercase">Now in Early Access</span>
                </div>

                {/* Main Headline */}
                <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-[90px] font-heading font-medium tracking-tight text-[#111] leading-[1.05] sm:leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    Master Your Career Readiness with <span className="relative inline-flex flex-col items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">AI</span>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#2B2D2B]/60 leading-relaxed mb-12 animate-in fade-in duration-700 delay-300">
                    Analyze your resume, identify skill gaps, and follow a <strong className="text-[#111] font-semibold">personalized 60-day roadmap</strong> to land your dream role today.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <Link href="/auth/signup" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-10 py-5 bg-[#111] text-white rounded-full text-lg font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                            Get Started for Free <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                    <Link href="/how-it-works" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-10 py-5 bg-white border border-[#111]/10 text-[#111] rounded-full text-lg font-medium shadow-sm hover:bg-[#1a1a1a]/[0.02] transition-colors duration-300 flex items-center justify-center">
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
                <div className="w-full max-w-6xl relative group perspective-[2000px]">
                    <div className="relative rounded-[2rem] border border-white border-b-black/5 bg-white/40 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] backdrop-blur-2xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-700">
                        {/* Browser Chrome */}
                        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#111]/5 bg-white/60">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-400" />
                                <div className="h-3 w-3 rounded-full bg-amber-400" />
                                <div className="h-3 w-3 rounded-full bg-green-400" />
                            </div>
                            <div className="mx-auto text-[13px] font-medium text-[#2B2D2B]/40">dashboard.gapsense.ai</div>
                        </div>

                        {/* Mockup Body */}
                        <div className="flex h-[350px] md:h-[600px] w-full bg-[#FAF9F6] p-6 lg:p-10 gap-8 overflow-hidden relative">
                            {/* Dashboard Sidebar */}
                            <div className="hidden md:flex w-64 bg-white border border-[#111]/5 rounded-[2rem] p-6 flex-col gap-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                                       <Sparkles className="text-white h-5 w-5" /> 
                                    </div>
                                    <div className="h-4 w-24 bg-[#111]/10 rounded-full"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-12 w-full bg-[#111]/5 rounded-xl border border-[#111]/5"></div>
                                    <div className="h-10 w-full bg-transparent rounded-xl"></div>
                                    <div className="h-10 w-full bg-transparent rounded-xl"></div>
                                </div>
                            </div>

                            {/* Main Content Pane */}
                            <div className="flex-1 flex flex-col gap-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="space-y-3">
                                        <div className="h-8 w-64 bg-[#111]/80 rounded-xl"></div>
                                        <div className="h-4 w-40 bg-[#111]/20 rounded-full"></div>
                                    </div>
                                    <div className="h-12 w-32 bg-white border border-[#111]/10 rounded-full shadow-sm"></div>
                                </div>
                                {/* Metrics Cards */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="h-36 bg-white border border-[#111]/5 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-[#111]/10 rounded-full"></div>
                                        <div className="h-10 w-16 bg-amber-400 rounded-xl"></div>
                                    </div>
                                    <div className="h-36 bg-white border border-[#111]/5 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-[#111]/10 rounded-full"></div>
                                        <div className="h-10 w-16 bg-[#111]/80 rounded-xl"></div>
                                    </div>
                                    <div className="h-36 bg-white border border-[#111]/5 rounded-[2rem] shadow-sm p-6 flex flex-col justify-between">
                                        <div className="h-4 w-24 bg-[#111]/10 rounded-full"></div>
                                        <div className="h-2 w-full bg-[#111]/5 rounded-full mt-auto">
                                            <div className="h-full w-2/3 bg-green-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Chart Area */}
                                <div className="flex-1 bg-white border border-[#111]/5 rounded-[2rem] shadow-sm p-8 flex items-end gap-x-6">
                                    <div className="w-full bg-amber-400/20 h-[30%] rounded-t-xl"></div>
                                    <div className="w-full bg-amber-400/40 h-[50%] rounded-t-xl"></div>
                                    <div className="w-full bg-amber-400/60 h-[40%] rounded-t-xl"></div>
                                    <div className="w-full bg-amber-400/80 h-[70%] rounded-t-xl"></div>
                                    <div className="w-full bg-amber-400 h-[90%] rounded-t-xl shadow-[0_0_20px_rgba(251,191,36,0.3)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Base */}
            <section className="w-full py-24 md:py-32 bg-white border-t border-[#111]/5">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-[#111] mb-6">
                            Everything you need to <span className="text-amber-500">land the job</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-[#2B2D2B]/60">
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
                            <div key={i} className="bg-[#FAF9F6] p-10 rounded-[2rem] border border-[#111]/5 hover:border-[#111]/10 transition-colors shadow-sm group">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#111]/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feat.icon className="h-6 w-6 text-[#111]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#111] mb-3">{feat.title}</h3>
                                <p className="text-[#2B2D2B]/60 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA App Bottom */}
            <section className="w-full py-32 bg-[#FAF9F6]">
                <div className="container px-4 md:px-6">
                    <div className="bg-[#111] rounded-[3rem] p-12 md:p-24 text-center max-w-6xl mx-auto relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-heading font-medium tracking-tight text-white mb-8">
                                Ready to accelerate your career?
                            </h2>
                            <p className="max-w-xl mx-auto text-lg text-white/60 mb-12">
                                Join thousands of progressive students using GapSense AI to strategically land their dream engineering setups.
                            </p>
                            <Link href="/auth/signup">
                                <button className="px-10 py-5 bg-white text-[#111] rounded-full text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300">
                                    Get Your Personalized Roadmap
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
