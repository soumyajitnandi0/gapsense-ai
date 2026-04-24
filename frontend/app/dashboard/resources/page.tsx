import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, PlayCircle, Search, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { cn } from "@/lib/utils"

export default function DashboardResourcesPage() {
    // Similar to public resources but with some "Premium" locked content
    const resources = [
        { title: "System Design Interview Guide", category: "Guide", type: "Article", readTime: "10 min", icon: FileText, premium: false },
        { title: "Advanced Distributed Systems", category: "Backend", type: "Video Course", readTime: "2h 30m", icon: PlayCircle, premium: true },
        { title: "Top 50 React Interview Questions", category: "Frontend", type: "List", readTime: "15 min", icon: FileText, premium: false },
        { title: "Negotiation Masterclass", category: "Soft Skills", type: "Video", readTime: "45 min", icon: PlayCircle, premium: true },
        { title: "Mastering Kubernetes", category: "DevOps", type: "Video", readTime: "45 min", icon: PlayCircle, premium: false },
        { title: "FAANG Mock Interview Recording", category: "Interview", type: "Video", readTime: "1h", icon: PlayCircle, premium: true },
    ]

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 pt-16 text-[#1B1C1D]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 px-2">
                <div className="flex-grow">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-white/60 border border-black/5 shadow-sm flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-5xl lg:text-[64px] font-heading font-medium tracking-tight text-[#1B1C1D] leading-none">
                            Learning Library
                        </h1>
                    </div>
                    <p className="text-foreground/40 text-sm font-bold uppercase tracking-[0.2em] ml-1">
                        Curated Resources
                    </p>
                </div>

                <div className="relative w-full md:w-80 h-14">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input 
                        placeholder="Search Library..." 
                        className="w-full h-full pl-14 pr-6 rounded-full bg-white/60 border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md text-base focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-medium placeholder:text-foreground/30" 
                    />
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((res, i) => (
                    <Link key={i} href="#" className="group">
                        <PremiumCard 
                            variant="white"
                            className={cn(
                                "flex flex-col justify-between h-[300px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-black/[0.03] transition-all hover:shadow-premium duration-500",
                                res.premium ? "hover:border-primary/20" : "hover:-translate-y-1"
                            )}
                        >
                            {res.premium && (
                                <div className="absolute top-6 right-6">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100/50 shadow-sm">
                                        <Lock className="h-3 w-3" /> Premium
                                    </span>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-foreground px-3 py-1.5 rounded-full border border-primary/20">
                                        {res.category}
                                    </span>
                                    {!res.premium && <res.icon className="h-6 w-6 text-foreground/20 group-hover:text-primary transition-colors" />}
                                </div>
                                
                                <h3 className="text-2xl font-medium tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors pr-8">
                                    {res.title}
                                </h3>
                            </div>

                            <div>
                                <div className="flex items-center text-sm font-bold text-foreground/40 gap-4 mb-6 tracking-wide">
                                    <span>{res.type}</span>
                                    <span className="h-1 w-1 bg-foreground/20 rounded-full" />
                                    <span>{res.readTime}</span>
                                </div>

                                <Button variant="link" className="p-0 text-[13px] font-bold uppercase tracking-widest text-foreground/60 group-hover:text-primary decoration-2 transition-colors">
                                    {res.premium ? "Unlock Access" : "Read Now"} 
                                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Button>
                            </div>
                        </PremiumCard>
                    </Link>
                ))}
            </div>
        </div>
    )
}
