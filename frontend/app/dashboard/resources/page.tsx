"use client"

import { useState, useMemo, useLayoutEffect } from "react"
import Link from "next/link"
import { BookOpen, FileText, PlayCircle, Search, ExternalLink, Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { useStore } from "@/lib/store"

const ALL_RESOURCES = [
    { title: "System Design Interview Guide", category: "System Design", type: "Article", readTime: "10 min", icon: FileText, premium: false, url: "https://github.com/donnemartin/system-design-primer", tags: ["system design", "architecture", "distributed systems"] },
    { title: "Advanced Distributed Systems", category: "Backend", type: "Video Course", readTime: "2h 30m", icon: PlayCircle, premium: false, url: "https://www.youtube.com/results?search_query=distributed+systems+course", tags: ["backend", "distributed systems", "scalability"] },
    { title: "Top 50 React Interview Questions", category: "Frontend", type: "List", readTime: "15 min", icon: FileText, premium: false, url: "https://github.com/sudheerj/reactjs-interview-questions", tags: ["react", "javascript", "frontend", "interview"] },
    { title: "Negotiation Masterclass", category: "Soft Skills", type: "Video", readTime: "45 min", icon: PlayCircle, premium: false, url: "https://www.youtube.com/results?search_query=salary+negotiation+tips", tags: ["negotiation", "salary", "soft skills"] },
    { title: "Mastering Kubernetes", category: "DevOps", type: "Video", readTime: "45 min", icon: PlayCircle, premium: false, url: "https://kubernetes.io/docs/tutorials/", tags: ["kubernetes", "devops", "containers", "docker"] },
    { title: "FAANG Coding Patterns", category: "DSA", type: "Guide", readTime: "1h", icon: FileText, premium: false, url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions", tags: ["algorithms", "data structures", "leetcode", "coding"] },
    { title: "REST API Design Best Practices", category: "Backend", type: "Article", readTime: "12 min", icon: FileText, premium: false, url: "https://restfulapi.net/", tags: ["api", "rest", "backend", "http"] },
    { title: "TypeScript Deep Dive", category: "Frontend", type: "Book", readTime: "3h", icon: BookOpen, premium: false, url: "https://basarat.gitbook.io/typescript/", tags: ["typescript", "javascript", "frontend", "types"] },
    { title: "SQL Performance Explained", category: "Database", type: "Guide", readTime: "30 min", icon: FileText, premium: false, url: "https://use-the-index-luke.com/", tags: ["sql", "database", "performance", "indexing"] },
    { title: "Docker for Beginners", category: "DevOps", type: "Tutorial", readTime: "20 min", icon: PlayCircle, premium: false, url: "https://docker-curriculum.com/", tags: ["docker", "containers", "devops"] },
    { title: "Git Branching Strategies", category: "Tooling", type: "Article", readTime: "8 min", icon: FileText, premium: false, url: "https://www.atlassian.com/git/tutorials/comparing-workflows", tags: ["git", "version control", "workflow"] },
    { title: "GraphQL vs REST", category: "Backend", type: "Article", readTime: "10 min", icon: FileText, premium: false, url: "https://www.apollographql.com/blog/graphql-vs-rest", tags: ["graphql", "api", "backend", "rest"] },
]

const CATEGORIES = ["All", ...Array.from(new Set(ALL_RESOURCES.map(r => r.category)))]

export default function DashboardResourcesPage() {
    const { assessment } = useStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")
    const [recommendedTags, setRecommendedTags] = useState<string[]>([])

    // Extract gap-based recommendations from assessment
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useLayoutEffect(() => {
        if (assessment?.gaps) {
            const tags = assessment.gaps.map((g: { skill?: string }) => g.skill?.toLowerCase()).filter((s): s is string => Boolean(s))
            setRecommendedTags(tags)
        } else {
            // Try to fetch assessment for recommendations
            api.get("/assessments/latest").then(res => {
                if (res.data?.assessment?.gaps) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setRecommendedTags(res.data.assessment.gaps.map((g: { skill?: string }) => g.skill?.toLowerCase()).filter((s: string | undefined): s is string => Boolean(s)))
                }
            }).catch(() => {})
        }
    }, [assessment])

    // Filter and sort resources
    const filteredResources = useMemo(() => {
        let resources = ALL_RESOURCES

        // Category filter
        if (activeCategory !== "All") {
            resources = resources.filter(r => r.category === activeCategory)
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            resources = resources.filter(r => 
                r.title.toLowerCase().includes(q) || 
                r.category.toLowerCase().includes(q) ||
                r.tags.some(t => t.includes(q))
            )
        }

        // Sort: recommended first
        if (recommendedTags.length > 0) {
            resources = [...resources].sort((a, b) => {
                const aMatch = a.tags.some(t => recommendedTags.some(rt => t.includes(rt) || rt.includes(t)))
                const bMatch = b.tags.some(t => recommendedTags.some(rt => t.includes(rt) || rt.includes(t)))
                if (aMatch && !bMatch) return -1
                if (!aMatch && bMatch) return 1
                return 0
            })
        }

        return resources
    }, [searchQuery, activeCategory, recommendedTags])

    const isRecommended = (resource: typeof ALL_RESOURCES[0]) => {
        return recommendedTags.length > 0 && resource.tags.some(t => recommendedTags.some(rt => t.includes(rt) || rt.includes(t)))
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 pt-16 text-[#1B1C1D]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 px-2">
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
                        Curated Resources {recommendedTags.length > 0 && <span className="text-primary">· Personalized for your gaps</span>}
                    </p>
                </div>

                <div className="relative w-full md:w-80 h-14">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input 
                        placeholder="Search Library..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-full pl-14 pr-6 rounded-full bg-white/60 border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md text-base focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-medium placeholder:text-foreground/30" 
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-10 px-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                            activeCategory === cat
                                ? "bg-[#111] text-white shadow-md"
                                : "bg-white/60 text-foreground/60 border border-black/5 hover:bg-black/5 hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <div className="px-2 mb-6">
                <p className="text-sm font-medium text-foreground/40">
                    {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                    {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
                </p>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((res, i) => {
                    const recommended = isRecommended(res)
                    return (
                        <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="group">
                            <PremiumCard 
                                variant="white"
                                className={cn(
                                    "flex flex-col justify-between h-[300px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-black/[0.03] transition-all hover:shadow-premium duration-500 hover:-translate-y-1",
                                    recommended && "border-primary/20 ring-1 ring-primary/10"
                                )}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-foreground px-3 py-1.5 rounded-full border border-primary/20">
                                            {res.category}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {recommended && (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-full border border-emerald-100">
                                                    <Target className="h-3 w-3" /> For You
                                                </span>
                                            )}
                                            <res.icon className="h-6 w-6 text-foreground/20 group-hover:text-primary transition-colors" />
                                        </div>
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

                                    <span className="p-0 text-[13px] font-bold uppercase tracking-widest text-foreground/60 group-hover:text-primary decoration-2 transition-colors flex items-center gap-1">
                                        Open Resource
                                        <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </PremiumCard>
                        </a>
                    )
                })}
            </div>

            {filteredResources.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="h-12 w-12 text-foreground/10 mb-4" />
                    <p className="text-foreground/40 font-medium">No resources match your search.</p>
                    <button onClick={() => { setSearchQuery(""); setActiveCategory("All") }} className="mt-3 text-primary text-sm font-semibold hover:underline">Clear filters</button>
                </div>
            )}
        </div>
    )
}
