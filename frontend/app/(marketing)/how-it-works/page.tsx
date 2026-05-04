import Link from "next/link"
import { ArrowUpRight, Calendar, Code2, Database, Github, LayoutGrid, Linkedin, MessageSquare, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/PremiumCard"

export default function IntegrationsPage() {
    const integrations = [
        {
            title: "GitHub",
            desc: "Automatically sync your repositories to prove your real-world coding experience. We analyze your commits to validate your skills.",
            icon: Github,
            status: "Connected"
        },
        {
            title: "LinkedIn",
            desc: "Import your work history and endorsements with one click. Keep your professional profile perfectly aligned with your learning roadmap.",
            icon: Linkedin,
            status: "Available"
        },
        {
            title: "LeetCode",
            desc: "Connect your LeetCode account to automatically import algorithmic problem-solving stats into your Readiness Score.",
            icon: Code2,
            status: "Available"
        },
        {
            title: "Discord",
            desc: "Join community study groups and receive automated alerts about new job openings that match your updated skill profile.",
            icon: MessageSquare,
            status: "Available"
        }
    ]

    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-background">
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
                <div className="mb-6 px-4 py-1.5 bg-primary border-4 border-black shadow-hard text-black text-xs font-black tracking-widest uppercase flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Connect Your Stack
                </div>
                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    Seamless <br/><span className="bg-accent px-4 border-4 border-black shadow-hard inline-block mt-4">Integrations</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    GapSense AI plugs directly into the tools you already use. Sync your code, track your progress, and automate your career growth without switching tabs.
                </p>
                <div className="flex items-center gap-4">
                    <Link href="/auth/signup">
                        <Button className="bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none rounded-none px-8 h-16 text-lg font-black uppercase tracking-widest transition-all">
                            Connect Now
                            <ArrowUpRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </section>

            <section className="w-full py-12 relative z-10 max-w-7xl mx-auto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((integration, i) => (
                        <div key={i} className="bg-white border-4 border-black p-8 shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all flex flex-col gap-6 cursor-pointer group">
                            <div className="flex justify-between items-start">
                                <div className="h-16 w-16 bg-white border-4 border-black flex items-center justify-center shadow-hard group-hover:bg-black group-hover:text-white transition-colors">
                                    <integration.icon className="h-8 w-8 text-black group-hover:text-white transition-colors" />
                                </div>
                                
                                <div className={`px-3 py-1 border-2 border-black text-[11px] font-black tracking-widest uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                                    integration.status === 'Connected' 
                                        ? 'bg-accent text-black' 
                                        : 'bg-primary text-black'
                                }`}>
                                    {integration.status}
                                </div>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                <h3 className="text-2xl font-black uppercase tracking-widest text-black">{integration.title}</h3>
                                <p className="text-[13px] font-black uppercase tracking-widest text-black/70 leading-relaxed">{integration.desc}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t-4 border-black flex items-center text-[15px] font-black uppercase tracking-widest text-black group-hover:bg-primary px-2 py-2 transition-colors border-b-2 border-transparent group-hover:border-black">
                                Learn More <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
