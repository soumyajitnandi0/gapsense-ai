import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, PlayCircle, Search } from "lucide-react"
import { PremiumCard } from "@/components/ui/PremiumCard"

export default function ResourcesPage() {
    const resources = [
        { title: "System Design Interview Guide", category: "Guide", type: "Article", readTime: "10 min", icon: FileText },
        { title: "Top 50 React Interview Questions", category: "Frontend", type: "List", readTime: "15 min", icon: FileText },
        { title: "Mastering Kubernetes", category: "DevOps", type: "Video", readTime: "45 min", icon: PlayCircle },
        { title: "Behavioral Interview Prep", category: "Soft Skills", type: "Guide", readTime: "8 min", icon: BookOpen },
        { title: "Understanding Database Indexing", category: "Backend", type: "Deep Dive", readTime: "12 min", icon: FileText },
        { title: "Building Scalable APIs", category: "Backend", type: "Tutorial", readTime: "20 min", icon: CodeIcon },
    ]

    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-background">
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    Resources <span className="bg-primary px-4 border-4 border-black shadow-hard inline-block mt-4">& Guides</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    Curated content to help you prepare for technical interviews and upskill effectively.
                </p>
                
                <div className="w-full max-w-2xl mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-black group-focus-within:text-primary transition-colors z-10" />
                    <input 
                        type="text"
                        placeholder="Search resources..." 
                        className="w-full h-20 pl-16 pr-6 bg-white border-4 border-black shadow-hard focus:translate-x-1 focus:translate-y-1 focus:shadow-none outline-none text-black placeholder:text-black/40 text-xl font-black uppercase tracking-widest transition-all" 
                    />
                </div>
            </section>

            <section className="w-full py-12 relative z-10 max-w-7xl mx-auto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((res, i) => (
                        <Link key={i} href="#" className="group block h-full">
                            <div className="h-full bg-white border-4 border-black shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-all p-8 md:p-10 flex flex-col gap-6 cursor-pointer">
                                
                                <div className="flex justify-between items-start">
                                    <div className="px-4 py-1 bg-accent border-2 border-black text-black text-xs font-black tracking-widest uppercase shadow-hard">
                                        {res.category}
                                    </div>
                                    <div className="h-12 w-12 bg-white border-2 border-black flex items-center justify-center shadow-hard group-hover:bg-primary transition-colors">
                                        <res.icon className="h-6 w-6 text-black" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-2xl font-black uppercase tracking-widest text-black group-hover:bg-primary group-hover:px-2 inline transition-all">{res.title}</h3>
                                    
                                    <div className="flex items-center text-[12px] font-black uppercase tracking-widest text-black/50 gap-4">
                                        <span className="bg-muted px-2 py-1 border border-black">{res.type}</span>
                                        <span className="h-2 w-2 bg-black border border-black"></span>
                                        <span>{res.readTime} read</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-6 border-t-4 border-black flex items-center text-[14px] font-black uppercase tracking-widest text-black group-hover:bg-accent px-2 py-2 transition-colors border-b-2 border-transparent group-hover:border-black">
                                    Read More <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}

function CodeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}
