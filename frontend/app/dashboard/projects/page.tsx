"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Github, Globe, Star, GitBranch, Loader2, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Code2, LayoutGrid, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface Repo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    forks_count: number
    size: number
    updated_at: string
    topics: string[]
    private: boolean
}

interface Analysis {
    languages: Record<string, number>
    totalRepos: number
    totalStars: number
    totalForks: number
    topTopics: string[]
    repoTypes: {
        original: number
        forked: number
        archived: number
    }
    activity: {
        recentlyActive: number
        stale: number
    }
    complexity: {
        large: number
        medium: number
        small: number
    }
}

interface Suggestion {
    category: 'improvement' | 'portfolio' | 'learning' | 'contribution'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    action: string
}

interface TargetRole {
    title: string
    skills: string[]
}

export default function ProjectsPage() {
    const { toast } = useToast()
    const [githubConnected, setGithubConnected] = useState(false)
    const [githubUsername, setGithubUsername] = useState<string | null>(null)
    const [repos, setRepos] = useState<Repo[]>([])
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [targetRole, setTargetRole] = useState<TargetRole | null>(null)
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [connecting, setConnecting] = useState(false)

    useEffect(() => {
        checkGithubStatus()
    }, [])

    const checkGithubStatus = async () => {
        try {
            const res = await api.get('/github/status')
            setGithubConnected(res.data.connected)
            setGithubUsername(res.data.username)
            if (res.data.connected) {
                fetchRepos()
            }
        } catch (error) {
            console.error('Failed to check GitHub status:', error)
        }
    }

    const fetchRepos = async () => {
        setLoading(true)
        try {
            const res = await api.get('/github/repos')
            setRepos(res.data.repos)
            setAnalysis(res.data.stats)
            setSuggestions(res.data.suggestions)
            setTargetRole(res.data.targetRole)
        } catch (error) {
            console.error('Failed to fetch repos:', error)
            toast({
                title: "Error",
                description: "Failed to fetch GitHub repositories. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const refreshAnalysis = async () => {
        setAnalyzing(true)
        try {
            const res = await api.get('/github/repos')
            setRepos(res.data.repos)
            setAnalysis(res.data.stats)
            setSuggestions(res.data.suggestions)
            setTargetRole(res.data.targetRole)
            toast({
                title: "Analysis Updated",
                description: "AI suggestions have been refreshed based on your latest repositories.",
            })
        } catch (error) {
            console.error('Failed to refresh analysis:', error)
            toast({
                title: "Error",
                description: "Failed to refresh analysis. Please try again.",
                variant: "destructive"
            })
        } finally {
            setAnalyzing(false)
        }
    }

    const connectGithub = async () => {
        setConnecting(true)
        try {
            const res = await api.get('/github/connect')
            if (res.data.url) {
                window.location.href = res.data.url
            }
        } catch (error) {
            console.error('Failed to connect GitHub:', error)
            toast({
                title: "Error",
                description: "Failed to initiate GitHub connection.",
                variant: "destructive"
            })
            setConnecting(false)
        }
    }

    const disconnectGithub = async () => {
        try {
            await api.delete('/github/disconnect')
            setGithubConnected(false)
            setGithubUsername(null)
            setRepos([])
            setAnalysis(null)
            setSuggestions([])
            toast({
                title: "Disconnected",
                description: "GitHub account disconnected successfully."
            })
        } catch (error) {
            console.error('Failed to disconnect GitHub:', error)
            toast({
                title: "Error",
                description: "Failed to disconnect GitHub.",
                variant: "destructive"
            })
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-red-500 bg-red-50/50'
            case 'medium': return 'border-l-[#F4D03F] bg-[#FFFBF0]'
            case 'low': return 'border-l-emerald-400 bg-emerald-50/50'
            default: return 'border-l-gray-400 bg-gray-50/50'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'improvement': return <Zap className="h-5 w-5 text-[#111]" />
            case 'portfolio': return <LayoutGrid className="h-5 w-5 text-[#111]" />
            case 'learning': return <Code2 className="h-5 w-5 text-[#111]" />
            case 'contribution': return <GitBranch className="h-5 w-5 text-[#111]" />
            default: return <CheckCircle className="h-5 w-5 text-[#111]" />
        }
    }

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500 text-[#2B2D2B]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl lg:text-[48px] font-heading font-medium tracking-tight text-[#111] mb-2">Your Projects</h1>
                    <p className="text-[16px] text-[#2B2D2B]/60 max-w-xl">
                        Connect repositories or add projects manually to instantly boost your readiness score and receive architectural feedback.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-black text-white rounded-full font-medium transition shadow-lg shrink-0">
                    <PlusCircle className="h-5 w-5" />
                    Manually Add
                </button>
            </div>

            {!githubConnected ? (
                <div onClick={connectGithub} className="glass-panel border border-black/5 hover:border-primary/50 transition-all cursor-pointer rounded-[2.5rem] flex flex-col items-center justify-center p-16 text-center min-h-[400px] group shadow-sm">
                    <div className="h-24 w-24 rounded-full bg-white border border-black/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 ease-out shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {connecting ? <Loader2 className="h-10 w-10 text-[#111] animate-spin" /> : <Github className="h-10 w-10 text-[#111] relative z-10" />}
                    </div>
                    <h2 className="font-semibold text-[#111] mb-3 text-3xl tracking-tight">{connecting ? 'Connecting...' : 'Connect GitHub'}</h2>
                    <p className="text-[#2B2D2B]/60 max-w-lg text-[16px] leading-relaxed">
                        {connecting 
                            ? 'Redirecting to GitHub authorization sequence...' 
                            : 'Link your GitHub to automatically extract technical stack details, detect architectural complexity, and get personalized suggestions for your portfolio.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* GitHub Stats Overview */}
                    <div className="flex flex-wrap gap-4 lg:gap-6">
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-grow min-w-[200px] items-center gap-4 border border-black/5 shadow-sm">
                            <div className="h-14 w-14 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-sm">
                                <Github className="h-6 w-6 text-[#111]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/50 mb-1">Connected As</p>
                                <p className="text-xl font-semibold text-[#111]">@{githubUsername}</p>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-grow min-w-[200px] items-center gap-4 border border-black/5 shadow-sm">
                            <div className="h-14 w-14 rounded-full bg-[#fcedb3] border border-[#fcedb3] flex items-center justify-center shadow-sm">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/50 mb-1">Total Stars</p>
                                <p className="text-2xl font-semibold text-[#111]">{analysis?.totalStars || 0}</p>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-grow min-w-[200px] items-center gap-4 border border-black/5 shadow-sm">
                            <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <GitBranch className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/50 mb-1">Repositories</p>
                                <p className="text-2xl font-semibold text-[#111]">{analysis?.totalRepos || 0}</p>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-[2rem] flex flex-grow min-w-[200px] items-center gap-4 border border-black/5 shadow-sm">
                            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/50 mb-1">Active</p>
                                <p className="text-2xl font-semibold text-[#111]">{analysis?.activity.recentlyActive || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-10">
                        {/* Main Left Content */}
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            {/* Suggestions Section */}
                            {suggestions.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-medium tracking-tight flex items-center gap-3 text-[#111]">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <AlertCircle className="h-4 w-4 text-[#111]" />
                                            </div>
                                            AI Suggestions
                                            {targetRole?.title && (
                                                <span className="text-sm font-normal text-[#2B2D2B]/50 ml-2">
                                                    for {targetRole.title}
                                                </span>
                                            )}
                                        </h3>
                                        <button 
                                            onClick={refreshAnalysis} 
                                            disabled={analyzing}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-sm font-medium text-[#111] hover:bg-black/5 transition disabled:opacity-50 shadow-sm"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
                                            {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {suggestions.map((suggestion, idx) => (
                                            <div key={idx} className={`glass-panel p-6 rounded-[1.5rem] border-white/60 border-l-[6px] ${getPriorityColor(suggestion.priority)} shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row md:items-start gap-4 transition-transform hover:-translate-y-1 cursor-default`}>
                                                <div className="h-12 w-12 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm">
                                                    {getCategoryIcon(suggestion.category)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-[17px] text-[#111]">{suggestion.title}</h4>
                                                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-black/5 text-[#2B2D2B]/60">
                                                            {suggestion.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="text-[15px] text-[#2B2D2B]/70 mb-3 leading-relaxed">{suggestion.description}</p>
                                                    <div className="inline-flex flex-wrap items-center gap-2 bg-white/60 px-4 py-2 rounded-xl text-sm font-medium border border-black/5 text-[#111]">
                                                        <ArrowRight className="h-4 w-4 opacity-50" />
                                                        {suggestion.action}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {analysis && (
                                <>
                                    <div className="glass-panel p-8 rounded-[2rem] border border-white/60 shadow-sm bg-white/40">
                                        <h3 className="text-xl font-medium tracking-tight mb-2 text-[#111]">Tech Stack</h3>
                                        <p className="text-[14px] text-[#2B2D2B]/50 mb-6">Languages auto-detected across your Repositories</p>
                                        
                                        <div className="flex flex-wrap gap-2.5">
                                            {Object.entries(analysis.languages).map(([lang, count]) => (
                                                <div key={lang} className="inline-flex items-center gap-2 bg-white px-3 py-1.5 border border-black/5 rounded-xl shadow-sm text-sm font-semibold text-[#111]">
                                                    {lang} <span className="h-5 w-5 bg-black/5 flex items-center justify-center rounded text-[10px] text-[#2B2D2B]/60">{count as number}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="glass-panel p-8 rounded-[2rem] border border-white/60 shadow-sm bg-white/40">
                                        <h3 className="text-xl font-medium tracking-tight mb-2 text-[#111]">Core Topics</h3>
                                        <p className="text-[14px] text-[#2B2D2B]/50 mb-6">Subject matters extracted from tags</p>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.topTopics.map((topic) => (
                                                <Badge key={topic} variant="outline" className="border-black/10 bg-[#1a1a1a]/[0.02] text-[#2B2D2B]/80 font-medium px-3 py-1 text-sm rounded-lg hover:bg-[#1a1a1a]/[0.05]">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Repository List Full Width */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-medium tracking-tight text-[#111]">Your Repositories</h3>
                            <div className="flex gap-3">
                                <button onClick={fetchRepos} disabled={loading} className="h-10 w-10 flex items-center justify-center bg-white border border-black/5 shadow-sm rounded-full hover:bg-black/5 transition text-[#111] disabled:opacity-50">
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button onClick={disconnectGithub} className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded-full text-sm font-semibold hover:bg-red-50 transition shadow-sm">
                                    Disconnect
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {loading ? (
                                <div className="col-span-full py-16 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-[#111] animate-spin" />
                                </div>
                            ) : repos.length === 0 ? (
                                <div className="col-span-full glass-panel py-16 rounded-[2rem] border border-black/5 text-center">
                                    <p className="text-[#2B2D2B]/50 font-medium tracking-wide">No repositories found in your account.</p>
                                </div>
                            ) : (
                                repos.map((repo) => (
                                    <div key={repo.id} className="glass-panel p-6 rounded-[2rem] border border-white/60 hover:border-black/5 shadow-sm transition-all flex flex-col h-full bg-white/40">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-[17px] font-bold tracking-tight text-[#111] truncate pr-4">{repo.name}</h4>
                                                    <Badge variant="outline" className="bg-white border-black/5 text-[#111] shadow-sm uppercase tracking-wider text-[10px] shrink-0">
                                                        {repo.language || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                <p className="text-[14px] text-[#2B2D2B]/60 line-clamp-2 leading-relaxed mb-6 flex-1">
                                                    {repo.description || 'No description provided.'}
                                                </p>
                                                
                                                {/* Topics */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {repo.topics?.slice(0, 3).map((topic) => (
                                                        <span key={topic} className="text-[11px] px-2.5 py-1 bg-[#1a1a1a]/[0.03] rounded-md font-medium text-[#2B2D2B]/50 border border-black/[0.03]">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-5 text-sm font-semibold text-[#2B2D2B]/60 border-t border-black/5 pt-4">
                                                    <div className="flex items-center gap-1.5 hover:text-[#111] transition">
                                                        <Star className="h-4 w-4 text-yellow-500" /> {repo.stargazers_count}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 hover:text-[#111] transition">
                                                        <GitBranch className="h-4 w-4" /> {repo.forks_count}
                                                    </div>
                                                    <div className="ml-auto">
                                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#111] hover:underline underline-offset-4 decoration-primary decoration-2 rounded-full">
                                                            <Globe className="h-4 w-4" /> View Repo
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                </div>
            )}
        </div>
    )
}
