"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Play, Pause, Clock, Calendar as CalendarIcon, CheckCircle2, Circle, MoreVertical, Building, Users, Briefcase, Layout, ChevronDown, Monitor } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { useStore } from "@/lib/store"
import { useAuth } from "@/contexts/AuthContext"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const { user } = useAuth()
    const { assessment, setAssessment } = useStore()
    const [loading, setLoading] = useState(true)
    const [progressData, setProgressData] = useState<any>(null)
    const [localTasks, setLocalTasks] = useState<any[]>([])

    useEffect(() => {
        // Load cached tasks from localStorage if they exist
        const cachedTasks = localStorage.getItem('gapsense_local_tasks')
        const initialCachedTasks = cachedTasks ? JSON.parse(cachedTasks) : null

        Promise.all([
            api.get("/assessments/latest").catch(() => null),
            api.get("/progress").catch(() => null)
        ]).then(([resA, resP]) => {
            if (resA?.data?.assessment) setAssessment(resA.data.assessment)
            
            if (resP?.data && !resP.data.error) {
                setProgressData(resP.data.progress)
                if (!initialCachedTasks) setLocalTasks(resP.data.skillProgress || [])
            } else if (resA?.data?.assessment && !initialCachedTasks) {
                // Fallback if progress doesn't exist AND no cache exists
                const defaultTasks = resA.data.assessment.roadmap?.milestones?.flatMap((m: any, idx: number) => 
                    (m.tasks || []).map((t: any) => ({
                        id: t.id || t._id || Math.random().toString(),
                        title: t.title,
                        completed: false,
                        estimatedHours: t.estimatedHours || 1.5,
                        milestoneWeek: idx + 1
                    }))
                ) || []
                setLocalTasks(defaultTasks)
            }
            
            if (initialCachedTasks) {
                setLocalTasks(initialCachedTasks)
            }
        }).finally(() => setLoading(false))
    }, [setAssessment])

    // Sync tasks to local storage whenever they change
    useEffect(() => {
        if (localTasks.length > 0) {
            localStorage.setItem('gapsense_local_tasks', JSON.stringify(localTasks))
        }
    }, [localTasks])

    const handleToggleTask = async (taskId: string, currentStatus: boolean, milestoneWeek: number) => {
        if (currentStatus) return;

        setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))

        try {
            const res = await api.post('/progress/complete-task', { taskId, milestoneWeek })
            // Only update backend-dependent stats if it succeeded
            if (res.data?.progress) {
                setProgressData((prev: any) => ({
                    ...prev,
                    percentage: res.data.progress.percentage,
                }))
            }
        } catch (e: any) {
             // Silently catch 404 backend errors so UI continues to work flawlessly
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-black/10 border-t-primary animate-spin" />
            </div>
        )
    }

    const subScores = assessment?.subScores?.length ? assessment.subScores : [
        { label: "Interviews", value: 15 },
        { label: "Hired", value: 15 },
        { label: "Project time", value: 60 },
        { label: "Output", value: 10 }
    ]

    const completedTasksCount = localTasks.filter((t: any) => t.completed).length
    const progressPercent = localTasks.length > 0 ? Math.round((completedTasksCount / localTasks.length) * 100) : 0

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 pt-16 text-[#1B1C1D]">
            {/* Top Hero Section: Welcome & Massive Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-12 px-2">
                <div className="flex-grow space-y-12">
                    <h1 className="text-7xl lg:text-[100px] font-heading font-normal tracking-tight text-[#1B1C1D] leading-[0.9] -ml-1">
                        Welcome in, {user?.name?.split(' ')[0] || 'User'}
                    </h1>
                    
                    {/* Hero Status Progress Pills */}
                    <div className="flex flex-wrap items-center gap-8">
                        {subScores.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-3 min-w-[140px]">
                                <span className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em]">{item.label}</span>
                                <div className={cn(
                                    "h-16 rounded-full flex items-center p-1.5 overflow-hidden transition-all duration-700 hover:scale-[1.02] cursor-pointer",
                                    idx === 0 ? "bg-[#1B1C1D] w-32 border border-white/10" :
                                    idx === 1 ? "bg-primary w-32 border border-black/5 shadow-md" :
                                    idx === 2 ? "bg-white/40 border border-black/5 relative w-72 backdrop-blur-md" :
                                    "border border-black/10 w-40 bg-white/20"
                                )}>
                                    {idx === 2 && (
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.02)_75%,transparent_75%,transparent_100%)] bg-[length:14px_14px]" />
                                    )}
                                    <div 
                                        className={cn(
                                            "h-full flex items-center px-5 rounded-full text-[13px] font-bold relative z-10 transition-all duration-[1.5s] ease-out",
                                            idx === 0 ? "text-white/50" :
                                            idx === 1 ? "text-foreground/70" :
                                            idx === 2 ? "bg-white border border-black/5 shadow-sm text-foreground/80" :
                                            "text-foreground/30"
                                        )}
                                        style={{ width: idx === 2 ? `${Math.max(15, progressPercent)}%` : '100%' }}
                                    >
                                        {idx === 2 ? `${progressPercent}%` : `${item.value || 0}%`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Massive Numbers Display Right Side */}
                <div className="flex flex-wrap justify-end gap-16 pr-6">
                    <div className="flex items-center gap-6 group transition-transform hover:-translate-y-1">
                        <div className="h-14 w-1 flex flex-col justify-between py-1 opacity-20">
                            <div className="w-full h-1 bg-foreground rounded-full" />
                            <div className="w-full h-1 bg-foreground rounded-full" />
                            <div className="w-full h-1 bg-foreground rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-8xl font-light tracking-tighter leading-none text-[#1B1C1D]">{assessment?.overallScore || 0}</span>
                            <span className="text-[11px] font-bold text-foreground/40 mt-2 uppercase tracking-[0.25em]">Readiness Score</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group transition-transform hover:-translate-y-1">
                         <div className="h-14 w-1 flex flex-col justify-between py-1 opacity-20">
                            <div className="w-full h-1 bg-foreground rounded-full" />
                            <div className="w-full h-1 bg-foreground rounded-full" />
                            <div className="w-full h-1 bg-foreground rounded-full" />
                        </div>
                        <div className="flex flex-col text-right lg:text-left">
                            <span className="text-8xl font-light tracking-tighter leading-none text-[#1B1C1D]">{assessment?.gaps?.length || 0}</span>
                            <span className="text-[11px] font-bold text-foreground/40 mt-2 uppercase tracking-[0.25em]">Skill Gaps Identified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid System */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* LEFT COLUMN: Profile & Details */}
                <div className="lg:col-span-3 flex flex-col gap-10">
                    <PremiumCard padding="none" className="h-[560px] overflow-hidden group relative shadow-[0_40px_80px_rgb(0,0,0,0.08)]">
                        <img 
                            src={user?.picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000"} 
                            className="w-full h-full object-cover object-top opacity-95 transition-transform duration-[4s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-8">
                            <div>
                                <h3 className="text-white text-5xl font-medium tracking-tight mb-2 leading-none">{user?.name || "User"}</h3>
                                <p className="text-white/40 text-lg font-medium">{assessment?.roleId?.name || "Target Role"}</p>
                            </div>
                            <div className="px-8 py-4 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 text-white w-fit shadow-2xl font-bold text-xs uppercase tracking-widest">
                                $1,200 Credits / Readiness {assessment?.overallScore}%
                            </div>
                        </div>
                    </PremiumCard>

                    <div className="flex flex-col gap-2">
                        <SidebarItem label="Preparation Status" expanded icon={<Monitor className="h-5 w-5" />} subLabel={assessment?.roleId?.name} subValue={`Level ${Math.floor((assessment?.overallScore || 0) / 10)}`} />
                        <SidebarItem label="Skill Roadmap" />
                        <SidebarItem label="Interview Analytics" />
                        <SidebarItem label="Resource Library" />
                    </div>
                </div>

                {/* MIDDLE COLUMN: Charts & Calendar */}
                <div className="lg:col-span-6 flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Progress Bar Chart */}
                        <PremiumCard className="h-[380px] flex flex-col justify-between relative shadow-premium border-white">
                            <Link href="/dashboard/roadmap" className="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white border border-black/5 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                                <ArrowUpRight className="h-5 w-5" />
                            </Link>
                            <div>
                                <h3 className="text-2xl font-medium tracking-tight px-1">Progress</h3>
                                <div className="flex items-baseline mt-2 px-1">
                                    <span className="text-6xl font-light tracking-tighter">{(completedTasksCount > 0 ? completedTasksCount * 1.5 : 0).toFixed(1)} h</span>
                                    <span className="text-[11px] font-bold text-foreground/30 ml-5 uppercase tracking-[0.1em] leading-tight text-left">Learning Time<br/>this week</span>
                                </div>
                            </div>
                            
                            <div className="flex items-end gap-3 justify-between mt-12 h-40 px-4 relative">
                                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                                    const todayIdx = new Date().getDay();
                                    const labels = ['S','M','T','W','T','F','S'];
                                    
                                    // Make progress dynamic: past days show progress, today shows current, future shows empty
                                    let height = 0;
                                    if (dayOffset < todayIdx) {
                                        height = Math.min(100, Math.max(20, (completedTasksCount * 4) + (dayOffset * 8)));
                                    } else if (dayOffset === todayIdx) {
                                        height = Math.min(100, Math.max(20, completedTasksCount * 8));
                                    } else {
                                        height = 10; // baseline for future
                                    }
                                    
                                    return (
                                        <div key={dayOffset} className="flex flex-col items-center flex-1 gap-5 relative z-10">
                                            <div className="w-2 h-32 bg-foreground/5 rounded-full relative overflow-hidden shadow-inner flex justify-end flex-col">
                                                <div 
                                                    className={cn("w-full rounded-full transition-all duration-[1.5s] ease-out shadow-sm", dayOffset === todayIdx ? "bg-primary" : "bg-foreground")}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-bold uppercase tracking-[0.2em]",
                                                dayOffset === todayIdx ? "text-primary" : "text-foreground/20"
                                            )}>
                                                {labels[dayOffset]}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div 
                                    className="absolute top-0 bg-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20 animate-pulse transition-all duration-1000 -translate-x-1/2 whitespace-nowrap z-20"
                                    style={{ left: `${(new Date().getDay() / 6) * 80 + 10}%` }}
                                >
                                    Active Now
                                </div>
                            </div>
                        </PremiumCard>

                        {/* Readiness Circle Progress */}
                        <PremiumCard variant="white" className="h-[380px] flex flex-col justify-between items-center relative shadow-premium border-black/[0.03]">
                             <button className="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white border border-black/5 shadow-sm hover:shadow-md transition-all text-foreground">
                                <ArrowUpRight className="h-5 w-5" />
                            </button>
                            <h3 className="text-2xl font-medium tracking-tight px-1 w-full text-left">Readiness</h3>
                            
                            <div className="relative w-52 h-52 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90 scale-110" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="9" strokeDasharray="5 5" />
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="#F4D03F" strokeWidth="9" strokeLinecap="round" strokeDasharray="276" strokeDashoffset={276 - (276 * (assessment?.overallScore || 0)) / 100} className="transition-all duration-[2s] ease-out drop-shadow-xl" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-6xl font-light tracking-tighter leading-none">{assessment?.overallScore || 0}%</span>
                                    <span className="text-[11px] font-bold text-foreground/30 mt-2 uppercase tracking-[0.2em]">Total Match</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-full mt-4">
                                <Link href="/dashboard/coach" className="w-full">
                                    <button className="h-14 px-10 bg-foreground text-white rounded-full shadow-2xl flex items-center justify-center font-bold text-sm hover:bg-black hover:scale-105 transition-all w-full">
                                        Start AI Coaching Session
                                    </button>
                                </Link>
                            </div>
                        </PremiumCard>
                    </div>

                    {/* Minimalist Calendar / Deployment Schedule */}
                    <PremiumCard className="min-h-[460px] flex flex-col shadow-premium border-white p-0 overflow-hidden group">
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[11px] font-bold text-foreground/40 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-black/5 hover:bg-white transition cursor-pointer uppercase tracking-[0.2em]">{assessment?.roadmap?.duration || 0} Day Sprint</span>
                                <h3 className="text-2xl font-medium tracking-tight">Deployment Schedule</h3>
                                <div className="flex gap-2">
                                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white border border-black/5 transition-all">
                                        <ArrowUpRight className="h-4 w-4 rotate-[225deg]" />
                                    </button>
                                     <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white border border-black/5 transition-all">
                                        <ArrowUpRight className="h-4 w-4 rotate-45" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-4 px-2 text-[11px] font-black text-foreground/30 uppercase tracking-[0.25em]">
                                <span>Mo</span>
                                <span>Tu</span>
                                <span>We</span>
                                <span>Th</span>
                                <span>Fr</span>
                                <span>Sa</span>
                                <span>Su</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 px-8 pb-8 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-x-8 inset-y-0 grid grid-cols-7 gap-4 z-0">
                                {Array.from({length: 7}).map((_, i) => (
                                    <div key={i} className="border-l border-black/[0.03] h-full" />
                                ))}
                            </div>
                            <div className="absolute inset-x-8 inset-y-0 grid grid-rows-4 gap-4 z-0">
                                {Array.from({length: 4}).map((_, i) => (
                                    <div key={i} className="border-t border-black/[0.03] w-full mt-8" />
                                ))}
                            </div>

                            {/* Calendar Days & Events Overlay */}
                            <div className="grid grid-cols-7 grid-rows-4 gap-y-12 gap-x-4 h-full relative z-10 pt-2">
                                {/* Week 1 */}
                                <div className="text-sm font-bold text-foreground/40 text-center">26</div>
                                <div className="text-sm font-bold text-foreground/40 text-center">27</div>
                                <div className="text-sm font-bold text-foreground/40 text-center">28</div>
                                <div className="text-sm font-bold text-foreground text-center bg-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm border border-black/5">29</div>
                                <div className="text-sm font-bold text-foreground/40 text-center">30</div>
                                <div className="text-sm font-bold text-foreground/40 text-center">31</div>
                                <div className="text-sm font-bold text-foreground/40 text-center text-primary">1</div>

                                {/* Event spanning multiple days - Dark Theme */}
                                <div className="col-start-2 col-span-3 row-start-1 mt-6 h-16 bg-[#1A1A1A] rounded-2xl shadow-xl flex items-center justify-between p-4 border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer absolute w-[40%] left-[15%] z-20">
                                     <div className="max-w-[140px]">
                                        <p className="text-xs font-bold truncate tracking-wide text-white/90">Foundation UI</p>
                                        <p className="text-[10px] text-white/40 mt-1 truncate uppercase font-bold tracking-widest">Active Sprint</p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="h-6 w-6 rounded-full bg-white/10 border border-black" />
                                        <div className="h-6 w-6 rounded-full bg-white/20 border border-black" />
                                    </div>
                                </div>

                                {/* Week 2 */}
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">2</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">3</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">4</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">5</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">6</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">7</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-4">8</div>

                                 {/* Event spanning multiple days - Light Theme (overlapping) */}
                                <div className="col-start-4 col-span-4 row-start-2 mt-4 h-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-between p-4 border border-black/5 hover:scale-[1.02] transition-transform cursor-pointer absolute w-[50%] right-[5%] top-[25%] z-30">
                                     <div className="max-w-[160px]">
                                        <p className="text-xs font-bold truncate tracking-wide text-foreground">Backend Integ...</p>
                                        <p className="text-[10px] text-foreground/40 mt-1 truncate uppercase font-bold tracking-widest">Planning Phase</p>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                                        <Clock className="h-3 w-3 text-foreground" />
                                    </div>
                                </div>

                                {/* Week 3 */}
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">9</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">10</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">11</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">12</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">13</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">14</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-8">15</div>
                                
                                {/* Event - Yellow theme */}
                                 <div className="row-start-3 mt-12 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center p-4 hover:scale-[1.02] transition-transform cursor-pointer absolute w-[25%] left-[30%] top-[50%] z-20">
                                     <p className="text-xs font-extrabold truncate text-foreground uppercase tracking-widest">Review</p>
                                </div>

                                {/* Week 4 */}
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">16</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">17</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">18</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">19</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">20</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">21</div>
                                <div className="text-sm font-bold text-foreground/40 text-center mt-12">22</div>
                             </div>
                        </div>
                    </PremiumCard>
                </div>

                {/* RIGHT COLUMN: Tasks & Goals */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-premium overflow-hidden min-h-[900px]">
                    <div className="p-12 pb-8">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-3xl font-medium tracking-tight">Onboarding</h3>
                                <p className="text-[11px] font-bold text-foreground/30 mt-2 uppercase tracking-[0.2em]">{assessment?.roleId?.name}</p>
                            </div>
                            <span className="text-5xl font-light tracking-tighter leading-none">{progressPercent}%</span>
                        </div>
                        
                        <div className="flex gap-4 items-end h-24 mb-12">
                            <div className="flex-[2.5]">
                                <div className="text-[11px] font-bold text-foreground/40 mb-4 uppercase tracking-[0.2em]">Overall Progress</div>
                                <div className="h-14 bg-primary flex items-center px-6 rounded-2xl border border-primary/20 shadow-lg group cursor-pointer hover:scale-[1.02] transition-all">
                                    <span className="text-xs font-black uppercase tracking-widest text-foreground/80">Goal Roadmap</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="h-14 bg-foreground rounded-2xl flex items-center px-3 border border-white/10 shadow-2xl relative overflow-hidden">
                                     <div 
                                        className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-[1s]"
                                        style={{ width: `${progressPercent}%` }}
                                     />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="m-6 mt-0 flex-grow p-12 bg-[#1A1A1A] rounded-[2.5rem] text-white flex flex-col shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -ml-16 -mb-16 opacity-30" />
                        
                        <div className="flex justify-between items-start mb-14 relative z-10">
                            <div>
                                <h4 className="text-3xl font-light tracking-tight">Project Tasks</h4>
                                <p className="text-white/20 text-[11px] mt-2 uppercase tracking-[0.25em] font-bold">Priority Milestone</p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-light text-white leading-none">{completedTasksCount}</span>
                                <span className="text-white/20 text-xl font-light">/ {localTasks.length}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-12 overflow-y-auto custom-scrollbar pr-4 relative z-10 h-[500px]">
                             {localTasks.length > 0 ? localTasks.map((task: any, i: number) => {
                                 // Determine Status: done, doing, not started
                                 const isDone = task.completed;
                                 const isDoing = !isDone && (i === 0 || localTasks[i-1].completed);

                                 return (
                                    <div 
                                        key={task.id || i}
                                        onClick={() => handleToggleTask(task.id, isDone, task.milestoneWeek)}
                                        className={cn(
                                            "flex items-center gap-8 group transition-all",
                                            isDone ? "opacity-30 cursor-default" : "cursor-pointer hover:translate-x-2"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                                            isDone ? "bg-white/5 border-transparent text-primary" : 
                                            isDoing ? "bg-white/10 border-primary/50 text-white shadow-[0_0_15px_rgba(244,208,63,0.3)]" :
                                            "bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-primary/50"
                                        )}>
                                            {isDone ? (
                                                <CheckCircle2 className="h-6 w-6" strokeWidth={3} />
                                            ) : isDoing ? (
                                                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                            ) : (
                                                <div className="h-2.5 w-2.5 rounded-[3px] rotate-45 bg-white/20 group-hover:bg-primary transition-all group-hover:scale-125" />
                                            )}
                                        </div>
                                        <div className="flex-grow pb-10 border-b border-white/5 group-last:border-none">
                                            <p className={cn(
                                                "text-[17px] font-medium leading-snug transition-colors",
                                                isDone ? "text-white/50 line-through decoration-white/20" : "text-white group-hover:text-primary/90"
                                            )}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                 <span className={cn(
                                                     "text-[10px] uppercase tracking-[0.25em] font-black transition-colors",
                                                     isDone ? "text-white/20" : isDoing ? "text-primary/70" : "text-white/30 group-hover:text-primary/50"
                                                 )}>
                                                    {isDone ? "Completed" : isDoing ? "Active Task" : "Upcoming"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                 )
                             }) : (
                                <div className="flex flex-col items-center justify-center py-20 text-white/10">
                                    <Layout className="h-20 w-20 mb-6 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Empty Roadmap</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}

function SidebarItem({ label, icon, subLabel, subValue, expanded = false }: any) {
    return (
        <div className="w-full flex flex-col group cursor-pointer mb-2">
            <div className="flex justify-between items-center py-4 px-6 hover:bg-black/5 rounded-[1.5rem] transition">
                <span className="text-[15px] font-semibold text-foreground/80">{label}</span>
                <ChevronDown className={cn("h-5 w-5 text-foreground/20 transition-transform", expanded && "rotate-180")} />
            </div>
            {expanded && (
                <div className="mt-2 mx-2 p-5 bg-white border border-black/5 rounded-[1.5rem] shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 flex items-center justify-center overflow-hidden relative shadow-inner">
                             {icon}
                             <div className="absolute top-0 right-0 h-full w-1/2 bg-white/10 skew-x-[-20deg] transform origin-top" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{subLabel}</p>
                            <p className="text-xs text-foreground/40 font-medium">{subValue}</p>
                        </div>
                    </div>
                    <MoreVertical className="h-4 w-4 text-foreground/20" />
                </div>
            )}
        </div>
    )
}

