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
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-white/30 mb-4" />
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">No Progress Data</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You haven't completed onboarding yet. Start your journey by completing the onboarding process.
        </p>
        <Button variant="glow" onClick={() => window.location.href = '/dashboard/onboarding'}>
          Start Onboarding <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )
  }

  const { progress: p, assessment, skillProgress, history } = progress

  return (
    <div className="w-full pb-20 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-[48px] font-heading font-medium tracking-tight text-white mb-2">
          Progress Tracker
        </h1>
        <p className="text-[16px] text-white/60 max-w-xl">
          Track your journey to becoming a {assessment?.roleName || 'better developer'}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-lime-400/10">
              <Trophy className="h-5 w-5 text-lime-400" />
            </div>
            <span className="text-sm text-white/60">Overall Score</span>
          </div>
          <p className="text-3xl font-bold text-white">{assessment?.overallScore || 0}%</p>
          <p className="text-xs text-white/40 mt-1">Readiness for {assessment?.roleName}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-400/10">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-sm text-white/60">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{p.streakDays} <span className="text-lg font-normal text-white/60">days</span></p>
          <p className="text-xs text-white/40 mt-1">Keep it up!</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-white/60">Tasks Done</span>
          </div>
          <p className="text-3xl font-bold text-white">{p.completedTasksCount} <span className="text-lg font-normal text-white/60">/ {p.totalTasks}</span></p>
          <p className="text-xs text-white/40 mt-1">{Math.round((p.completedTasksCount / p.totalTasks) * 100)}% complete</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-400/10">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm text-white/60">Est. Time Left</span>
          </div>
          <p className="text-3xl font-bold text-white">{p.estimatedDaysRemaining} <span className="text-lg font-normal text-white/60">days</span></p>
          <p className="text-xs text-white/40 mt-1">To achieve your goal</p>
        </motion.div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-lime-400" />
            <span className="font-semibold text-white">Overall Progress</span>
          </div>
          <span className="text-2xl font-bold text-lime-400">{p.percentage}%</span>
        </div>
        <Progress value={p.percentage} className="h-3 bg-white/10" />
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>{p.completedMilestones} of {p.totalMilestones} milestones</span>
          <span>{p.completedTasksCount} tasks completed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'tasks', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-white/40">No recent activity. Start completing tasks!</p>
              ) : (
                history.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="p-1.5 rounded-lg bg-lime-400/10 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{item.description}</p>
                      <p className="text-xs text-white/40">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skills Overview */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Skills Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Mastered</span>
                  <span className="text-white">{stats?.skills.mastered || 0} / {stats?.skills.totalRequired || 0}</span>
                </div>
                <Progress value={stats?.skills.coverage || 0} className="h-2 bg-white/10" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Projects Completed</span>
                  <span className="text-white">{p.completedProjects.length}</span>
                </div>
                <Progress 
                  value={(p.completedProjects.length / (stats?.projects.suggestions || 1)) * 100} 
                  className="h-2 bg-white/10" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Milestones</span>
                  <span className="text-white">{p.completedMilestones} / {p.totalMilestones}</span>
                </div>
                <Progress 
                  value={(p.completedMilestones / p.totalMilestones) * 100} 
                  className="h-2 bg-white/10" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-lime-400" />
              Your Learning Tasks
            </h3>
            <span className="text-sm text-white/60">
              {p.completedTasksCount} / {p.totalTasks} completed
            </span>
          </div>
          
          {skillProgress.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/60">No tasks available. Complete onboarding to get your roadmap.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {skillProgress.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    task.completed 
                      ? 'bg-lime-400/5 border-lime-400/20' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-lime-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-white/30" />
                    )}
                    <div>
                      <p className={`font-medium ${task.completed ? 'text-lime-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-white/40">Week {task.milestoneWeek}</p>
                    </div>
                  </div>
                  {!task.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeTask(task.id, task.milestoneWeek)}
                      disabled={completingTask === task.id}
                      className="text-lime-400 hover:text-lime-300 hover:bg-lime-400/10"
                    >
                      {completingTask === task.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Complete <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-400" />
              Skills Mastered
            </h3>
            <span className="text-sm text-white/60">
              {p.completedSkills.length} skills
            </span>
          </div>

          {p.completedSkills.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/60">No skills marked as mastered yet. Complete tasks to build your skills!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {p.completedSkills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-lime-400/5 border border-lime-400/20"
                >
                  <Award className="h-4 w-4 text-lime-400" />
                  <span className="text-sm text-lime-400">{skill}</span>
                </div>
              ))}
            </div>
          )}

          {/* Completed Projects */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Projects Completed
              </h3>
              <span className="text-sm text-white/60">
                {p.completedProjects.length} projects
              </span>
            </div>

            {p.completedProjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10">
                <p className="text-white/60">No projects completed yet. Check your roadmap for project suggestions!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {p.completedProjects.map((project, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-purple-400/5 border border-purple-400/20"
                  >
                    <Trophy className="h-5 w-5 text-purple-400" />
                    <span className="text-white">{project}</span>
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
