"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Trophy, Target, Zap, Clock, Calendar, TrendingUp, 
  CheckCircle2, Circle, ChevronRight, Flame, Award,
  BookOpen, Code2, Layers, ArrowRight, Loader2, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PremiumCard } from "@/components/ui/PremiumCard"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface ProgressData {
  progress: {
    id: string
    percentage: number
    estimatedDaysRemaining: number
    streakDays: number
    lastActivityDate: string
    completedTasksCount: number
    totalTasks: number
    completedMilestones: number
    totalMilestones: number
    completedProjects: string[]
    completedSkills: string[]
  }
  skillProgress: Array<{
    id: string
    title: string
    completed: boolean
    completedAt?: string
    milestoneWeek: number
  }>
  history: Array<{
    date: string
    type: string
    description: string
    metadata?: any
  }>
  assessment: {
    id: string
    overallScore: number
    roleName: string
  } | null
}

interface StatsData {
  overall: {
    progressPercentage: number
    daysRemaining: number
    streakDays: number
    weeklyActivity: number
  }
  skills: {
    totalRequired: number
    mastered: number
    coverage: number
  }
  projects: {
    completed: number
    suggestions: number
  }
  milestones: {
    total: number
    completed: number
  }
}

export default function ProgressPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'skills'>('overview')
  const [completingTask, setCompletingTask] = useState<string | null>(null)

  useEffect(() => {
    fetchProgress()
    fetchStats()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await api.get('/progress')
      setProgress(res.data)
    } catch (error: any) {
      console.error('Failed to fetch progress:', error)
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load progress data.",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/progress/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const completeTask = async (taskId: string, milestoneWeek: number) => {
    setCompletingTask(taskId)
    try {
      await api.post('/progress/complete-task', {
        taskId,
        milestoneWeek
      })
      toast({
        title: "Success",
        description: "Task completed! Keep up the momentum!",
      })
      fetchProgress()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to complete task.",
        variant: "destructive"
      })
    } finally {
      setCompletingTask(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-black/10 border-t-primary animate-spin" />
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center shadow-sm mb-6">
          <AlertCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-heading font-medium text-[#111] mb-3">No Progress Data</h2>
        <p className="text-[#2B2D2B]/60 max-w-md mb-8 text-[16px]">
          You haven&apos;t completed onboarding yet. Start your journey by completing the onboarding process.
        </p>
        <button onClick={() => window.location.href = '/dashboard/onboarding'} className="px-8 py-3 bg-[#111] text-white rounded-full font-semibold hover:bg-black transition shadow-lg flex items-center gap-2">
          Start Onboarding <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const { progress: p, assessment, skillProgress, history } = progress

  return (
    <div className="w-full pb-20 text-black">
      {/* Header */}
      <div className="mb-12 border-b-4 border-black pb-8">
        <h1 className="text-4xl lg:text-[60px] font-black uppercase tracking-tighter text-black mb-4 leading-none">
          Progress Tracker
        </h1>
        <p className="text-[16px] font-black uppercase tracking-widest text-black/80 max-w-xl">
          Track your journey to becoming a <span className="text-black bg-primary px-1 border-2 border-black">{assessment?.roleName || 'better developer'}</span>.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <PremiumCard className="p-8 h-full bg-white border-4 border-black shadow-hard rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 border-4 border-black bg-amber-300 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Trophy className="h-6 w-6 text-black" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black">Overall Score</span>
              </div>
              <p className="text-5xl font-black tracking-tighter text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2 w-fit mb-4">{assessment?.overallScore || 0}<span className="text-xl font-bold ml-1">%</span></p>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/80 bg-accent px-2 border-2 border-black w-fit mt-auto">Readiness for {assessment?.roleName}</p>
          </PremiumCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <PremiumCard className="p-8 h-full bg-white border-4 border-black shadow-hard rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 border-4 border-black bg-orange-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Flame className="h-6 w-6 text-black" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black">Current Streak</span>
              </div>
              <p className="text-5xl font-black tracking-tighter text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2 w-fit mb-4">{p.streakDays} <span className="text-xl font-bold">days</span></p>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/80 bg-accent px-2 border-2 border-black w-fit mt-auto">Keep it up!</p>
          </PremiumCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <PremiumCard className="p-8 h-full bg-white border-4 border-black shadow-hard rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 border-4 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black">Tasks Done</span>
              </div>
              <p className="text-5xl font-black tracking-tighter text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2 w-fit mb-4">{p.completedTasksCount} <span className="text-xl font-bold">/ {p.totalTasks}</span></p>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/80 bg-accent px-2 border-2 border-black w-fit mt-auto">{p.totalTasks > 0 ? Math.round((p.completedTasksCount / p.totalTasks) * 100) : 0}% complete</p>
          </PremiumCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-8 h-full bg-white border-4 border-black shadow-hard rounded-none flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 border-4 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-black">Est. Time Left</span>
              </div>
              <p className="text-5xl font-black tracking-tighter text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2 w-fit mb-4">{p.estimatedDaysRemaining} <span className="text-xl font-bold">days</span></p>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/80 bg-accent px-2 border-2 border-black w-fit mt-auto">To achieve your goal</p>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Main Progress Bar */}
      <PremiumCard className="mb-12 p-8 lg:p-12 bg-white border-4 border-black shadow-hard rounded-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border-4 border-black bg-primary flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Target className="h-5 w-5 text-black" />
            </div>
            <span className="text-2xl font-black uppercase tracking-widest text-black">Overall Progress</span>
          </div>
          <span className="text-3xl font-black tracking-tight text-black bg-primary px-3 py-1 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">{p.percentage}%</span>
        </div>
        
        {/* Brutalist Progress Bar */}
        <div className="h-10 w-full bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex items-center">
          <div 
            className="h-full bg-primary border-r-4 border-black transition-all duration-1000 ease-out"
            style={{ width: `${p.percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-6">
          <span className="text-xs font-black uppercase tracking-widest text-black bg-white px-2 border-2 border-black">{p.completedMilestones} of {p.totalMilestones} milestones</span>
          <span className="text-xs font-black uppercase tracking-widest text-black bg-white px-2 border-2 border-black">{p.completedTasksCount} tasks completed</span>
        </div>
      </PremiumCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {(['overview', 'tasks', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-sm font-black uppercase tracking-widest border-4 border-black transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none ${
              activeTab === tab 
                ? 'bg-black text-white' 
                : 'bg-white text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Recent Activity */}
          <PremiumCard className="p-8 lg:p-10 bg-white border-4 border-black shadow-hard rounded-none">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 border-4 border-black bg-amber-300 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-black">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-[15px] font-bold uppercase text-black/60 bg-accent px-4 py-2 border-2 border-black w-fit">No recent activity. Start completing tasks!</p>
              ) : (
                history.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-white border-4 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 transition-transform">
                    <div className="h-8 w-8 border-4 border-black bg-primary flex items-center justify-center mt-1 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <p className="text-[15px] font-black uppercase tracking-tight text-black mb-1 leading-tight">{item.description}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/60 bg-white border-2 border-black px-2 py-0.5 w-fit">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>

          {/* Skills Overview */}
          <PremiumCard className="p-8 lg:p-10 bg-white border-4 border-black shadow-hard rounded-none">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 border-4 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Layers className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-black">Skills Overview</h3>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-black bg-accent px-2 border-2 border-black">Mastered</span>
                  <span className="text-2xl font-black tracking-tight text-black bg-white border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] px-3">{stats?.skills.mastered || 0} / {stats?.skills.totalRequired || 0}</span>
                </div>
                <div className="h-6 w-full bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex items-center">
                  <div className="h-full bg-blue-400 border-r-4 border-black" style={{ width: `${stats?.skills.coverage || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-black bg-accent px-2 border-2 border-black">Projects Completed</span>
                  <span className="text-2xl font-black tracking-tight text-black bg-white border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] px-3">{p.completedProjects.length}</span>
                </div>
                <div className="h-6 w-full bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex items-center">
                  <div className="h-full bg-purple-400 border-r-4 border-black" style={{ width: `${(p.completedProjects.length / (stats?.projects.suggestions || 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-black bg-accent px-2 border-2 border-black">Milestones</span>
                  <span className="text-2xl font-black tracking-tight text-black bg-white border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] px-3">{p.completedMilestones} / {p.totalMilestones}</span>
                </div>
                <div className="h-6 w-full bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex items-center">
                  <div className="h-full bg-primary border-r-4 border-black" style={{ width: `${p.totalMilestones > 0 ? (p.completedMilestones / p.totalMilestones) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase tracking-widest text-black flex items-center gap-4">
              <div className="h-12 w-12 border-4 border-black bg-primary flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <BookOpen className="h-6 w-6 text-black" />
              </div>
              Your Learning Tasks
            </h3>
            <span className="text-xl font-black uppercase tracking-tight text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2">
              {p.completedTasksCount} / {p.totalTasks} <span className="text-sm tracking-widest text-black/60 ml-2">completed</span>
            </span>
          </div>
          
          {skillProgress.length === 0 ? (
            <PremiumCard className="p-10 text-center bg-white border-4 border-black shadow-hard rounded-none">
              <p className="text-[15px] font-bold uppercase text-black/60 bg-accent px-4 py-2 border-2 border-black w-fit mx-auto">No tasks available. Complete onboarding to get your roadmap.</p>
            </PremiumCard>
          ) : (
            <div className="grid gap-6">
              {skillProgress.map((task) => (
                <div 
                  key={task.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-6 border-4 border-black rounded-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-none ${
                    task.completed 
                      ? 'bg-accent/40 opacity-80' 
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className={`h-10 w-10 border-4 border-black flex items-center justify-center shrink-0 ${task.completed ? 'bg-primary' : 'bg-white'}`}>
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-black" strokeWidth={3} />
                      ) : (
                        <Circle className="h-5 w-5 text-black/20" strokeWidth={3} />
                      )}
                    </div>
                    <div>
                      <p className={`text-xl font-black uppercase tracking-tight ${task.completed ? 'text-black line-through decoration-black decoration-4' : 'text-black'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs font-black uppercase tracking-widest text-black bg-white border-2 border-black px-2 py-0.5 w-fit mt-2">Week {task.milestoneWeek}</p>
                    </div>
                  </div>
                  {!task.completed && (
                    <button
                      onClick={() => completeTask(task.id, task.milestoneWeek)}
                      disabled={completingTask === task.id}
                      className="px-6 py-3 bg-primary border-4 border-black text-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {completingTask === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Complete <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-12">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-widest text-black flex items-center gap-4">
                <div className="h-12 w-12 border-4 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Code2 className="h-6 w-6 text-black" />
                </div>
                Skills Mastered
              </h3>
              <span className="text-xl font-black uppercase tracking-tight text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2">
                {p.completedSkills.length} <span className="text-sm tracking-widest text-black/60 ml-2">skills</span>
              </span>
            </div>

            {p.completedSkills.length === 0 ? (
              <PremiumCard className="p-10 text-center bg-white border-4 border-black shadow-hard rounded-none">
                <p className="text-[15px] font-bold uppercase text-black/60 bg-accent px-4 py-2 border-2 border-black w-fit mx-auto">No skills marked as mastered yet. Complete tasks to build your skills!</p>
              </PremiumCard>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {p.completedSkills.map((skill, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-5 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-transform"
                  >
                    <Award className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-black uppercase tracking-widest text-black truncate">{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Projects */}
          <div className="pt-8 border-t-4 border-black">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-widest text-black flex items-center gap-4">
                <div className="h-12 w-12 border-4 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <TrendingUp className="h-6 w-6 text-black" />
                </div>
                Projects Completed
              </h3>
              <span className="text-xl font-black uppercase tracking-tight text-black bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-4 py-2">
                {p.completedProjects.length} <span className="text-sm tracking-widest text-black/60 ml-2">projects</span>
              </span>
            </div>

            {p.completedProjects.length === 0 ? (
              <PremiumCard className="p-10 text-center bg-white border-4 border-black shadow-hard rounded-none">
                <p className="text-[15px] font-bold uppercase text-black/60 bg-accent px-4 py-2 border-2 border-black w-fit mx-auto">No projects completed yet. Check your roadmap for project suggestions!</p>
              </PremiumCard>
            ) : (
              <div className="grid gap-6">
                {p.completedProjects.map((project, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-6 p-6 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none hover:-translate-y-1 hover:translate-x-1 hover:shadow-none transition-transform"
                  >
                    <div className="h-10 w-10 border-4 border-black bg-purple-200 flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-xl font-black uppercase tracking-widest text-black">{project}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
