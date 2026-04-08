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
    TrendingUp
} from "lucide-react"

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
        <div className="min-h-[80vh] flex items-center justify-center animate-pulse">
            <div className="h-10 w-10 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
    )

    const score = assessment.overallScore
    const gaps = assessment.gaps || []
    const subscores = assessment.subScores || []
    const roadmap = assessment.roadmap

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400 bg-green-400"
        if (score >= 50) return "text-yellow-400 bg-yellow-400"
        return "text-red-400 bg-red-400"
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-semibold text-white tracking-tight flex items-center gap-2">
                        <Target className="h-8 w-8 text-lime-400" /> Goal Alignment
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Target Role: <span className="text-white font-medium">{assessment.roleId?.name || "Target Role"}</span>
                    </p>
                </div>
                <Button variant="glow" onClick={handleRecompute} disabled={isRecomputing} className="bg-lime-400 text-black hover:bg-lime-500 rounded-full font-medium shadow-[0_0_20px_-5px_rgba(163,230,53,0.4)]">
                    {isRecomputing ? "Recomputing..." : "Recompute Score"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Readiness Scores - Left Column */}
                <Card className="p-6 bg-white/[0.02] border-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 w-full text-center relative z-10">Overall Readiness</h2>
                    <div className="w-64 h-64 relative z-10">
                        <ReadinessScore score={score} className="scale-125" />
                    </div>
                    <p className="mt-8 text-center text-sm text-muted-foreground max-w-[250px] relative z-10">
                        Top {gaps.length} major gaps stand between your current profile and the target role expectations.
                    </p>
                </Card>

                {/* Subscores - Right Columns (spans 2) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscores.map((sub: ISubScore, idx: number) => {
                        const colorClass = getScoreColor(sub.score)
                        const textColor = colorClass.split(' ')[0]
                        const bgColor = colorClass.split(' ')[1]

                        return (
                            <Card key={idx} className="p-5 bg-white/[0.02] border-white/10 backdrop-blur-md rounded-2xl hover:bg-white/[0.04] transition-colors flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">{sub.category}</span>
                                    <TrendingUp className={`h-4 w-4 ${textColor}`} />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-heading font-bold text-white tracking-tighter">{sub.score}</span>
                                    <span className="text-sm text-muted-foreground mb-1.5">/ 100</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 line-clamp-1">{sub.explanation}</div>
                                <div className="w-full bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${bgColor}`}
                                        style={{ width: `${sub.score}%` }}
                                    />
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Gaps */}
                <Card className="p-6 bg-white/[0.02] border-white/10 backdrop-blur-md rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" /> Top Priority Gaps
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {gaps.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No major gaps identified!</p>
                        ) : gaps.map((gap: IGap, idx: number) => (
                            <div key={idx} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/5 text-white mt-0.5">
                                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-white">{gap.skill}</h4>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            gap.priority === 'high' ? 'bg-red-400/10 text-red-400' : 'bg-yellow-400/10 text-yellow-400'
                                        }`}>
                                            {gap.priority} Priority
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                        <span>{gap.rationale}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 60-Day Roadmap Summary */}
                <Card className="p-6 bg-white/[0.02] border-white/10 backdrop-blur-md rounded-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-cyan-400" /> {roadmap?.duration || 60}-Day Action Plan
                        </h3>
                        <Button variant="link" className="text-cyan-400" onClick={() => router.push("/dashboard/roadmap")}>View Full</Button>
                    </div>

                    <div className="relative pl-6 space-y-8 mt-8 border-l border-white/10 pb-4 z-10 max-h-[400px] overflow-y-auto pr-2">
                        {roadmap?.milestones?.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[30px] p-1 rounded-full bg-black border-2 border-white/20">
                                    <div className="h-2 w-2 rounded-full bg-transparent" />
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Week {item.week}</span>
                                    <h4 className="text-base font-medium mt-1 text-white/90">
                                        {item.title}
                                    </h4>
                                    <div className="mt-4 space-y-2">
                                        {item.tasks.slice(0, 2).map((task: any, tIdx: number) => (
                                          <div key={tIdx} className="flex items-start gap-2 text-sm text-muted-foreground bg-white/5 p-2 rounded-lg">
                                              <CheckCircle2 className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                                              <span className="leading-relaxed">{task.title}</span>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
