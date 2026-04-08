import Link from "next/link"
import { ArrowUpRight, BookOpen, FileText, PlayCircle, Search, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-heading text-white">Learning Resources</h1>
                <div className="relative w-64 hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search library..." className="pl-9 bg-white/5 border-white/10" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((res, i) => (
                    <Link key={i} href="#" className={`group ${res.premium ? 'opacity-80 hover:opacity-100' : ''}`}>
                        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors relative overflow-hidden">
                            {res.premium && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                        <Lock className="h-3 w-3" /> Premium
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{res.category}</Badge>
                                    {!res.premium && <res.icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />}
                                </div>
                                <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">{res.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <span>{res.type}</span>
                                    <span>•</span>
                                    <span>{res.readTime}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 text-primary group-hover:underline">
                                    {res.premium ? "Unlock Access" : "Read Now"} <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
