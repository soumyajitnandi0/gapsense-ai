"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, PlayCircle, Search, Code, Loader2, Sparkles, Globe } from "lucide-react"

export default function ResourcesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [filteredResources, setFilteredResources] = useState<any[]>([])

    const allResources = [
        { title: "System Design Interview Guide", category: "Guide", type: "Article", readTime: "10 min", icon: FileText, url: "https://github.com/donnemartin/system-design-primer" },
        { title: "Top 50 React Interview Questions", category: "Frontend", type: "List", readTime: "15 min", icon: Code, url: "https://github.com/sudheerj/reactjs-interview-questions" },
        { title: "Mastering Kubernetes", category: "DevOps", type: "Video", readTime: "45 min", icon: PlayCircle, url: "https://kubernetes.io/docs/home/" },
        { title: "Behavioral Interview Prep", category: "Soft Skills", type: "Guide", readTime: "8 min", icon: BookOpen, url: "https://www.pramp.com/ref/bt1" },
        { title: "Understanding Database Indexing", category: "Backend", type: "Deep Dive", readTime: "12 min", icon: FileText, url: "https://use-the-index-luke.com/" },
        { title: "Building Scalable APIs", category: "Backend", type: "Tutorial", readTime: "20 min", icon: Code, url: "https://restfulapi.net/" },
        { title: "Modern JavaScript Deep Dive", category: "Language", type: "Book", readTime: "100 min", icon: BookOpen, url: "https://javascript.info/" },
        { title: "TypeScript Mastery Guide", category: "Language", type: "Article", readTime: "25 min", icon: Sparkles, url: "https://www.typescriptlang.org/docs/" },
        { title: "AWS Cloud Practitioner Prep", category: "Cloud", type: "Course", readTime: "120 min", icon: Globe, url: "https://aws.amazon.com/training/" },
    ]

    useEffect(() => {
        if (!searchQuery) {
            setFilteredResources(allResources)
            return
        }

        setIsSearching(true)
        const timer = setTimeout(() => {
            const filtered = allResources.filter(res => 
                res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredResources(filtered)
            setIsSearching(false)
        }, 600)

        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <div className="flex flex-col min-h-screen pt-28 pb-12 w-full max-w-[1920px] mx-auto px-4 md:px-8 bg-white">
            <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            
            <section className="relative w-full py-16 md:py-24 text-center max-w-5xl mx-auto flex flex-col items-center z-10">
                <div className="mb-6 inline-flex items-center gap-2 px-6 py-2 bg-primary border-4 border-black shadow-hard animate-bounce">
                    <Sparkles className="h-4 w-4 text-black" />
                    <span className="text-xs font-black text-black tracking-widest uppercase">AI-Curated Intelligence</span>
                </div>

                <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.95] mb-8">
                    Resources <span className="bg-primary px-4 border-4 border-black shadow-hard inline-block mt-4">& Guides</span>
                </h1>
                <p className="mx-auto max-w-2xl text-black/80 text-xl font-black uppercase tracking-widest leading-relaxed mb-12">
                    Access the world's most effective technical interview data and upskilling modules.
                </p>
                
                <div className="w-full max-w-2xl mx-auto relative group">
                    {isSearching ? (
                        <Loader2 className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-spin z-10" />
                    ) : (
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-black group-focus-within:text-primary transition-colors z-10" />
                    )}
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search system design, react, backend..." 
                        className="w-full h-20 pl-16 pr-6 bg-white border-4 border-black shadow-hard focus:translate-x-1 focus:translate-y-1 focus:shadow-none outline-none text-black placeholder:text-black/40 text-xl font-black uppercase tracking-widest transition-all" 
                    />
                </div>
            </section>

            <section className="w-full py-12 relative z-10 max-w-7xl mx-auto min-h-[400px]">
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-20 w-20 border-8 border-black border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xl font-black uppercase tracking-widest text-black animate-pulse">Scanning Global Repositories...</p>
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredResources.map((res, i) => (
                            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
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
                                        Open Resource <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border-8 border-black border-dashed">
                        <p className="text-3xl font-black uppercase tracking-tighter mb-4">No Modules Found</p>
                        <p className="text-black/60 font-black uppercase tracking-widest">Try searching for broader topics like "Frontend" or "System Design".</p>
                    </div>
                )}
            </section>
        </div>
    )
}
