"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Component, BrainCircuit, LogOut, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { title: "Cohort Analytics", href: "/admin", icon: LayoutDashboard },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Role Templates", href: "/admin/templates", icon: Component },
        { title: "Skills Ontology", href: "/admin/skills", icon: BrainCircuit },
    ]

    return (
        <div className="flex min-h-screen bg-black text-white relative">
            <div className="absolute inset-0 bg-orbit-gradient pointer-events-none fixed" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none fixed" />

            {/* Sidebar navigation for Admin */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col pt-8 pb-4 relative z-10">
                <div className="px-6 mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500 border border-red-500/30">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Admin Portal</h2>
                        <p className="text-xs text-muted-foreground">GapSense AI</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                                pathname === item.href
                                    ? "bg-white/10 text-white font-medium shadow-[inset_2px_0_0_hsl(var(--primary))]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 mt-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 relative z-10 h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
