"use client"

import { Search, Bell, User, Settings, Target, ChevronDown } from "lucide-react"
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
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Roadmap", href: "/dashboard/roadmap" },
    { name: "Mock Interview", href: "/dashboard/mock-interview" },
    { name: "Coach", href: "/dashboard/coach" },
    { name: "Analysis", href: "/dashboard/analysis" },
    { name: "Projects", href: "/dashboard/projects" },
    { name: "Resources", href: "/dashboard/resources" },
]

export function Header() {
    const { logout, user } = useAuth()
    const pathname = usePathname()

    return (
        <header className="fixed top-6 left-0 w-full z-50 flex h-20 items-center justify-between px-8 bg-transparent">
            {/* Logo area - Pill style */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-black/5 bg-white/60 backdrop-blur-xl shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-heading font-medium text-xl tracking-tight text-foreground">GapSense AI</span>
                </div>
            </div>

            {/* Centered Navigation Pills - Floating */}
            <nav className="hidden xl:flex items-center gap-1 bg-white/60 backdrop-blur-2xl border border-white/80 p-1.5 rounded-full shadow-premium">
                {NAV_LINKS.map(link => {
                    const isActive = pathname === link.href
                    return (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${isActive ? 'bg-[#1B1C1D] text-white shadow-lg' : 'text-foreground/70 hover:text-foreground hover:bg-black/5'}`}
                        >
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Right Side Tools */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/settings">
                    <Button variant="ghost" className="h-12 px-6 rounded-full bg-white/60 hover:bg-white border border-white/80 text-foreground shadow-sm flex gap-2 items-center text-sm font-semibold">
                        <Settings className="h-4 w-4" />
                        <span>Setting</span>
                    </Button>
                </Link>

                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/60 hover:bg-white border border-white/80 text-foreground relative shadow-sm">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/60 hover:bg-white border border-white/80 p-0 overflow-hidden shadow-sm">
                             {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-foreground font-medium text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-xl border-white/20 text-foreground rounded-[1.5rem] shadow-premium mt-2 p-1">
                        <DropdownMenuLabel className="px-3 pt-2 pb-1 text-sm font-semibold">{user?.name || "Account"}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-black/5" />
                        <DropdownMenuItem asChild className="focus:bg-black/5 cursor-pointer rounded-xl my-0.5">
                            <Link href="/dashboard/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-black/5 cursor-pointer rounded-xl my-0.5">
                            <Link href="/dashboard/settings?tab=billing">Billing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black/5" />
                        <DropdownMenuItem className="focus:bg-black/5 cursor-pointer text-red-500 rounded-xl my-0.5" onClick={logout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
