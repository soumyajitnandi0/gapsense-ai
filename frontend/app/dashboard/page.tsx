"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, CheckCircle2, MoreVertical, Layout, ChevronDown, Monitor } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { useStore, Milestone, Role } from "@/lib/store"
import { useAuth } from "@/contexts/AuthContext"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { cn, getHighResProfilePicture, getMD5 } from "@/lib/utils"

export default function DashboardPage() {
    const { user } = useAuth()
    const { assessment, setAssessment } = useStore()
    const [loading, setLoading] = useState(true)
interface Task {
    id: string
    title: string
    completed: boolean
    estimatedHours: number
    milestoneWeek: number
}

interface ProgressData {
    percentage: number
    streakDays?: number
    completedTasksCount?: number
    totalTasks?: number
}

    const [progressData, setProgressData] = useState<ProgressData | null>(null)
    const [localTasks, setLocalTasks] = useState<Task[]>([])
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date())

    useEffect(() => {
        const assessmentId = assessment?._id || 'latest';
        
        Promise.all([
            api.get(`/assessments/${assessmentId}`).catch(() => null),
            api.get(`/progress${assessment?._id ? `?assessmentId=${assessment._id}` : ''}`).catch(() => null)
        ]).then(([resA, resP]) => {
            let currentAssessment = assessment;
            if (resA?.data?.assessment && assessmentId === 'latest') {
                setAssessment(resA.data.assessment)
                currentAssessment = resA.data.assessment;
            } else if (resA?.data?.assessment) {
                currentAssessment = resA.data.assessment;
            }
            
            let completedIds = new Set<string>();
            if (resP?.data && !resP.data.error) {
                setProgressData(resP.data.progress)
                if (resP.data.skillProgress) {
                    resP.data.skillProgress.forEach((t: { id: string; completed: boolean }) => {
                        if (t.completed) completedIds.add(t.id);
                    });
                }
            }

            if (currentAssessment?.roadmap?.milestones) {
                const allTasks = currentAssessment.roadmap.milestones.flatMap((m: Milestone, idx: number) => 
                    (m.tasks || []).map((t) => ({
                        id: (t.id || t._id || `task-${idx}`) as string,
                        title: t.title || "Untitled Task",
                        completed: completedIds.has(t.id || t._id || ""),
                        estimatedHours: t.estimatedHours || 1.5,
                        milestoneWeek: m.week || idx + 1
                    }))
                );
                setLocalTasks(allTasks);
            }
            
        }).finally(() => setLoading(false))
    }, [assessment?._id])

    const handleToggleTask = async (taskId: string, currentStatus: boolean, milestoneWeek: number) => {
        if (currentStatus) return;

        // Optimistic update
        setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))

        try {
            const res = await api.post('/progress/complete-task', { 
                taskId, 
                milestoneWeek,
            })
            if (res.data?.progress) {
                setProgressData((prev: ProgressData | null) => ({
                    ...prev,
                    percentage: res.data.progress.percentage,
                }))
            }
        } catch {
             // Revert on failure
             setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: false } : t))
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
            </div>
        )
    }



    const completedTasks = localTasks.filter((t: Task) => t.completed)
    const completedTasksCount = completedTasks.length
    const totalHoursInvested = completedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    const progressPercent = localTasks.length > 0 ? Math.round((completedTasksCount / localTasks.length) * 100) : 0

    // Calendar Data Generation
    const today = new Date()
    
    // Proper Month Calendar Logic
    const firstDayOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0 = Monday, 6 = Sunday
    
    const calendarStartDate = new Date(firstDayOfMonth);
    calendarStartDate.setDate(firstDayOfMonth.getDate() - startDayOfWeek);
    
    // Standard calendar grid is 35 days (5 weeks) or 42 days (6 weeks). We'll use 35 if it fits, else 42.
    const daysInMonth = lastDayOfMonth.getDate();
    const totalCells = (startDayOfWeek + daysInMonth) > 35 ? 42 : 35;
    
    const calendarDays = Array.from({length: totalCells}).map((_, i) => {
        const d = new Date(calendarStartDate)
        d.setDate(calendarStartDate.getDate() + i)
        return {
            date: d.getDate(),
            fullDate: d,
            isCurrentMonth: d.getMonth() === currentMonthDate.getMonth(),
            isToday: d.toDateString() === today.toDateString()
        }
    })

    const sprintStartDate = new Date(assessment?.createdAt || today);
    // Align to Monday of the week the sprint started
    const sprintStartMonday = new Date(sprintStartDate);
    const sprintDayOfWeek = sprintStartMonday.getDay() === 0 ? 6 : sprintStartMonday.getDay() - 1;
    sprintStartMonday.setDate(sprintStartMonday.getDate() - sprintDayOfWeek);

    const milestones = assessment?.roadmap?.milestones || []
    interface CalendarEvent {
        id?: string
        title?: string
        milestoneTitle?: string
        date: Date
        theme: string
    }
    const calendarEvents: CalendarEvent[] = [];
    
    milestones.forEach((m: Milestone, mIdx: number) => {
        const week = m.week || (mIdx + 1);
        const tasks = m.tasks || [];
        
        tasks.forEach((task: import("@/lib/store").Task, tIdx: number) => {
            // Distribute tasks across the week. For example, Mon, Wed, Fri...
            const daysOffsets = [0, 2, 4, 1, 3, 5, 6]; 
            const offset = ((week - 1) * 7) + daysOffsets[tIdx % 7];
            
            const eventDate = new Date(sprintStartMonday);
            eventDate.setDate(sprintStartMonday.getDate() + offset);
            
            calendarEvents.push({
                ...task,
                milestoneTitle: m.title,
                date: eventDate,
                theme: ['dark', 'light', 'primary', 'accent'][tIdx % 4]
            });
        });
    });

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 pt-16 text-foreground">
            {/* Top Hero Section: Welcome & Massive Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-12 px-2 border-b-4 border-black pb-12">
                <div className="flex-grow">
                    <h1 className="text-7xl lg:text-[100px] font-black tracking-tighter text-foreground leading-[0.9] -ml-1 uppercase">
                        Welcome, {user?.name?.split(' ')[0] || 'User'}
                    </h1>
                </div>
                
                {/* Massive Numbers Display Right Side */}
                <div className="flex flex-wrap justify-end gap-16 pr-6">
                    <div className="flex items-center gap-6 group">
                        <div className="flex flex-col">
                            <span className="text-8xl font-black font-mono tracking-tighter leading-none text-foreground bg-primary px-4 border-4 border-black shadow-hard">{assessment?.overallScore || 0}</span>
                            <span className="text-[13px] font-black text-foreground mt-4 uppercase tracking-[0.25em] bg-white px-2 py-1 border-2 border-black w-fit">Readiness Score</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group">
                        <div className="flex flex-col text-right lg:text-left">
                            <span className="text-8xl font-black font-mono tracking-tighter leading-none text-foreground bg-secondary px-4 border-4 border-black shadow-hard">{assessment?.gaps?.length || 0}</span>
                            <span className="text-[13px] font-black text-foreground mt-4 uppercase tracking-[0.25em] bg-white px-2 py-1 border-2 border-black w-fit">Skill Gaps</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid System */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                
                {/* LEFT COLUMN: Profile & Details */}
                <div className="lg:col-span-3 flex flex-col gap-10">
                    <PremiumCard padding="none" className="h-[560px] overflow-hidden group relative rounded-none border-4 border-black shadow-hard-lg bg-zinc-900">
                        <img 
                            src={user?.picture || `https://www.gravatar.com/avatar/${user?.email ? getMD5(user.email) : '000'}?s=512&d=mp`} 
                            className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-500 [image-rendering:auto] antialiased"
                            loading="eager"
                        />
                        <div className="absolute inset-0 border-[16px] border-black pointer-events-none z-10" />
                        <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-4 z-20">
                            <div className="bg-white p-4 border-4 border-black shadow-hard">
                                <h3 className="text-black text-3xl font-black uppercase tracking-tight mb-1 leading-none">{user?.name || "User"}</h3>
                                <p className="text-black/60 text-sm font-black uppercase">{(assessment?.roleId as Role)?.name || "Target Role"}</p>
                            </div>
                        </div>
                    </PremiumCard>

                    <div className="flex flex-col gap-4">
                        <SidebarItem 
                            label="Preparation Status" 
                            expanded 
                            icon={<Monitor className="h-5 w-5" />} 
                            subLabel={(assessment?.roleId as Role)?.name || "Target Role"} 
                            subValue={`Level ${Math.floor((assessment?.overallScore || 0) / 10)}`}
                            href="/dashboard/roadmap"
                        />
                        <SidebarItem 
                            label="Skill Roadmap" 
                            href="/dashboard/roadmap"
                            subLabel={`${assessment?.roadmap?.milestones?.length || 0} Milestones`}
                            subValue="View full path"
                        />
                        <SidebarItem 
                            label="Interview Analytics" 
                            href="/dashboard/analysis"
                            subLabel={`${assessment?.gaps?.length || 0} Critical Gaps`}
                            subValue="View deep dive"
                        />
                        <SidebarItem 
                            label="Resource Library"
                        >
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {milestones.flatMap((m: Milestone) => 
                                    (m.tasks || []).flatMap((t: any) => 
                                        (t.resources || []).map((res: any) => ({
                                            title: res.title || t.title,
                                            label: res.type || 'Link',
                                            url: res.url
                                        }))
                                    )
                                ).map((res: any, idx: number) => (
                                    <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border-2 border-black hover:bg-primary transition-colors group/link">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-black/40">{res.label}</span>
                                            <span className="text-xs font-black uppercase truncate max-w-[180px]">{res.title}</span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-all" />
                                    </a>
                                ))}
                                {milestones.length === 0 && (
                                    <p className="text-[10px] font-black uppercase text-black/40 text-center py-4">No resources yet</p>
                                )}
                            </div>
                        </SidebarItem>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Charts & Calendar */}
                <div className="lg:col-span-6 flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Learning Momentum Card */}
                        <PremiumCard className="h-[420px] flex flex-col justify-between relative shadow-hard-lg border-4 border-black rounded-none overflow-hidden group">
                            {/* Accent Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -rotate-12 translate-x-12 -translate-y-12 pointer-events-none" />
                            
                            <Link href="/dashboard/roadmap" className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all z-20">
                                <ArrowUpRight className="h-6 w-6 font-black" />
                            </Link>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black uppercase tracking-tight px-2 bg-primary w-fit border-2 border-black mb-6">Momentum</h3>
                                
                                <div className="flex items-start gap-8">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black font-mono tracking-tighter leading-none">
                                                {totalHoursInvested.toFixed(1)}
                                            </span>
                                            <span className="text-3xl font-black font-mono tracking-tighter">h</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Time Invested</span>
                                    </div>

                                    <div className="h-16 w-[2px] bg-black/10 mt-2" />

                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black font-mono tracking-tighter leading-none text-accent">
                                                {progressData?.streakDays || 0}
                                            </span>
                                            <span className="text-xl font-black font-mono tracking-tighter">D</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Daily Streak</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Insight Section */}
                            <div className="mt-8 bg-black text-white p-3 border-2 border-black shadow-hard-sm relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                                    {progressData?.streakDays && progressData.streakDays > 0 
                                        ? `You're on a ${progressData.streakDays} day fire! Don't stop now.` 
                                        : "Start your first task today to build momentum."}
                                </p>
                            </div>

                            {/* Weekly Distribution Chart */}
                            <div className="flex items-end gap-2 justify-between mt-8 h-32 px-1 relative">
                                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                                    const todayIdx = new Date().getDay();
                                    const labels = ['S','M','T','W','T','F','S'];
                                    
                                    let height = 0;
                                    if (dayOffset < todayIdx) {
                                        // Mock some historical data based on total completion
                                        height = Math.min(100, Math.max(15, (completedTasksCount * 3) + (dayOffset * 5)));
                                    } else if (dayOffset === todayIdx) {
                                        // Current day completion
                                        height = Math.min(100, Math.max(15, (completedTasksCount % 5) * 20 + 20));
                                    } else {
                                        height = 8;
                                    }
                                    
                                    const isToday = dayOffset === todayIdx;
                                    
                                    return (
                                        <div key={dayOffset} className="flex flex-col items-center flex-1 gap-2 group/bar">
                                            <div className={cn(
                                                "w-full bg-white border-2 border-black relative overflow-hidden transition-all duration-300",
                                                isToday ? "h-28 shadow-hard" : "h-24 hover:h-28"
                                            )}>
                                                <div 
                                                    className={cn(
                                                        "absolute bottom-0 left-0 right-0 transition-all duration-[1s] ease-out border-t-2 border-black", 
                                                        isToday ? "bg-accent" : "bg-black"
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-black uppercase transition-colors",
                                                isToday ? "text-accent bg-black px-1" : "text-black/40 group-hover/bar:text-black"
                                            )}>
                                                {labels[dayOffset]}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </PremiumCard>

                        {/* Readiness Circle Progress */}
                        <PremiumCard variant="white" className="h-[380px] flex flex-col justify-between items-center relative shadow-hard-lg border-4 border-black rounded-none">
                             <button className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center bg-primary border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-foreground">
                                <ArrowUpRight className="h-6 w-6 font-black" />
                            </button>
                            <h3 className="text-2xl font-black uppercase tracking-tight px-1 w-full text-left bg-secondary border-2 border-black w-fit self-start">Readiness</h3>
                            
                            <div className="relative w-48 h-48 flex items-center justify-center mt-4">
                                <div className="absolute inset-0 border-8 border-black rounded-full" />
                                <div className="absolute inset-2 border-8 border-primary rounded-full" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${(assessment?.overallScore || 0)}%, 0 ${(assessment?.overallScore || 0)}%)` }} />
                                <div className="absolute flex flex-col items-center bg-white border-4 border-black p-4 shadow-hard">
                                    <span className="text-5xl font-black font-mono tracking-tighter leading-none">{assessment?.overallScore || 0}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-full mt-8">
                                <Link href="/dashboard/coach" className="w-full">
                                    <button className="h-14 bg-black text-white border-4 border-black shadow-hard flex items-center justify-center font-black text-sm uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full">
                                        START AI COACH
                                    </button>
                                </Link>
                            </div>
                        </PremiumCard>
                    </div>

                    {/* Proper Month Calendar / Deployment Schedule */}
                    <PremiumCard className="min-h-[460px] flex flex-col shadow-hard-lg border-4 border-black p-0 overflow-hidden group rounded-none bg-white">
                        <div className="p-8 pb-4 border-b-4 border-black">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black uppercase tracking-tight bg-primary px-2 border-2 border-black shadow-hard">Schedule</h3>
                                <div className="flex gap-4 items-center">
                                    <button onClick={() => { const d = new Date(currentMonthDate); d.setMonth(d.getMonth() - 1); setCurrentMonthDate(d); }} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-white shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all font-black text-xl">{"<"}</button>
                                    <span className="text-[15px] font-black uppercase tracking-widest min-w-[160px] text-center">{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                    <button onClick={() => { const d = new Date(currentMonthDate); d.setMonth(d.getMonth() + 1); setCurrentMonthDate(d); }} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-white shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all font-black text-xl">{">"}</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-7 text-center text-[13px] font-black text-black uppercase tracking-widest mb-2">
                                <span>Mo</span>
                                <span>Tu</span>
                                <span>We</span>
                                <span>Th</span>
                                <span>Fr</span>
                                <span>Sa</span>
                                <span>Su</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 relative bg-muted/30">
                            {/* Calendar Days & Events Overlay */}
                            <div className={cn("grid grid-cols-7 border-t-4 border-black h-full", totalCells === 42 ? "grid-rows-6" : "grid-rows-5")}>
                                {calendarDays.map((day, i) => {
                                    const dayEvents = calendarEvents.filter(ev => ev.date.toDateString() === day.fullDate.toDateString());
                                    
                                    return (
                                        <div key={i} className={cn("border-r-4 border-b-4 border-black p-1 flex flex-col gap-1 min-h-[100px]", day.isCurrentMonth ? "bg-white" : "bg-muted/50")}>
                                            <div className="flex justify-between items-start">
                                                <div className={cn("text-xs font-black w-6 h-6 flex items-center justify-center", day.isToday ? "bg-accent text-black border-2 border-black shadow-hard" : "text-black/60")}>
                                                    {day.date}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1 overflow-y-auto custom-scrollbar relative">
                                                {dayEvents.map((ev, idx) => (
                                                    <div key={idx} className={cn(
                                                        "text-[9px] font-black uppercase p-1 leading-tight truncate border-2 border-black transition-all hover:whitespace-normal hover:z-50 hover:relative shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                                                        ev.theme === 'dark' ? "bg-black text-white" : 
                                                        ev.theme === 'light' ? "bg-white text-black" : 
                                                        ev.theme === 'primary' ? "bg-primary text-black" : 
                                                        "bg-secondary text-black"
                                                    )} title={ev.title}>
                                                        {ev.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                    </PremiumCard>
                </div>

                {/* RIGHT COLUMN: Tasks & Goals */}
                <div className="lg:col-span-3 flex flex-col bg-white border-4 border-black shadow-hard-lg rounded-none overflow-hidden h-full max-h-[1060px]">
                    <div className="p-8 pb-8 border-b-4 border-black bg-secondary">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-4xl font-black uppercase tracking-tight bg-white border-2 border-black px-2 shadow-hard">Tasks</h3>
                            <span className="text-5xl font-black font-mono tracking-tighter leading-none bg-black text-white px-2 py-1 shadow-hard">{progressPercent}%</span>
                        </div>
                    </div>

                    <div className="m-0 flex-1 p-8 bg-background flex flex-col overflow-hidden relative">
                        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-4 relative z-10 flex-1 pb-10">
                             {localTasks.length > 0 ? localTasks.map((task: Task, i: number) => {
                                 const isDone = task.completed;
                                 const isDoing = !isDone && (i === 0 || localTasks[i-1].completed);

                                 return (
                                    <div 
                                        key={task.id || i}
                                        onClick={() => handleToggleTask(task.id, isDone, task.milestoneWeek)}
                                        className={cn(
                                            "flex items-start gap-4 p-4 border-4 border-black transition-all cursor-pointer shadow-hard bg-white",
                                            isDone ? "opacity-50" : "hover:-translate-y-1 hover:translate-x-1 hover:shadow-none",
                                            isDoing ? "bg-primary" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 flex items-center justify-center shrink-0 border-4 border-black bg-white",
                                            isDone ? "bg-accent" : ""
                                        )}>
                                            {isDone ? (
                                                <CheckCircle2 className="h-6 w-6 text-black" strokeWidth={4} />
                                            ) : (
                                                <div className="h-full w-full bg-white" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className={cn(
                                                "text-sm font-black uppercase leading-tight",
                                                isDone ? "line-through decoration-black decoration-4" : "text-black"
                                            )}>
                                                {task.title}
                                            </p>
                                        </div>
                                    </div>
                                 )
                             }) : (
                                <div className="flex flex-col items-center justify-center py-20 text-black">
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

interface SidebarItemProps {
    label: string
    icon?: React.ReactNode
    subLabel?: string
    subValue?: string
    expanded?: boolean
    href?: string
    children?: React.ReactNode
}

function SidebarItem({ label, icon, subLabel, subValue, expanded: initialExpanded = false, href, children }: SidebarItemProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded)

    return (
        <div className="w-full flex flex-col group mb-4">
            <div 
                className="flex justify-between items-center py-4 px-6 bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all cursor-pointer select-none"
                onClick={() => href && !children ? window.location.href = href : setIsExpanded(!isExpanded)}
            >
                <span className="text-[15px] font-black uppercase tracking-widest text-black">{label}</span>
                <ChevronDown 
                    className={cn("h-6 w-6 text-black transition-transform", isExpanded && "rotate-180")} 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                />
            </div>
            {isExpanded && (
                <div className="mt-4 mx-2 flex flex-col gap-3">
                    {children ? children : (
                        <Link href={href || "#"}>
                            <div className="p-6 bg-secondary border-4 border-black shadow-hard flex justify-between items-center hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-black border-2 border-black flex items-center justify-center text-white">
                                         {icon || <Monitor className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase">{subLabel || "Details Available"}</p>
                                        <p className="text-xs text-black font-black">{subValue || "Click to view more"}</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-6 w-6 text-black" />
                            </div>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}

