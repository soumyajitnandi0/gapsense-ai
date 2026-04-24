"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReadinessScore } from "@/components/dashboard/ReadinessScore"
import { useStore, IGap, ISubScore } from "@/lib/store"
import api from "@/lib/api"
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Lightbulb,
    Target,
    TrendingUp,
    ArrowUpRight
} from "lucide-react"

import { PremiumCard } from "@/components/ui/PremiumCard"
import { cn } from "@/lib/utils"

export default function AnalysisPage() {
    const router = useRouter()
    const { assessment, setAssessment } = useStore()
    const [isRecomputing, setIsRecomputing] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const res = await api.get("/assessments/latest")
            setAssessment(res.data.assessment)
            setLoading(false)
        } catch (e) {
            router.push("/dashboard/onboarding")
        }
    }

    const handleRecompute = async () => {
        if (!assessment?._id) return
        setIsRecomputing(true)
        try {
            const res = await api.post(`/assessments/${assessment._id}/reassess`)
            setAssessment(res.data.assessment)
        } catch(e) {
            console.error("Recompute failed", e)
        } finally {
            setIsRecomputing(false)
        }
    }

    if (loading || !assessment) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-black/10 border-t-primary animate-spin" />
        </div>
    )

    const score = assessment.overallScore || 0
    const gaps = assessment.gaps || []
    const subscores = assessment.subScores || []
    const roadmap = assessment.roadmap

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-primary"
        if (score >= 50) return "bg-primary"
        return "bg-foreground"
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 pt-16 text-[#1B1C1D]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 px-2">
                <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-white/60 border border-black/5 shadow-sm flex items-center justify-center">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-5xl lg:text-[64px] font-heading font-medium tracking-tight text-[#1B1C1D] leading-none">
                            Goal Alignment
                        </h1>
                    </div>
                    <p className="text-foreground/40 text-sm font-bold uppercase tracking-[0.2em] ml-1">
                        Target Role: <span className="text-foreground/80">{assessment.roleId?.name || "Target Role"}</span>
                    </p>
                </div>
                <Button 
                    onClick={handleRecompute} 
                    disabled={isRecomputing} 
                    className="h-14 px-8 rounded-full bg-primary text-foreground hover:bg-primary/90 font-bold shadow-lg transition-transform hover:-translate-y-1"
                >
                    {isRecomputing ? (
                       <span className="flex items-center gap-2">
                           <div className="h-4 w-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                           Recomputing...
                       </span>
                    ) : "Recompute Score"}
                </Button>
            </div>

            {/* Top Grid: Readiness vs Subscores */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-10">
                {/* Left Column: Overall Readiness */}
                <PremiumCard className="lg:col-span-4 h-auto min-h-[500px] flex flex-col justify-between items-center text-center py-16 shadow-premium border-white">
                    <h2 className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.25em] mb-4">Overall Readiness</h2>
                    
                    <div className="relative w-72 h-72 flex items-center justify-center my-8">
                        <svg className="w-full h-full -rotate-90 scale-110" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="12" strokeDasharray="5 5" />
                            <circle cx="50" cy="50" r="44" fill="none" stroke="#1B1C1D" strokeWidth="12" strokeLinecap="round" strokeDasharray="276" strokeDashoffset={276 - (276 * score) / 100} className="transition-all duration-[2s] ease-out shadow-2xl" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-[90px] font-light tracking-tighter leading-none">{score}</span>
                            <span className="text-[13px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-2">/ 100</span>
                        </div>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground/50 max-w-[280px] leading-relaxed mx-auto px-4 mt-4">
                        Top <span className="font-bold text-foreground">{gaps.length} major gaps</span> stand between your current profile and the target role expectations.
                    </p>
                </PremiumCard>

                {/* Right Column: 2x2 Grid of Subscores */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {subscores.map((sub: ISubScore, idx: number) => {
                        const bgColor = getScoreColor(sub.score)
                        return (
                            <PremiumCard variant="white" key={idx} className="p-8 h-[240px] flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-black/[0.03] group hover:-translate-y-1 transition-all">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-foreground/60">{sub.category}</span>
                                    <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-6xl font-light tracking-tighter">{sub.score}</span>
                                        <span className="text-sm font-bold text-foreground/30">/ 100</span>
                                    </div>
                                    <div className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest line-clamp-1 mb-8">{sub.explanation}</div>
                                </div>

                                <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", bgColor)}
                                        style={{ width: `${sub.score}%` }}
                                    />
                                </div>
                            </PremiumCard>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Grid: Gaps & Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                {/* Priority Gaps */}
                <PremiumCard className="min-h-[500px] flex flex-col shadow-premium border-white p-10">
                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-black/[0.03]">
                        <h3 className="text-2xl font-medium tracking-tight flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-primary" /> Top Priority Gaps
                        </h3>
                        <span className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.25em]">{gaps.length} Items</span>
                    </div>
                    
                    <div className="space-y-6 overflow-y-auto custom-scrollbar flex-grow pr-2">
                        {gaps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-foreground/20">
                                <CheckCircle2 className="h-16 w-16 mb-4 opacity-40" />
                                <p className="text-xs font-black uppercase tracking-[0.4em] opacity-60">No major gaps</p>
                            </div>
                        ) : gaps.map((gap: IGap, idx: number) => (
                            <div key={idx} className="group p-6 rounded-[1.5rem] bg-white/60 border border-black/5 hover:bg-white hover:shadow-lg transition-all flex items-start gap-5">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-base font-bold text-foreground leading-tight">{gap.skill}</h4>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest border shadow-sm",
                                            gap.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary/20 text-foreground border-primary/30'
                                        )}>
                                            {gap.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                        {gap.rationale}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </PremiumCard>

                {/* 60-Day Action Plan */}
                <PremiumCard className="min-h-[500px] flex flex-col bg-[#1A1A1A] text-white shadow-[0_40px_80px_rgb(0,0,0,0.15)] p-0 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-80" />
                    <div className="p-10 pb-6 border-b border-white/5 relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-light tracking-tight flex items-center gap-3">
                                <Clock className="h-6 w-6 text-primary" /> {roadmap?.duration || 60}-Day Action Plan
                            </h3>
                            <Button variant="ghost" className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest rounded-full" onClick={() => router.push("/dashboard/roadmap")}>
                                View Full <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-9">Strategic Blueprint</p>
                    </div>

                    <div className="relative p-10 flex-grow space-y-10 z-10 overflow-y-auto custom-scrollbar">
                        {/* Vertical Timeline Guide Line */}
                        <div className="absolute left-[3.3rem] top-10 bottom-10 w-px bg-white/10" />

                        {roadmap?.milestones?.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="relative flex gap-8 group/milestone cursor-pointer">
                                {/* Timeline Node */}
                                <div className="relative mt-2">
                                    <div className="h-6 w-6 rounded-full bg-[#1A1A1A] border-4 border-white/20 flex items-center justify-center z-10 relative group-hover/milestone:border-primary transition-colors">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white/50 group-hover/milestone:bg-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Content block */}
                                <div className="flex-1 bg-white/5 rounded-[1.5rem] p-6 border border-white/5 group-hover/milestone:bg-white/10 group-hover/milestone:border-white/10 transition-all">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Week {item.week}</span>
                                    <h4 className="text-lg font-medium mt-2 text-white/90 mb-6">
                                        {item.title}
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        {item.tasks.slice(0, 2).map((task: any, tIdx: number) => (
                                          <div key={tIdx} className="flex items-start gap-3 text-sm text-white/60 bg-black/20 p-4 rounded-xl border border-white/5">
                                              <CheckCircle2 className="h-5 w-5 text-white/20 mt-0.5 shrink-0" />
                                              <span className="leading-snug">{task.title}</span>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </PremiumCard>
            </div>
        </div>
    )
}
