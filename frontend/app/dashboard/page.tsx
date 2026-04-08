"use client"

import { useEffect, useState } from "react"
import { Sparkles, BarChart, FileText, ArrowRight, Wallet, Target, Trophy, Clock, Link as LinkIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useStore } from "@/lib/store"
import { StatCard } from "@/components/dashboard/StatCard"
import { MainDetailedChart } from "@/components/dashboard/MainDetailedChart"

const mockMiniChart1 = [
    { value: 65 }, { value: 68 }, { value: 64 }, { value: 72 }, { value: 70 }, { value: 75 }
]
const mockMiniChart2 = [
    { value: 85 }, { value: 82 }, { value: 80 }, { value: 84 }, { value: 86 }, { value: 90 }
]
const mockMiniChart3 = [
    { value: 45 }, { value: 40 }, { value: 42 }, { value: 48 }, { value: 47 }, { value: 44 }
]

const mockMainChartData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 50 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 62 },
    { name: 'May', value: 60 },
    { name: 'Jun', value: 75 }
]

export default function DashboardPage() {
    const { assessment, setAssessment } = useStore()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Try fetching latest assessment seamlessly
        api.get("/assessments/latest")
            .then(res => {
                setAssessment(res.data.assessment)
            })
            .catch(() => {
                // Ignore, means no assessment yet
            })
            .finally(() => {
                setLoading(false)
            })
    }, [setAssessment])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center animate-pulse">
                <div className="h-8 w-8 rounded-full border-t-2 border-purple-500 animate-spin" />
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-heading">
                        <span className="block text-white">Welcome to</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient-x pb-2">
                            GapSense AI
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        You haven't completed a readiness assessment yet. Upload your resume and select a target role to get your personalized roadmap.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#13161F] p-8 shadow-2xl relative group overflow-hidden w-full max-w-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Link href="/dashboard/onboarding">
                        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium border-none shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] gap-2">
                            Start Readiness Assessment
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // User is onboarded and has an assessment
    return (
        <div className="w-full animate-in fade-in duration-500 pb-10">
            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                
                {/* Left 3 Stat Cards */}
                <div className="col-span-1 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div>
                            <p className="text-xs text-purple-400 font-medium mb-1">Recommended actions for 24 hours</p>
                            <h2 className="text-2xl font-bold text-white">Top Readiness Assets</h2>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <select className="h-8 rounded-lg bg-[#13161F] border border-white/5 text-xs text-white px-3 hover:bg-[#1A1D26] cursor-pointer outline-none">
                                <option>24H</option>
                                <option>7D</option>
                            </select>
                            <select className="h-8 rounded-lg bg-[#13161F] border border-white/5 text-xs text-white px-3 hover:bg-[#1A1D26] cursor-pointer outline-none">
                                <option>Technical Skills</option>
                                <option>Soft Skills</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            title={assessment.roleId?.name || "Target Role"} 
                            subtitle="AI Assessment"
                            value={`${assessment.overallScore}/100`}
                            change={6.25}
                            data={mockMiniChart1}
                            icon={<Target className="h-5 w-5" />}
                            color="bg-purple-500"
                        />
                        <StatCard 
                            title="Mock Interview" 
                            subtitle="Preparation"
                            value="82/100"
                            change={5.67}
                            data={mockMiniChart2}
                            icon={<BarChart className="h-5 w-5" />}
                            color="bg-indigo-500"
                        />
                        <StatCard 
                            title="Roadmap Pace" 
                            subtitle="Progress"
                            value="44%"
                            change={-1.89}
                            data={mockMiniChart3}
                            icon={<Clock className="h-5 w-5" />}
                            color="bg-pink-500"
                        />
                    </div>
                </div>

                {/* Right Portfolio Card */}
                <div className="col-span-1">
                    <div className="h-full rounded-2xl border border-white/5 bg-gradient-to-b from-[#1A1829] to-[#13161F] p-6 shadow-xl relative overflow-hidden group flex flex-col pt-12">
                        {/* Glow effects */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl -mr-10 -mt-10 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 blur-3xl -ml-10 -mb-10 rounded-full"></div>

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-purple-500 flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-semibold text-white">GapSense</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 bg-purple-500/20 px-2 py-1 rounded-md">New</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Skill Readiness Portfolio</h3>
                        <p className="text-sm text-muted-foreground/80 mb-6 relative z-10 flex-grow">
                            An all-in-one portfolio that helps you make smarter improvements to your career trajectory.
                        </p>

                        <div className="space-y-3 relative z-10 pb-2">
                            <Button className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] justify-between rounded-xl px-4">
                                Connect LinkedIn <LinkIcon className="h-4 w-4" />
                            </Button>
                            <Link href="/dashboard/roadmap" className="block">
                                <Button variant="outline" className="w-full h-11 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-white justify-between rounded-xl px-4">
                                    View Full Roadmap <FileText className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Main Chart Section */}
            <div className="rounded-2xl border border-white/5 bg-[#13161F] p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Left Main Chart Area */}
                    <div className="flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">last update - 45 Minutes ago</p>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-white">Track Progress</h2>
                                    <div className="bg-purple-500/20 p-1.5 rounded-lg">
                                        <Trophy className="h-4 w-4 text-purple-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground">
                                    <LinkIcon className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground">
                                    <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button className="h-8 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/5 gap-2 px-3">
                                    View Details <ArrowRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-baseline gap-4 mb-2">
                            <span className="text-xs text-muted-foreground block w-full">Current Assessment Score, {assessment.roleId?.name || "Target Role"}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-5xl font-bold text-white tracking-tight">{assessment.overallScore}<span className="text-2xl text-white/40">/100</span></span>
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard/onboarding">
                                        <Button className="h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs px-4 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] border-none">
                                            Re-assess
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/mock-interview">
                                        <Button variant="outline" className="h-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs px-4">
                                            Practice
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <MainDetailedChart data={mockMainChartData} />
                    </div>

                    {/* Right Timeline / Stats Area */}
                    <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between">
                        {/* Investment Period equivalent -> Learning Period */}
                        <div className="rounded-xl border border-white/5 bg-[#1A1D26] p-5 relative overflow-hidden mb-6 h-40">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Learning Period</h4>
                                    <p className="text-[10px] text-muted-foreground">Est. time to job-ready</p>
                                </div>
                                <span className="text-[10px] font-medium bg-white/10 text-white px-2 py-0.5 rounded-md">
                                    {assessment.roadmap?.duration || 60} Days
                                </span>
                            </div>

                            {/* Timeline visualizer mocked */}
                            <div className="absolute top-1/2 left-0 right-0 translate-y-2 px-6">
                                <div className="h-[1px] w-full bg-white/10 relative">
                                    <div className="absolute -top-1.5 left-[40%] h-3 w-3 rounded-full border-2 border-purple-500 bg-[#1A1D26] cursor-pointer" />
                                    <div className="absolute -top-[20px] left-[40%] -translate-x-1/2 text-[10px] text-muted-foreground bg-[#1A1D26] px-1 ring-4 ring-[#1A1D26]">Day 24</div>

                                    {/* Tick marks */}
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <div key={i} className="absolute top-0 w-px h-2 bg-white/5" style={{ left: `${(i / 14) * 100}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Row inside the main card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider text-left">Technical Skills</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-white">72%</span>
                            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">+4%</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider text-left">Soft Skills</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-white">85%</span>
                            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">+2%</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider text-left">Experience Match</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-white">60%</span>
                            <span className="text-xs text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">-1%</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[rgba(168,85,247,0.2)] bg-gradient-to-r from-purple-500/5 to-transparent p-4 text-center">
                        <p className="text-[10px] text-purple-400 mb-1 uppercase tracking-wider text-left">Target Score</p>
                        <div className="flex flex-col items-start w-full">
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-sm font-bold text-white">90/100</span>
                                <span className="text-[10px] text-purple-300">Goal</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[75%] shadow-[0_0_10px_purple]"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
