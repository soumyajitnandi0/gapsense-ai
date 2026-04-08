"use client"

import { useEffect, useState } from "react"
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Milestone } from "@/components/dashboard/RoadmapTimeline"
import { useStore } from "@/lib/store"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

export default function RoadmapPage() {
    const { assessment, setAssessment } = useStore()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!assessment) {
            api.get("/assessments/latest")
                .then(res => {
                    setAssessment(res.data.assessment)
                })
                .catch(() => router.push("/dashboard/onboarding"))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [assessment])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center animate-pulse">
                <div className="h-8 w-8 rounded-full border-t-2 border-primary animate-spin" />
            </div>
        )
    }

    if (!assessment || !assessment.roadmap) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-4">
                <h2 className="text-2xl font-bold">No roadmap generated yet</h2>
                <p className="text-muted-foreground">Complete your readiness assessment to get a personalized roadmap.</p>
            </div>
        )
    }

    const { roadmap } = assessment

    // Format backend milestones into the component's Milestone structure
    const dynamicMilestones: Milestone[] = (roadmap.milestones || []).map((m: any, idx: number) => ({
        id: idx.toString(),
        week: m.week,
        title: m.title,
        description: m.tasks?.map((t: any) => t.title || t).join(" • ") || "No specific tasks listed.",
        status: idx === 0 ? "in-progress" : "pending" // Naive mock state, could use real db tracking later
    }))

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h3 className="text-2xl font-heading font-semibold text-white">Personalized Roadmap</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Your {roadmap.duration || 60}-day step-by-step plan to close your skill gaps for the <span className="font-medium text-white">{assessment.roleId?.name || "target"}</span> role.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-white">Learning Path</CardTitle>
                    <CardDescription>Follow this timeline to achieve job readiness.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {dynamicMilestones.length > 0 ? (
                        <RoadmapTimeline milestones={dynamicMilestones} />
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Your roadmap is still being generated or is empty.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
