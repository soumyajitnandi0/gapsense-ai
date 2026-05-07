"use client"

import { useEffect, useState } from "react"
import { useStore, Role } from "@/lib/store"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { PlayCircle, Clock, CheckCircle2, Target, Map, RefreshCw, Loader2, Sparkles, BookOpen, FileText, Globe } from "lucide-react"

import { PremiumCard } from "@/components/ui/PremiumCard"
import { useToast } from "@/components/ui/use-toast"

export default function RoadmapPage() {
    const { assessment, setAssessment } = useStore()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
    const [completingTask, setCompletingTask] = useState<string | null>(null)
    const [regenerating, setRegenerating] = useState(false)

    useEffect(() => {
        const fetchAssessment = async () => {
            if (!assessment) {
                try {
                    const res = await api.get("/assessments/latest")
                    setAssessment(res.data.assessment)
                } catch (err) {
                    router.push("/dashboard/onboarding")
                    return
                }
            }
            setLoading(false)
        }

        fetchAssessment()

        // Load progress to get completed tasks for THIS assessment
        const assessmentId = assessment?._id;
        api.get(`/progress${assessmentId ? `?assessmentId=${assessmentId}` : ''}`).then(res => {
            if (res.data?.progress?.completedTasks) {
                const ids = new Set<string>(res.data.progress.completedTasks.map((t: { taskId: string }) => t.taskId))
                setCompletedTasks(ids)
            } else if (res.data?.skillProgress) {
                const ids = new Set<string>(res.data.skillProgress.filter((t: { completed: boolean }) => t.completed).map((t: { id: string }) => t.id))
                setCompletedTasks(ids)
            }
        }).catch(() => {})
    }, [assessment])

    const handleCompleteTask = async (taskId: string, milestoneWeek: number) => {
        if (completedTasks.has(taskId) || completingTask) return
        setCompletingTask(taskId)
        
        // Optimistic update
        setCompletedTasks(prev => new Set([...prev, taskId]))

        try {
            await api.post('/progress/complete-task', { taskId, milestoneWeek })
            toast({ title: "Task completed!", description: "Keep up the momentum!" })
        } catch (error: unknown) {
            // Revert on failure
            setCompletedTasks(prev => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
            })
            // Silently handle 404 (progress not initialized)
            if ((error as { response?: { status?: number } }).response?.status !== 404) {
                toast({ title: "Error", description: "Failed to mark task as complete.", variant: "destructive" })
            }
        } finally {
            setCompletingTask(null)
        }
    }

    const handleRegenerate = async () => {
        if (!assessment?._id || regenerating) return
        setRegenerating(true)
        try {
            const res = await api.post(`/roadmaps/${assessment._id}/regenerate`, { durationDays: 60 })
            if (res.data?.roadmap) {
                setAssessment({ ...assessment, roadmap: res.data.roadmap })
                setCompletedTasks(new Set())
                toast({ title: "Roadmap Regenerated", description: "A fresh 60-day plan has been created based on your current gaps." })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to regenerate roadmap.", variant: "destructive" })
        } finally {
            setRegenerating(false)
        }
    }

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
    const projectSuggestions = roadmap.projectSuggestions || []

    // Calculate progress
    interface RoadmapMilestone {
        week?: number
        title?: string
        tasks?: Array<{ id?: string; _id?: string; title?: string; estimatedHours?: number; description?: string; resources?: Array<{ url?: string; type?: string; title?: string }> }>
    }
    const totalTasks = milestones.reduce((sum: number, m: RoadmapMilestone) => sum + (m.tasks?.length || 0), 0)
    const completedCount = completedTasks.size
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500 bg-background text-foreground">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 px-2 border-b-4 border-black pb-8">
                <div>
                    <h1 className="text-4xl lg:text-[60px] font-black uppercase tracking-tighter text-black mb-3 leading-none">
                        Roadmap
                    </h1>
                    <p className="text-black/80 max-w-2xl text-[16px] leading-relaxed font-black uppercase tracking-widest mt-6">
                        Your tailored <span className="text-black bg-primary px-1 border-2 border-black">{roadmap.duration || 60}-day</span> acceleration plan to master the <span className="text-black bg-secondary px-1 border-2 border-black">{typeof assessment.roleId === 'object' ? (assessment.roleId as Role)?.name : assessment.roleId || "Target Developer"}</span> role.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    {/* Progress indicator */}
                    <div className="bg-white border-4 border-black shadow-hard px-6 py-4 flex items-center gap-4">
                        <Target className="h-8 w-8 text-black shrink-0" />
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-black/60 mb-0.5">Progress</div>
                            <div className="text-2xl font-black font-mono text-black leading-none bg-primary px-2 border-2 border-black w-fit">{progressPercent}% <span className="text-sm text-black ml-1">{completedCount}/{totalTasks} tasks</span></div>
                        </div>
                    </div>
                    {/* Regenerate button */}
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-2 px-6 py-4 bg-accent border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 text-black text-sm font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        {regenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                        {regenerating ? "Regenerating..." : "Regenerate"}
                    </button>
                </div>
            </div>

            {/* Timeline View */}
            <div className="pl-4 lg:pl-12">
                <div className="relative border-l-4 border-black ml-[24px]">
                    {milestones.map((m: RoadmapMilestone, i: number) => {
                        const tasks = m.tasks || []
                        const weekCompleted = tasks.every((t: { id?: string; _id?: string }) => completedTasks.has(t.id || t._id || `task-${i}-${tasks.indexOf(t)}`))
                        const isActive = !weekCompleted && (i === 0 || milestones.slice(0, i).every((prev: RoadmapMilestone) => 
                            (prev.tasks || []).every((t: { id?: string; _id?: string }) => completedTasks.has(t.id || t._id || `task-${milestones.indexOf(prev)}-${(prev.tasks || []).indexOf(t)}`))
                        ))

                        const weekNumber = m.week || i + 1
                        return (
                            <div key={i} className={`relative pl-12 lg:pl-20 pb-16 last:pb-0 group transition-all duration-500 ${isActive ? 'opacity-100' : weekCompleted ? 'opacity-80' : 'opacity-80 hover:opacity-100'}`}>
                                {/* Node icon attached to the line */}
                                <div className="absolute left-[-26px] top-4 h-12 w-12 border-4 border-black flex items-center justify-center bg-white transition-transform group-hover:scale-110 duration-300">
                                    {weekCompleted ? (
                                        <div className="h-full w-full bg-accent flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-black"/></div>
                                    ) : isActive ? (
                                        <div className="h-full w-full bg-primary flex items-center justify-center"><PlayCircle className="h-6 w-6 text-black"/></div>
                                    ) : (
                                        <div className="h-full w-full bg-black flex items-center justify-center"><div className="h-2 w-2 bg-white"/></div>
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className={`p-8 lg:p-12 border-4 border-black transition-all duration-300 shadow-hard-lg ${isActive ? 'bg-primary' : weekCompleted ? 'bg-muted border-black' : 'bg-white hover:bg-[#fafafa]'}`}>
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-10 gap-4">
                                        <div>
                                            <span className={`text-[13px] font-black uppercase tracking-widest px-4 py-2 border-2 border-black mb-4 inline-block shadow-hard ${isActive ? 'bg-white text-black' : weekCompleted ? 'bg-white text-black' : 'bg-secondary text-black'}`}>
                                                Week {weekNumber}
                                            </span>
                                            <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-black">{m.title}</h3>
                                        </div>
                                        {isActive && (
                                            <span className="text-[13px] uppercase tracking-widest font-black text-black bg-white px-4 py-2 border-2 border-black shadow-hard mt-2">
                                                Active Sprint
                                            </span>
                                        )}
                                    </div>

                                    {/* Tasks Grid with Completion */}
                                    {tasks.length > 0 && (
                                        <div className="grid lg:grid-cols-2 gap-6">
                                            {tasks.map((task: { id?: string; _id?: string; title?: string; estimatedHours?: number; description?: string; resources?: Array<{ url?: string; type?: string; title?: string }> }, tIdx: number) => {
                                                const taskId = task.id || task._id || `task-${i}-${tIdx}`
                                                const isCompleted = completedTasks.has(taskId)
                                                const isCompleting = completingTask === taskId
                                                const taskTitle = task.title || "Untitled Task"

                                                return (
                                                    <div 
                                                        key={tIdx}
                                                        className={`flex flex-col p-6 border-4 border-black transition-transform duration-200 shadow-hard hover:-translate-y-1 hover:translate-x-1 hover:shadow-none ${
                                                            isCompleted 
                                                                ? 'bg-muted' 
                                                                : isActive 
                                                                    ? 'bg-white' 
                                                                    : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-4 mb-4 cursor-pointer" onClick={() => !isCompleted && handleCompleteTask(taskId, weekNumber)}>
                                                            <div className={`h-8 w-8 flex items-center justify-center shrink-0 border-4 border-black bg-white transition-all ${
                                                                isCompleted 
                                                                    ? 'bg-accent' 
                                                                    : isCompleting 
                                                                        ? 'bg-primary' 
                                                                        : 'bg-white'
                                                            }`}>
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="h-6 w-6 text-black" strokeWidth={4} />
                                                                ) : isCompleting ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                                                                ) : (
                                                                    <div className={`h-full w-full bg-white`}/>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-lg font-black uppercase leading-tight transition-all ${
                                                                    isCompleted ? 'line-through decoration-black decoration-4' : 'text-black'
                                                                }`}>{taskTitle}</p>
                                                                {task.estimatedHours && (
                                                                    <div className="flex items-center gap-2 mt-2 text-sm text-black font-black uppercase bg-primary w-fit px-2 border-2 border-black shadow-hard">
                                                                        <Clock className="h-4 w-4" />
                                                                        {task.estimatedHours}h
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {task.description && (
                                                            <div className={`pl-12 text-sm font-medium leading-relaxed mb-4 ${isCompleted ? 'text-black/60 line-through decoration-black/60' : 'text-black'}`}>
                                                                {task.description}
                                                            </div>
                                                        )}
                                                        
                                                        {task.resources && task.resources.length > 0 && (
                                                            <div className="pl-12 flex flex-wrap gap-3 mt-auto pt-4 border-t-4 border-black">
                                                                {task.resources.map((res, rIdx: number) => (
                                                                    res.url ? (
                                                                        <a 
                                                                            key={rIdx} 
                                                                            href={res.url} 
                                                                            target="_blank" 
                                                                            rel="noreferrer"
                                                                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black shadow-hard flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-none transition-all ${
                                                                                isCompleted 
                                                                                    ? 'bg-muted' 
                                                                                    : 'bg-white text-black'
                                                                            }`}
                                                                        >
                                                                            {res.type === 'video' ? <PlayCircle className="h-4 w-4" /> : 
                                                                              res.type === 'book' ? <BookOpen className="h-4 w-4" /> :
                                                                              res.type === 'documentation' || res.type === 'article' ? <FileText className="h-4 w-4" /> :
                                                                              <Globe className="h-4 w-4" />}
                                                                            {res.title}
                                                                        </a>
                                                                    ) : (
                                                                        <span key={rIdx} className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black shadow-hard flex items-center gap-2 ${
                                                                            isCompleted 
                                                                                ? 'bg-muted' 
                                                                                : 'bg-secondary text-black'
                                                                        }`}>
                                                                            {res.title}
                                                                        </span>
                                                                    )
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    
                                    {tasks.length === 0 && (
                                        <p className="text-[#2B2D2B]/40 italic text-sm">No specific tasks defined for this week.</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Project Suggestions */}
            {projectSuggestions.length > 0 && (
                <div className="mt-20 px-2 border-t-4 border-black pt-16">
                    <div className="flex items-center gap-6 mb-12 bg-white border-4 border-black p-6 shadow-hard-lg">
                        <div className="h-16 w-16 bg-secondary border-4 border-black flex items-center justify-center shadow-hard">
                            <Sparkles className="h-8 w-8 text-black" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tight text-black">Suggested Projects</h2>
                            <p className="text-sm font-black uppercase tracking-widest text-black/60 mt-2">Build these to strengthen your portfolio for the target role.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projectSuggestions.map((project: { title?: string; description?: string; technologies?: string[] } | string, idx: number) => {
                            const projectObj = typeof project === 'string' ? { title: project } : project
                            return (
                                <div key={idx} className="bg-white border-4 border-black p-8 shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-none transition-transform cursor-default flex flex-col">
                                    <h4 className="text-2xl font-black uppercase text-black mb-4">{projectObj.title}</h4>
                                    {projectObj.description && <p className="text-sm font-medium text-black/80 leading-relaxed mb-6">{projectObj.description}</p>}
                                    {projectObj.technologies && (
                                        <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t-4 border-black">
                                            {projectObj.technologies.map((tech: string, tIdx: number) => (
                                                <span key={tIdx} className="px-3 py-1.5 bg-accent border-2 border-black text-black text-xs font-black uppercase shadow-hard">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
