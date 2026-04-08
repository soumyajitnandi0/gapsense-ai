"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, Search, Settings2, Edit, Trash2 } from "lucide-react"

export default function AdminTemplatesPage() {
    const templates = [
        { id: "backend", name: "Backend Software Engineer", description: "Standard server-side API layout", required: 12, optional: 5, mapped: 840 },
        { id: "frontend", name: "Frontend Developer", description: "React / Component design pattern", required: 8, optional: 4, mapped: 480 },
        { id: "data", name: "Data Scientist", description: "Pandas/PyTorch standard stack", required: 15, optional: 8, mapped: 520 },
    ]

    return (
        <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold font-heading">Role Templates</h3>
                    <p className="text-sm text-muted-foreground">Define required skills and weights for target roles.</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                    <PlusCircle className="h-4 w-4" /> Create Template
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <Card key={template.id} className="border-white/10 bg-white/5 backdrop-blur-sm group hover:bg-white/10 hover:border-white/20 transition-all flex flex-col">
                        <CardHeader className="pb-3 border-b border-white/5 relative">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white bg-black/50 backdrop-blur-md rounded-md hover:bg-white/20"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20 bg-black/50 backdrop-blur-md rounded-md"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-4 flex-1 flex flex-col justify-between">
                            <div className="flex gap-4 text-sm mb-4">
                                <div>
                                    <span className="block font-semibold text-white">{template.required}</span>
                                    <span className="text-xs text-muted-foreground">Required Skills</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-white">{template.optional}</span>
                                    <span className="text-xs text-muted-foreground">Optional Skills</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-auto pt-4 border-t border-white/5">
                                <span className="text-primary font-medium flex items-center gap-1">
                                    <Settings2 className="h-3 w-3" /> Weights Configured
                                </span>
                                <span className="text-muted-foreground">{template.mapped} students mapped</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <button className="border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center p-6 text-muted-foreground hover:text-white min-h-[200px] group cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <PlusCircle className="h-6 w-6 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium">Define New Role Template</span>
                </button>
            </div>
        </div>
    )
}
