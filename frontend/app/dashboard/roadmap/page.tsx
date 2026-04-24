"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { PlayCircle, Clock, CheckCircle2, ArrowRight, Target, Map } from "lucide-react"

export default function RoadmapPage() {
    const { assessment, setAssessment } = useStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!assessment) {
            api.get("/assessments/latest")
                .then(res => setAssessment(res.data.assessment))
                .catch(() => router.push("/dashboard/onboarding"))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [assessment])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-black/10 border-t-primary animate-spin" />
            </div>
        )
    }

    if (!assessment || !assessment.roadmap) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
                <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center shadow-sm">
                    <Map className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-heading font-medium tracking-tight text-[#111]">
                    No Roadmap Generated
                </h1>
                <p className="text-[#2B2D2B]/60 max-w-md">
                    Complete your readiness assessment to get a personalized, AI-driven learning plan.
                </p>
                <button onClick={() => router.push("/dashboard/onboarding")} className="px-8 py-3 rounded-full bg-[#1b1c1d] text-white font-medium hover:bg-black transition shadow-premium">
                    Get Started
                </button>
            </div>
        )
    }

    const { roadmap } = assessment
    const milestones = roadmap.milestones || []

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 px-2 border-b border-black/5 pb-8">
                <div>
                    <h1 className="text-4xl lg:text-[48px] font-heading font-medium tracking-tight text-[#111] mb-3">
                        Learning Roadmap
                    </h1>
                    <p className="text-[#2B2D2B]/60 max-w-2xl text-[16px] leading-relaxed">
                        Your tailored <span className="font-bold text-[#111]">{roadmap.duration || 60}-day</span> acceleration plan to master the <span className="font-bold text-[#111]">{assessment.roleId?.name || "Target Developer"}</span> role.
                    </p>
                </div>
                <div className="flex items-center gap-4 glass-panel px-6 py-4 rounded-[2rem] border border-white/60">
                    <Target className="h-8 w-8 text-primary shrink-0" />
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/40 mb-0.5">Total Milestones</div>
                        <div className="text-2xl font-normal text-[#111] leading-none">{milestones.length} <span className="text-sm font-medium text-[#2B2D2B]/50 ml-1">Weeks</span></div>
                    </div>
                </div>
            </div>

            {/* Timeline View */}
            <div className="pl-4 lg:pl-8">
                <div className="relative border-l-2 border-black/5 ml-[24px]">
                    {milestones.map((m: any, i: number) => {
                        const tasksList = m.tasks?.map((t: any) => t.title || t) || []
                        const isActive = i === 0;

                        return (
                            <div key={i} className={`relative pl-12 lg:pl-16 pb-12 last:pb-0 group transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                                {/* Node icon attached to the line */}
                                <div className="absolute left-[-25px] top-4 h-12 w-12 rounded-full border-[6px] border-[#FAFAF8] flex items-center justify-center shadow-sm bg-white transition-transform group-hover:scale-110 duration-300">
                                    {isActive ? (
                                        <div className="h-full w-full bg-primary flex items-center justify-center rounded-full"><PlayCircle className="h-5 w-5 text-[#111]"/></div>
                                    ) : (
                                        <div className="h-full w-full bg-[#1A1A1A] flex items-center justify-center rounded-full"><div className="h-1.5 w-1.5 bg-white/50 rounded-full"/></div>
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className={`p-8 lg:p-10 rounded-[2.5rem] border transition-all duration-300 shadow-sm ${isActive ? 'bg-white glass-panel border-primary/20 shadow-[0_20px_60px_rgb(0,0,0,0.06)]' : 'bg-white/50 border-white/80 hover:bg-white hover:shadow-md'}`}>
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                                        <div>
                                            <span className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block ${isActive ? 'bg-primary border border-primary/20 text-[#111]' : 'bg-white border border-black/5 text-[#2B2D2B]/60'}`}>
                                                Week {m.week}
                                            </span>
                                            <h3 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111]">{m.title}</h3>
                                        </div>
                                        <button className={`h-14 w-14 rounded-full border shrink-0 flex items-center justify-center transition-colors ${isActive ? 'border-black/5 bg-[#1a1a1a] text-white hover:bg-black' : 'border-black/5 bg-white text-[#2B2D2B]/30 hover:text-[#111] hover:bg-black/5'}`}>
                                            {isActive ? <ArrowRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {/* Tasks Grid */}
                                    {tasksList.length > 0 && (
                                        <div className="grid lg:grid-cols-2 gap-4">
                                            {tasksList.map((task: string, tIdx: number) => (
                                                <div key={tIdx} className={`flex items-start gap-4 p-5 rounded-[1.5rem] border ${isActive ? 'bg-[#fafafa] border-black/5' : 'bg-[#1a1a1a]/[0.01] border-black/[0.03]'}`}>
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${isActive ? 'bg-white border-black/10' : 'bg-transparent border-black/10'}`}>
                                                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-black/20'}`}/>
                                                    </div>
                                                    <p className="text-[15px] text-[#2B2D2B]/80 font-medium leading-relaxed">{task}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {tasksList.length === 0 && (
                                        <p className="text-[#2B2D2B]/40 italic text-sm">No specific tasks defined for this week.</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
