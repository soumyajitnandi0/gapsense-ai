import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, PlayCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
        <div className="flex flex-col min-h-screen pt-20">
            <section className="relative w-full py-16">
                <div className="container px-4 md:px-6 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white font-heading mb-4">Resources & Guides</h1>
                    <p className="mx-auto max-w-[600px] text-muted-foreground mb-8">
                        Curated content to help you prepare for technical interviews and upskill effectively.
                    </p>
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search resources..." className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary/50" />
                    </div>
                </div>
            </section>

            <section className="container px-4 md:px-6 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((res, i) => (
                        <Link key={i} href="#" className="group">
                            <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{res.category}</Badge>
                                        <res.icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                                    </div>
                                    <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">{res.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                        <span>{res.type}</span>
                                        <span>•</span>
                                        <span>{res.readTime} read</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="link" className="p-0 text-primary group-hover:underline">Read More <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
                                </CardFooter>
                            </Card>
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
