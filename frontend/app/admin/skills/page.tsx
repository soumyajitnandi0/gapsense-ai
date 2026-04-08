"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BrainCircuit, Share2, Plus, ArrowRight } from "lucide-react"

export default function AdminSkillsPage() {
    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h3 className="text-2xl font-bold font-heading">Skills Ontology</h3>
                    <p className="text-sm text-muted-foreground">Manage the foundational graph database for inference engine mapping.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Share2 className="h-4 w-4 mr-2" />
                        Export Graph
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2 border-0 shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]">
                        <Plus className="h-4 w-4" /> Add Node
                    </Button>
                </div>
            </div>

            <Card className="border-white/10 bg-[#050707] flex-1 flex flex-col relative overflow-hidden shadow-2xl">
                {/* Visual Placeholder for Graph Ontology view */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 h-32 w-32 border border-purple-500/50 rounded-full bg-purple-500/10 backdrop-blur-lg flex items-center justify-center -translate-y-1/2 -translate-x-1/2 z-10 shadow-[0_0_40px_rgba(147,51,234,0.4)]"></div>
                    <div className="absolute top-1/3 left-1/2 h-40 w-40 border border-blue-500/50 rounded-full bg-blue-500/10 backdrop-blur-lg flex items-center justify-center -translate-y-1/2 -translate-x-1/2 z-10 shadow-[0_0_40px_rgba(59,130,246,0.4)]"></div>
                    <div className="absolute bottom-1/3 left-2/3 h-24 w-24 border border-cyan-500/50 rounded-full bg-cyan-500/10 backdrop-blur-lg flex items-center justify-center -translate-y-1/2 -translate-x-1/2 z-10 shadow-[0_0_40px_rgba(6,182,212,0.4)]"></div>

                    {/* Connecting lines */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line x1="25%" y1="50%" x2="50%" y2="33%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="50%" y1="33%" x2="66%" y2="66%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    </svg>
                </div>

                <div className="p-4 border-b border-white/10 bg-black/40 z-10 shrink-0">
                    <div className="max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search nodes, e.g. 'Kubernetes' or 'React'"
                            className="bg-black/50 border-white/10 text-white pl-9 h-10 w-full rounded-md placeholder:text-muted-foreground focus-visible:ring-purple-500/50"
                        />
                    </div>
                </div>

                <CardContent className="flex-1 flex items-center justify-center relative z-10 pointer-events-none p-0">
                    <div className="flex flex-col items-center bg-black/60 border border-white/5 rounded-2xl p-8 backdrop-blur-xl max-w-lg pointer-events-auto">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h4 className="text-xl font-bold font-heading mb-2">Interactive Graph Map</h4>
                        <p className="text-muted-foreground text-center mb-6 text-sm">
                            The visual editor enables dragging nodes to map prerequisites and related edge relationships across the software engineering spectrum.
                        </p>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 gap-2">
                            Initialize WebGL Canvas <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
