"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Folder, Settings, Bot, LifeBuoy, Bell, BarChart2, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Assets", href: "/dashboard/analysis", icon: BarChart2 },
    { name: "Mock Providers", href: "/dashboard/projects", icon: Folder },
    { name: "Coach Chat", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Data API", href: "/dashboard/coach", icon: Bot },
]

const secondaryNavigation = [
    { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
    isOpen: boolean
    toggleSidebar: () => void
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn(
            "flex h-screen flex-col justify-between border-r border-[#1C212D] bg-[#0B0E14] py-6 transition-all duration-300 z-40 fixed left-0 top-0",
            isOpen ? "w-64" : "w-[80px]"
        )}>
            <div className="flex flex-col gap-6">
                {/* Header / Logo / Toggle */}
                <div className="flex h-12 items-center px-6 relative">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white font-bold text-lg">
                        G
                    </div>
                    <span className={cn(
                        "ml-3 text-xl font-bold text-white transition-opacity duration-300 whitespace-nowrap",
                        isOpen ? "opacity-100" : "opacity-0 overflow-hidden w-0 ml-0"
                    )}>
                        GapSense
                    </span>

                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "absolute right-[-14px] top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-[#1C212D] bg-[#13161F] text-muted-foreground hover:text-white transition-colors z-50",
                            isOpen ? "" : "rotate-180"
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>

                {/* Main Nav */}
                <nav className="flex flex-col gap-1 px-4 overflow-x-hidden">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex h-11 items-center rounded-xl px-4 text-[15px] font-medium transition-all duration-200 shrink-0",
                                    isActive ? "bg-gradient-to-r from-purple-500/10 to-transparent text-white relative" : "text-muted-foreground hover:bg-white/5 hover:text-white",
                                    !isOpen && "justify-center px-0"
                                )}
                                title={!isOpen ? item.name : undefined}
                            >
                                {isActive && isOpen && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                )}
                                <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-purple-400" : "")} />
                                <span className={cn(
                                    "ml-3 transition-opacity duration-300 whitespace-nowrap",
                                    isOpen ? "opacity-100" : "opacity-0 w-0 hidden"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Secondary Nav & Profile */}
            <div className="flex flex-col gap-1 px-4 mt-auto overflow-x-hidden">
                <div className="flex flex-col gap-1 mb-6">
                    {secondaryNavigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex h-11 items-center rounded-xl px-4 text-[15px] font-medium transition-colors hover:bg-white/5 hover:text-white shrink-0",
                                    isActive ? "text-white bg-white/5" : "text-muted-foreground",
                                    !isOpen && "justify-center px-0"
                                )}
                                title={!isOpen ? item.name : undefined}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className={cn(
                                    "ml-3 transition-opacity duration-300 whitespace-nowrap",
                                    isOpen ? "opacity-100" : "opacity-0 w-0 hidden"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* Bottom Promo / Active Super card like SpendSync */}
                <div className={cn(
                    "rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-4 mx-2 overflow-hidden shrink-0 mt-4",
                    isOpen ? "block" : "hidden"
                )}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center p-1.5 rounded-lg bg-white/10">
                            <Bot className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-sm font-semibold text-purple-400">Active Plus</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Unlock all features on GapSense</p>
                </div>
            </div>
        </div>
    )
}
