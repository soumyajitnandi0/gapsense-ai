"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReadinessScore } from "@/components/dashboard/ReadinessScore"
import { useStore, IGap, ISubScore, Role } from "@/lib/store"
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

    const fetchDashboard = async () => {
        try {
            const assessmentId = assessment?._id || 'latest'
            const res = await api.get(`/assessments/${assessmentId}`)
            setAssessment(res.data.assessment)
            setLoading(false)
        } catch {
            router.push("/dashboard/onboarding")
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [assessment?._id])

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
                        <div className="h-16 w-16 bg-primary border-4 border-black shadow-hard flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <Target className="h-8 w-8 text-black" />
                        </div>
                        <h1 className="text-5xl lg:text-[64px] font-black uppercase tracking-tighter text-black leading-none">
                            Goal Alignment
                        </h1>
                    </div>
                    <p className="text-black font-black uppercase tracking-widest text-sm ml-1 bg-white border-2 border-black px-3 py-1 w-fit shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        Target Role: <span className="text-primary">{typeof assessment.roleId === 'object' ? (assessment.roleId as Role)?.name : assessment.roleId || "Target Role"}</span>
                    </p>
                </div>
                <Button 
                    onClick={handleRecompute} 
                    disabled={isRecomputing} 
                    className="h-16 px-8 rounded-none border-4 border-black bg-primary text-black hover:bg-primary hover:translate-y-1 hover:translate-x-1 hover:shadow-none font-black uppercase tracking-widest shadow-hard transition-all"
                >
                    {isRecomputing ? (
                       <span className="flex items-center gap-2">
                           <div className="h-4 w-4 border-4 border-black border-t-transparent rounded-full animate-spin" />
                           Recomputing...
                       </span>
                    ) : "Recompute Score"}
                </Button>
            </div>

            {/* Top Grid: Readiness vs Subscores */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-10">
                {/* Left Column: Overall Readiness */}
                <PremiumCard className="lg:col-span-4 h-auto min-h-[500px] flex flex-col justify-between items-center text-center py-16 shadow-hard border-4 border-black rounded-none bg-white">
                    <h2 className="text-sm font-black text-black uppercase tracking-widest mb-4 bg-primary px-4 py-1 border-2 border-black">Overall Readiness</h2>
                    
                    <div className="relative w-72 h-72 flex items-center justify-center my-8">
                        <div className="w-full h-full border-8 border-black rounded-full flex items-center justify-center bg-white shadow-hard relative overflow-hidden">
                            <div 
                                className="absolute bottom-0 w-full bg-primary transition-all duration-1000 border-t-8 border-black" 
                                style={{ height: `${score}%` }}
                            />
                            <div className="relative z-10 flex flex-col items-center bg-white border-4 border-black p-4 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <span className="text-7xl font-black tracking-tighter leading-none text-black">{score}</span>
                                <span className="text-sm font-black text-black uppercase tracking-widest mt-1">/ 100</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-base font-black uppercase text-black max-w-[280px] leading-relaxed mx-auto px-4 mt-4">
                        Top <span className="text-white bg-black px-2 py-1 mx-1 border-2 border-black">{gaps.length} major gaps</span> stand between your profile and target expectations.
                    </p>
                </PremiumCard>

                {/* Right Column: 2x2 Grid of Subscores */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {subscores.map((sub: ISubScore, idx: number) => {
                        const bgColor = getScoreColor(sub.score)
                        return (
                            <PremiumCard variant="white" key={idx} className="p-8 h-[240px] flex flex-col justify-between shadow-hard border-4 border-black rounded-none group hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-black uppercase tracking-widest text-black">{sub.category}</span>
                                    <div className="h-10 w-10 border-4 border-black bg-accent flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <TrendingUp className="h-5 w-5 text-black" />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-6xl font-black tracking-tighter text-black">{sub.score}</span>
                                        <span className="text-sm font-black uppercase text-black/50">/ 100</span>
                                    </div>
                                    <div className="text-[11px] font-black text-black uppercase tracking-widest line-clamp-1 mb-8 bg-primary/20 w-fit px-2 border-2 border-black/10">{sub.explanation}</div>
                                </div>

                                <div className="w-full bg-white border-4 border-black h-4 rounded-none overflow-hidden">
                                    <div
                                        className={cn("h-full border-r-4 border-black transition-all duration-1000", bgColor)}
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
                {/* Priority Gaps */}
                <PremiumCard className="min-h-[500px] flex flex-col shadow-hard border-4 border-black rounded-none p-10 bg-white">
                    <div className="flex items-center justify-between mb-10 pb-4 border-b-4 border-black">
                        <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3 text-black">
                            <AlertTriangle className="h-8 w-8 text-black" /> Top Priority Gaps
                        </h3>
                        <span className="text-sm font-black text-black bg-primary px-3 py-1 border-4 border-black uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)]">{gaps.length} Items</span>
                    </div>
                    
                    <div className="space-y-6 overflow-y-auto custom-scrollbar flex-grow pr-2">
                        {gaps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-black">
                                <CheckCircle2 className="h-16 w-16 mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No major gaps</p>
                            </div>
                        ) : gaps.map((gap: IGap, idx: number) => (
                            <div key={idx} className="group p-6 bg-white border-4 border-black hover:-translate-y-1 hover:translate-x-1 hover:shadow-hard transition-all flex items-start gap-5">
                                <div className="h-14 w-14 bg-primary flex items-center justify-center shrink-0 border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <Lightbulb className="h-6 w-6 text-black" />
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-black uppercase text-black leading-tight">{gap.skill}</h4>
                                        <span className={cn(
                                            "text-xs font-black uppercase px-3 py-1 tracking-widest border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                                            gap.priority === 'high' ? 'bg-red-400 text-black' : 'bg-primary text-black'
                                        )}>
                                            {gap.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-sm text-black/80 leading-relaxed font-bold uppercase">
                                        {gap.rationale}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </PremiumCard>

                {/* 60-Day Action Plan */}
                <PremiumCard className="min-h-[500px] flex flex-col bg-black text-white shadow-hard border-4 border-black rounded-none p-0 relative overflow-hidden group">
                    <div className="p-10 pb-6 border-b-4 border-white relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Clock className="h-8 w-8 text-primary" /> {roadmap?.duration || 60}-Day Action Plan
                            </h3>
                            <Button variant="ghost" className="h-12 px-6 border-4 border-white rounded-none hover:bg-white hover:text-black font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none" onClick={() => router.push("/dashboard/roadmap")}>
                                View Full <ArrowUpRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-sm font-black text-primary uppercase tracking-widest ml-11">Strategic Blueprint</p>
                    </div>

                    <div className="relative p-10 flex-grow space-y-10 z-10 overflow-y-auto custom-scrollbar">
                        {/* Vertical Timeline Guide Line */}
                        <div className="absolute left-[3.4rem] top-10 bottom-10 w-2 bg-white" />

                        {roadmap?.milestones?.slice(0, 3).map((item, idx: number) => (
                            <div key={idx} className="relative flex gap-8 group/milestone cursor-pointer hover:-translate-y-1 transition-all">
                                {/* Timeline Node */}
                                <div className="relative mt-2">
                                    <div className="h-8 w-8 bg-black border-4 border-white flex items-center justify-center z-10 relative group-hover/milestone:bg-primary transition-colors">
                                        <div className="h-3 w-3 bg-white" />
                                    </div>
                                </div>

                                {/* Content block */}
                                <div className="flex-1 bg-black rounded-none p-6 border-4 border-white shadow-[4px_4px_0px_rgba(255,255,255,1)] group-hover/milestone:translate-x-1 group-hover/milestone:translate-y-1 group-hover/milestone:shadow-none transition-all">
                                    <span className="text-xs font-black text-black bg-primary px-2 py-1 border-2 border-white uppercase tracking-widest shadow-[2px_2px_0px_rgba(255,255,255,1)]">Week {item.week}</span>
                                    <h4 className="text-xl font-black uppercase mt-4 text-white mb-6">
                                        {item.title}
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        {item.tasks?.slice(0, 2).map((task: { title?: string }, tIdx: number) => (
                                          <div key={tIdx} className="flex items-start gap-3 text-sm font-bold uppercase tracking-wide text-white bg-black p-4 border-4 border-white shadow-[2px_2px_0px_rgba(255,255,255,1)]">
                                              <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
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
