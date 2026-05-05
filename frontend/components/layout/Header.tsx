"use client"

import { Search, Bell, User, Settings, Target, ChevronDown, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useStore, Role, Assessment } from "@/lib/store"

const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Roadmap", href: "/dashboard/roadmap" },
    { name: "Mock Interview", href: "/dashboard/mock-interview" },
    { name: "Coach", href: "/dashboard/coach" },
    { name: "Analysis", href: "/dashboard/analysis" },
    { name: "Projects", href: "/dashboard/projects" },
    { name: "Progress", href: "/dashboard/progress" },
]

export function Header() {
    const { logout, user } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const { assessments, setAssessments, assessment, setAssessment, setProfile } = useStore()
    const [loadingTargets, setLoadingTargets] = useState(false)

    useEffect(() => {
        if (user) {
            setLoadingTargets(true)
            api.get("/assessments").then(res => {
                setAssessments(res.data.assessments || [])
            }).catch(err => console.error(err)).finally(() => setLoadingTargets(false))
        }
    }, [user, setAssessments])

    const handleSwitchTarget = (target: Assessment) => {
        setAssessment(target)
        // If we have a snapshot, we could also update the profile in store to reflect the resume used for this target
        if (target.profileSnapshot) {
            setProfile({
                skills: target.profileSnapshot.skills || [],
                projects: target.profileSnapshot.projects || [],
                experience: target.profileSnapshot.experience || [],
                education: target.profileSnapshot.education || [],
            })
        }
    }

    const currentRoleName = (assessment?.roleId as Role)?.name || "Select Target"

    return (
        <header className="fixed top-6 left-0 w-full z-50 flex h-20 items-center justify-between px-8 bg-transparent">
            {/* Logo area */}
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 px-6 py-3 bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    <div className="h-8 w-8 bg-black flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-black text-xl tracking-tight text-black uppercase">GapSense AI</span>
                </Link>

                {/* Target Selector Dropdown */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-16 px-6 bg-primary border-4 border-black text-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none flex gap-4 items-center ml-4">
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Study Target</span>
                                    <span className="text-sm font-black uppercase tracking-widest max-w-[150px] truncate">{currentRoleName}</span>
                                </div>
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-72 bg-white border-4 border-black text-black rounded-none shadow-hard mt-2 p-2">
                            <DropdownMenuLabel className="px-3 pt-2 pb-2 text-xs font-black uppercase tracking-[0.2em] opacity-40">My Study Targets</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black my-2" />
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {assessments.map((target) => (
                                    <DropdownMenuItem 
                                        key={target._id} 
                                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer rounded-none border-2 border-transparent focus:border-black mb-1 transition-all ${assessment?._id === target._id ? 'bg-primary/20 border-black shadow-hard translate-x-1 -translate-y-1' : 'hover:bg-muted'}`}
                                        onClick={() => handleSwitchTarget(target)}
                                    >
                                        <div className="flex justify-between w-full">
                                            <span className="font-black uppercase text-xs tracking-widest">{(target.roleId as Role)?.name}</span>
                                            <span className="font-black text-[10px] bg-black text-white px-1">{target.overallScore}%</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Analyzed {new Date(target.createdAt!).toLocaleDateString()}</span>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                            <DropdownMenuSeparator className="bg-black my-2" />
                            <DropdownMenuItem asChild className="p-0">
                                <Link href="/dashboard/onboarding" className="w-full">
                                    <Button className="w-full bg-accent text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none font-black uppercase tracking-widest text-xs h-12 flex items-center justify-center gap-2">
                                        <Plus className="h-4 w-4" strokeWidth={4} />
                                        New Study Target
                                    </Button>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Centered Navigation */}
            <nav className="hidden xl:flex items-center gap-3 bg-white border-4 border-black p-2 shadow-hard mx-4">
                {NAV_LINKS.map(link => {
                    const isActive = pathname === link.href
                    return (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className={`px-5 py-2 text-[13px] font-black uppercase tracking-widest transition-all duration-200 border-2 border-transparent ${isActive ? 'bg-primary border-black text-black shadow-hard -translate-y-1 translate-x-1' : 'text-black hover:bg-muted hover:border-black'}`}
                        >
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Right Side Tools */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings">
                    <Button variant="ghost" className="h-12 px-6 bg-secondary hover:bg-secondary/80 border-4 border-black text-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none flex gap-2 items-center text-sm font-black uppercase tracking-widest">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Button>
                </Link>

                <Button variant="ghost" size="icon" className="h-12 w-12 bg-white hover:bg-muted border-4 border-black text-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2 right-2 h-3 w-3 bg-accent border-2 border-black"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 bg-white hover:bg-muted border-4 border-black p-0 overflow-hidden shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none">
                             {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="h-full w-full object-cover grayscale" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-black text-white font-black text-sm uppercase">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-4 border-black text-black rounded-none shadow-hard mt-4 p-2">
                        <DropdownMenuLabel className="px-3 pt-2 pb-2 text-sm font-black uppercase tracking-widest bg-primary border-2 border-black mb-2">{user?.name || "Account"}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-black border-b-4 border-black my-2" />
                        <DropdownMenuItem asChild className="focus:bg-secondary cursor-pointer rounded-none my-1 font-black uppercase border-2 border-transparent focus:border-black">
                            <Link href="/dashboard/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-secondary cursor-pointer rounded-none my-1 font-black uppercase border-2 border-transparent focus:border-black">
                            <Link href="/dashboard/settings?tab=billing">Billing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black border-b-4 border-black my-2" />
                        <DropdownMenuItem className="focus:bg-accent cursor-pointer text-black font-black uppercase rounded-none my-1 border-2 border-transparent focus:border-black" onClick={logout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
