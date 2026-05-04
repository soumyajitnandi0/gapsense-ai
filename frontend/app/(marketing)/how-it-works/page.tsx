import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Cpu, FileSearch, LineChart, Map, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
    const steps = [
        {
            title: "Resume Sync",
            desc: "Upload your resume or connect GitHub. Our AI extracts every skill, project, and experience to build your baseline profile.",
            icon: FileSearch,
            color: "bg-primary"
        },
        {
            title: "Gap Analysis",
            desc: "We compare your profile against real-world job descriptions for your target role, identifying the exact missing pieces in your stack.",
            icon: Cpu,
            color: "bg-secondary"
        },
        {
            title: "Dynamic Roadmap",
            desc: "Receive a personalized, week-by-week learning plan designed to bridge your gaps with hand-picked resources and projects.",
            icon: Map,
            color: "bg-accent"
        },
        {
            title: "Readiness Score",
            desc: "Track your progress in real-time. As you complete tasks, your Readiness Score increases, telling you exactly when you're ready to apply.",
            icon: LineChart,
            color: "bg-white"
        }
    ]

    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-background">
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
                <div className="mb-6 px-4 py-1.5 bg-primary border-4 border-black shadow-hard text-black text-xs font-black tracking-widest uppercase flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Your Path to Hired
                </div>
                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    The <span className="bg-accent px-4 border-4 border-black shadow-hard inline-block mt-4">Blueprint</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    Stop guessing. GapSense AI provides a data-driven path from your current skills to your dream engineering role. Here's the process.
                </p>
                <div className="flex items-center gap-4">
                    <Link href="/auth/signup">
                        <Button className="h-16 px-10 bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all">
                            Start Your Journey
                            <ArrowUpRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </section>

            <section className="w-full py-12 relative z-10 max-w-7xl mx-auto">
                <div className="grid gap-12 md:grid-cols-2">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-white border-4 border-black p-10 shadow-hard-lg flex flex-col gap-8 group">
                            <div className="flex justify-between items-start">
                                <div className={`h-20 w-20 ${step.color} border-4 border-black flex items-center justify-center shadow-hard group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all`}>
                                    <step.icon className="h-10 w-10 text-black" strokeWidth={3} />
                                </div>
                                <div className="text-6xl font-black text-black/10 group-hover:text-black/20 transition-colors">
                                    0{i + 1}
                                </div>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                <h3 className="text-3xl font-black uppercase tracking-widest text-black">{step.title}</h3>
                                <p className="text-lg font-black uppercase tracking-widest text-black/70 leading-relaxed">{step.desc}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-4 w-full bg-black/10 border-2 border-black overflow-hidden shadow-hard">
                                    <div className={`h-full ${step.color} border-r-2 border-black`} style={{ width: `${(i + 1) * 25}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="w-full py-24 text-center">
                <div className="max-w-4xl mx-auto bg-secondary border-8 border-black p-12 shadow-hard-xl">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-8">
                        Ready to see your Readiness Score?
                    </h2>
                    <Link href="/auth/signup">
                        <Button className="h-20 px-12 bg-white text-black border-4 border-black shadow-hard hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all text-2xl">
                            Analyze My Resume
                            <Target className="ml-3 h-8 w-8" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

