"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Github, Globe, Star, GitBranch } from "lucide-react"

export default function ProjectsPage() {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold font-heading">Your Projects</h3>
                    <p className="text-sm text-muted-foreground">
                        Connect repositories or add projects manually to improve your readiness score.
                    </p>
                </div>
                <Button variant="glow" className="gap-2 bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-white border-0 shadow-[0_0_20px_-5px_hsl(var(--primary))]">
                    <PlusCircle className="h-4 w-4" />
                    Add Project
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder empty state for missing projects */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm border-dashed flex flex-col items-center justify-center p-8 text-center min-h-[250px] hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Github className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Connect GitHub</h4>
                    <p className="text-sm text-muted-foreground">
                        Analyze your repositories to automatically extract technical skills and stack.
                    </p>
                </Card>

                {/* Example populated project */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm group hover:border-white/20 transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-bold">E-Commerce Microservices</CardTitle>
                            <span className="flex items-center text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/20">
                                Analyzed
                            </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                            A scalable backend microservice architecture utilizing Node.js, RabbitMQ, and PostgreSQL.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-muted-foreground">Node.js</span>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-muted-foreground">RabbitMQ</span>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-muted-foreground">Docker</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-white/5 pt-4">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" /> 12
                            </div>
                            <div className="flex items-center gap-1">
                                <GitBranch className="h-4 w-4" /> 4
                            </div>
                            <div className="flex items-center gap-1 ml-auto hover:text-white cursor-pointer transition-colors">
                                <Globe className="h-4 w-4" /> View Info
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
