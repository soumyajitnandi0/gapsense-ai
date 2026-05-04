import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/PremiumCard"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-background">
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    Simple<br/><span className="bg-primary px-4 border-4 border-black shadow-hard inline-block mt-4">Transparent Pricing</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    Invest in your career with plans designed for every stage of your journey. No hidden fees. Cancel anytime.
                </p>
            </section>

            <section className="w-full py-12 relative z-10 max-w-6xl mx-auto">
                <div className="grid gap-12 lg:grid-cols-3 items-stretch">
                    
                    {/* Starter Tier */}
                    <div className="flex flex-col bg-white border-4 border-black shadow-hard p-8 md:p-10 hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all cursor-pointer">
                        <div className="space-y-4 mb-8">
                            <h3 className="text-3xl font-black uppercase tracking-widest text-black">Starter</h3>
                            <p className="text-[13px] font-black uppercase tracking-widest text-black/50">Perfect for exploring your gaps.</p>
                        </div>
                        <div className="mb-8 p-4 bg-muted border-4 border-black shadow-hard w-fit">
                            <span className="text-5xl font-black font-mono tracking-tighter text-black">$0</span>
                            <span className="text-[13px] font-black tracking-widest uppercase text-black/40 ml-2">/month</span>
                        </div>
                        <ul className="space-y-6 mb-10 flex-1">
                            {["1 Resume Analysis / month", "Basic Gap Identification", "Limited Roadmap Generation", "Community Support"].map((item) => (
                                <li key={item} className="flex items-center text-[13px] font-black uppercase tracking-widest text-black/70">
                                    <div className="h-6 w-6 bg-accent border-2 border-black flex items-center justify-center mr-3">
                                        <Check className="h-4 w-4 text-black" strokeWidth={4} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/auth/signup" className="w-full mt-auto">
                            <Button className="w-full bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none h-16 font-black uppercase tracking-widest text-lg transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="flex flex-col bg-accent text-black border-4 border-black shadow-hard p-8 md:p-10 scale-100 lg:scale-105 z-10 hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all cursor-pointer group">
                        <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 bg-primary text-black px-6 py-2 border-4 border-black text-[13px] font-black tracking-widest uppercase shadow-hard">
                            Most Popular
                        </div>
                        <div className="space-y-4 mb-8 mt-4">
                            <h3 className="text-3xl font-black uppercase tracking-widest text-black flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-black" strokeWidth={3} /> Pro Career
                            </h3>
                            <p className="text-[13px] font-black uppercase tracking-widest text-black/60">Accelerate your job hunt.</p>
                        </div>
                        <div className="mb-8 p-4 bg-white border-4 border-black shadow-hard w-fit">
                            <span className="text-6xl font-black font-mono tracking-tighter text-black">$29</span>
                            <span className="text-[13px] font-black tracking-widest uppercase text-black/40 ml-2">/month</span>
                        </div>
                        <ul className="space-y-6 mb-10 flex-1">
                            {["Unlimited Resume Scans", "Advanced Gap Analysis", "Full 60-Day Personalized Roadmap", "AI Career Coach Access", "Mock Interview Sessions"].map((item) => (
                                <li key={item} className="flex items-center text-[13px] font-black uppercase tracking-widest text-black">
                                    <div className="h-6 w-6 bg-white border-2 border-black flex items-center justify-center mr-3 shadow-hard">
                                        <Check className="h-4 w-4 text-black" strokeWidth={4} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/auth/signup" className="w-full mt-auto">
                            <Button className="w-full bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none h-16 font-black uppercase tracking-widest text-lg transition-all">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="flex flex-col bg-white border-4 border-black shadow-hard p-8 md:p-10 hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all cursor-pointer mt-0 lg:mt-0">
                        <div className="space-y-4 mb-8">
                            <h3 className="text-3xl font-black uppercase tracking-widest text-black">Bootcamps</h3>
                            <p className="text-[13px] font-black uppercase tracking-widest text-black/50">For education providers.</p>
                        </div>
                        <div className="mb-8 p-4 bg-muted border-4 border-black shadow-hard w-fit">
                            <span className="text-5xl font-black font-mono tracking-tighter text-black">Custom</span>
                        </div>
                        <ul className="space-y-6 mb-10 flex-1">
                            {["Bulk Student Management", "Cohort Analytics", "Custom Curriculum Integration", "API Access", "Dedicated Success Manager"].map((item) => (
                                <li key={item} className="flex items-center text-[13px] font-black uppercase tracking-widest text-black/70">
                                    <div className="h-6 w-6 bg-primary border-2 border-black flex items-center justify-center mr-3">
                                        <Check className="h-4 w-4 text-black" strokeWidth={4} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="w-full mt-auto">
                            <Button variant="outline" className="w-full bg-white text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none h-16 font-black uppercase tracking-widest text-lg transition-all">
                                Contact Sales
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
