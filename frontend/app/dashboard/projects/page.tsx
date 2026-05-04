"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Github, Globe, Star, GitBranch, Loader2, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Code2, LayoutGrid, Zap, X, FolderPlus } from "lucide-react"
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

interface ManualProject {
    name: string
    description: string
    technologies: string[]
    link?: string
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

    // Manual project modal state
    const [showAddModal, setShowAddModal] = useState(false)
    const [manualProjects, setManualProjects] = useState<ManualProject[]>([])
    const [submittingProject, setSubmittingProject] = useState(false)
    const [newProject, setNewProject] = useState({ name: '', description: '', technologies: '', link: '' })

    useEffect(() => {
        checkGithubStatus()
        fetchManualProjects()
    }, [])

    const fetchManualProjects = async () => {
        try {
            const res = await api.get('/profile')
            if (res.data?.profile?.parsedData?.projects) {
                setManualProjects(res.data.profile.parsedData.projects)
            }
        } catch (error) {
            // Profile may not exist yet
        }
    }

    const submitManualProject = async () => {
        if (!newProject.name.trim() || !newProject.description.trim()) {
            toast({ title: "Missing fields", description: "Name and description are required.", variant: "destructive" })
            return
        }
        setSubmittingProject(true)
        try {
            const payload = {
                name: newProject.name,
                description: newProject.description,
                technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
                link: newProject.link || undefined
            }
            await api.post('/profile/projects', payload)
            setManualProjects(prev => [...prev, payload])
            setNewProject({ name: '', description: '', technologies: '', link: '' })
            setShowAddModal(false)
            toast({ title: "Project Added", description: `"${payload.name}" has been added to your profile.` })
        } catch (error) {
            toast({ title: "Error", description: "Failed to add project.", variant: "destructive" })
        } finally {
            setSubmittingProject(false)
        }
    }

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
                    <h1 className="text-4xl lg:text-[48px] font-black uppercase tracking-tighter text-black mb-2">Your Projects</h1>
                    <p className="text-[16px] text-black font-bold uppercase tracking-wide max-w-xl">
                        Connect repositories or add projects manually to instantly boost your readiness score and receive architectural feedback.
                    </p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-4 bg-primary border-4 border-black text-black rounded-none font-black uppercase tracking-widest transition-all shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none shrink-0">
                    <PlusCircle className="h-6 w-6" />
                    Manually Add
                </button>
            </div>

            {/* Add Project Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] p-8 w-full max-w-lg mx-4 border-4 border-black" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-primary flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                    <FolderPlus className="h-6 w-6 text-black" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-widest text-black">Add Project</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="h-10 w-10 bg-accent border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-black uppercase tracking-widest text-black mb-2 block">Project Name *</label>
                                <Input value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} placeholder="e.g. Real-time Chat App" className="h-12 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none font-bold placeholder:text-black/30" />
                            </div>
                            <div>
                                <label className="text-sm font-black uppercase tracking-widest text-black mb-2 block">Description *</label>
                                <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} placeholder="Brief description of what the project does..." rows={3} className="w-full p-4 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none text-[15px] font-bold focus:outline-none focus:ring-0 placeholder:text-black/30 resize-none" />
                            </div>
                            <div>
                                <label className="text-sm font-black uppercase tracking-widest text-black mb-2 block">Technologies (comma-separated)</label>
                                <Input value={newProject.technologies} onChange={(e) => setNewProject({...newProject, technologies: e.target.value})} placeholder="React, Node.js, MongoDB" className="h-12 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none font-bold placeholder:text-black/30" />
                            </div>
                            <div>
                                <label className="text-sm font-black uppercase tracking-widest text-black mb-2 block">Link (optional)</label>
                                <Input value={newProject.link} onChange={(e) => setNewProject({...newProject, link: e.target.value})} placeholder="https://github.com/..." className="h-12 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none font-bold placeholder:text-black/30" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 h-14 bg-white border-4 border-black text-black font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                    Cancel
                                </button>
                                <button onClick={submitManualProject} disabled={submittingProject || !newProject.name.trim() || !newProject.description.trim()} className="flex-1 h-14 bg-primary border-4 border-black text-black font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submittingProject && <Loader2 className="h-6 w-6 animate-spin" />}
                                    Add Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Projects Section */}
            {manualProjects.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-2xl font-black tracking-widest uppercase text-black mb-6 flex items-center gap-2">
                        <FolderPlus className="h-6 w-6 text-primary" /> Your Portfolio Projects
                    </h3>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {manualProjects.map((project, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-none border-4 border-black shadow-hard flex flex-col h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-xl font-black uppercase tracking-widest text-black truncate pr-4">{project.name}</h4>
                                    <Badge variant="outline" className="bg-primary border-2 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-[10px] shrink-0 rounded-none">Manual</Badge>
                                </div>
                                <p className="text-sm font-bold uppercase text-black/80 line-clamp-2 leading-relaxed mb-6 flex-1">{project.description}</p>
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.technologies.slice(0, 5).map((tech, tIdx) => (
                                            <span key={tIdx} className="text-xs px-2.5 py-1 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black uppercase text-black rounded-none">{tech}</span>
                                        ))}
                                    </div>
                                )}
                                {project.link && (
                                    <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-widest text-black border-t-4 border-black pt-4">
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline underline-offset-4 decoration-primary decoration-4">
                                            <Globe className="h-5 w-5 text-primary" /> View Project
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!githubConnected ? (
                <div onClick={connectGithub} className="bg-accent border-4 border-black hover:bg-primary transition-all cursor-pointer rounded-none flex flex-col items-center justify-center p-16 text-center min-h-[400px] group shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                    <div className="h-24 w-24 rounded-none bg-white border-4 border-black flex items-center justify-center mb-6 transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 relative overflow-hidden">
                        {connecting ? <Loader2 className="h-10 w-10 text-black animate-spin" /> : <Github className="h-10 w-10 text-black relative z-10" />}
                    </div>
                    <h2 className="font-black uppercase tracking-widest text-black mb-3 text-3xl">{connecting ? 'Connecting...' : 'Connect GitHub'}</h2>
                    <p className="text-black font-bold uppercase tracking-widest max-w-lg text-[16px] leading-relaxed">
                        {connecting 
                            ? 'Redirecting to GitHub authorization sequence...' 
                            : 'Link your GitHub to automatically extract technical stack details, detect architectural complexity, and get personalized suggestions for your portfolio.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* GitHub Stats Overview */}
                    <div className="flex flex-wrap gap-4 lg:gap-6">
                        <div className="bg-white p-6 rounded-none flex flex-grow min-w-[200px] items-center gap-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <div className="h-14 w-14 rounded-none bg-accent border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <Github className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Connected As</p>
                                <p className="text-xl font-black uppercase text-black">@{githubUsername}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-none flex flex-grow min-w-[200px] items-center gap-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <div className="h-14 w-14 rounded-none bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <Star className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Total Stars</p>
                                <p className="text-2xl font-black text-black">{analysis?.totalStars || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-none flex flex-grow min-w-[200px] items-center gap-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <div className="h-14 w-14 rounded-none bg-blue-300 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <GitBranch className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Repositories</p>
                                <p className="text-2xl font-black text-black">{analysis?.totalRepos || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-none flex flex-grow min-w-[200px] items-center gap-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <div className="h-14 w-14 rounded-none bg-emerald-300 border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <CheckCircle className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">Active</p>
                                <p className="text-2xl font-black text-black">{analysis?.activity.recentlyActive || 0}</p>
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
                                        <h3 className="text-2xl font-black tracking-widest uppercase flex items-center gap-3 text-black">
                                            <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <AlertCircle className="h-6 w-6 text-black" />
                                            </div>
                                            AI Suggestions
                                            {targetRole?.title && (
                                                <span className="text-sm font-black uppercase bg-white border-2 border-black px-2 py-1 ml-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    for {targetRole.title}
                                                </span>
                                            )}
                                        </h3>
                                        <button 
                                            onClick={refreshAnalysis} 
                                            disabled={analyzing}
                                            className="flex items-center gap-2 px-4 py-3 bg-white border-4 border-black rounded-none text-sm font-black uppercase tracking-widest text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                                        >
                                            <RefreshCw className={`h-5 w-5 ${analyzing ? 'animate-spin' : ''}`} />
                                            {analyzing ? 'Analyzing...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {suggestions.map((suggestion, idx) => (
                                            <div key={idx} className={`bg-white p-6 rounded-none border-4 border-black shadow-hard flex flex-col md:flex-row md:items-start gap-4 transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-none cursor-default`}>
                                                <div className="h-14 w-14 bg-accent border-4 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    {getCategoryIcon(suggestion.category)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-black uppercase tracking-widest text-[17px] text-black">{suggestion.title}</h4>
                                                        <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 border-2 border-black ${getPriorityColor(suggestion.priority)} text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]`}>
                                                            {suggestion.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="text-[15px] text-black font-bold uppercase mb-4 leading-relaxed">{suggestion.description}</p>
                                                    <div className="inline-flex flex-wrap items-center gap-2 bg-primary px-4 py-2 border-4 border-black text-sm font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                        <ArrowRight className="h-5 w-5" />
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
                                    <div className="bg-white p-8 rounded-none border-4 border-black shadow-hard">
                                        <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-black">Tech Stack</h3>
                                        <p className="text-sm font-bold uppercase text-black/80 mb-6 bg-accent px-2 border-2 border-black w-fit">Auto-detected Languages</p>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(analysis.languages).map(([lang, count]) => (
                                                <div key={lang} className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 border-4 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] text-sm font-black uppercase text-black">
                                                    {lang} <span className="h-6 w-6 bg-white border-2 border-black flex items-center justify-center text-xs text-black">{count as number}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-none border-4 border-black shadow-hard">
                                        <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-black">Core Topics</h3>
                                        <p className="text-sm font-bold uppercase text-black/80 mb-6 bg-accent px-2 border-2 border-black w-fit">Subject matter tags</p>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {analysis.topTopics.map((topic) => (
                                                <Badge key={topic} variant="outline" className="border-4 border-black bg-white text-black font-black uppercase tracking-widest px-3 py-1.5 text-xs rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]">
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
                    {/* Repository List Full Width */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black uppercase tracking-widest text-black">Your Repositories</h3>
                            <div className="flex gap-4">
                                <button onClick={fetchRepos} disabled={loading} className="h-12 w-12 flex items-center justify-center bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none transition-all text-black disabled:opacity-50">
                                    <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button onClick={disconnectGithub} className="px-6 py-2 bg-red-400 border-4 border-black text-black rounded-none text-sm font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                    Disconnect
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full py-16 flex items-center justify-center border-4 border-black bg-white shadow-hard">
                                    <Loader2 className="h-10 w-10 text-black animate-spin" />
                                </div>
                            ) : repos.length === 0 ? (
                                <div className="col-span-full bg-white py-16 rounded-none border-4 border-black text-center shadow-hard">
                                    <p className="text-black font-black uppercase tracking-widest">No repositories found in your account.</p>
                                </div>
                            ) : (
                                repos.map((repo) => (
                                    <div key={repo.id} className="bg-white p-6 rounded-none border-4 border-black hover:-translate-y-1 hover:translate-x-1 hover:shadow-none shadow-hard transition-all flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-[17px] font-black uppercase tracking-widest text-black truncate pr-4">{repo.name}</h4>
                                                    <Badge variant="outline" className="bg-primary border-2 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-[10px] shrink-0 rounded-none">
                                                        {repo.language || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                <p className="text-[14px] text-black font-bold uppercase line-clamp-2 leading-relaxed mb-6 flex-1">
                                                    {repo.description || 'No description provided.'}
                                                </p>
                                                
                                                {/* Topics */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {repo.topics?.slice(0, 3).map((topic) => (
                                                        <span key={topic} className="text-[11px] px-2.5 py-1 bg-white rounded-none font-black text-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-5 text-sm font-black uppercase text-black border-t-4 border-black pt-4">
                                                    <div className="flex items-center gap-1.5 hover:text-primary transition">
                                                        <Star className="h-5 w-5 text-black" /> {repo.stargazers_count}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 hover:text-primary transition">
                                                        <GitBranch className="h-5 w-5 text-black" /> {repo.forks_count}
                                                    </div>
                                                    <div className="ml-auto">
                                                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-black hover:underline underline-offset-4 decoration-primary decoration-4 rounded-none">
                                                            <Globe className="h-5 w-5 text-primary" /> View Repo
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
