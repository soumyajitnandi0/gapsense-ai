"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User, LogOut, Settings, Github, ChevronDown, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMD5 } from "@/lib/utils"

export function Navbar() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()
    const isDashboard = pathname?.startsWith("/dashboard")

    const publicLinks = [
        { href: "/features", label: "Product" },
        { href: "/how-it-works", label: "Integrations" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources", label: "Resources" },
    ]

    const dashboardLinks = [
        { href: "/dashboard", label: "Overview" },
        { href: "/dashboard/analysis", label: "Analysis" },
        { href: "/dashboard/roadmap", label: "Roadmap" },
        { href: "/dashboard/coach", label: "AI Coach" },
        { href: "/dashboard/resources", label: "Resources" },
        { href: "/dashboard/profile", label: "Profile" },
    ]

    const navLinks = isDashboard ? dashboardLinks : publicLinks

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-4 md:px-8 bg-white border-b-4 border-black w-full">
            {/* Logo area */}
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 px-2 py-1 hover:translate-x-1 hover:translate-y-1 transition-transform group">
                    <div className="h-10 w-10 bg-black border-2 border-black flex items-center justify-center shadow-hard group-hover:shadow-none transition-shadow">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-black uppercase text-xl tracking-widest text-black">GapSense AI</span>
                </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-4">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`group inline-flex items-center justify-center border-2 border-black px-4 py-2 text-[13px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-primary text-black shadow-hard translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:translate-x-1 hover:-translate-y-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none'}`}
                        >
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
                {!isDashboard && (
                    <Link href="https://github.com/soumyajitnandi0/gapsense-ai" target="_blank" className="text-black bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all px-4 py-2 flex items-center gap-2 text-[13px] font-black uppercase tracking-widest mr-2">
                        <Github className="h-4 w-4" />
                        Star on GitHub
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-4">
                        {!isDashboard && (
                            <Link href="/dashboard">
                                <Button variant="default" className="bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none rounded-none px-6 font-black uppercase tracking-widest text-[13px] h-12 transition-all">
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-12 w-12 rounded-none p-0 border-4 border-black shadow-hard hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                    <Avatar className="h-full w-full rounded-none">
                                        <AvatarImage src={user.picture || `https://www.gravatar.com/avatar/${getMD5(user.email)}?s=128&d=mp`} alt={user.name} />
                                        <AvatarFallback className="rounded-none bg-primary text-black font-black">
                                            {user.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-none border-4 border-black bg-white shadow-hard p-2" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal p-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-black uppercase leading-none">{user.name}</p>
                                        <p className="text-[10px] font-bold text-black/60 uppercase leading-none">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-black/10 h-0.5" />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile" className="cursor-pointer font-black uppercase text-[11px] p-2 hover:bg-primary transition-colors flex items-center gap-2">
                                        <User className="h-4 w-4" /> Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="cursor-pointer font-black uppercase text-[11px] p-2 hover:bg-primary transition-colors flex items-center gap-2">
                                        <Settings className="h-4 w-4" /> Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-black/10 h-0.5" />
                                <DropdownMenuItem 
                                    onClick={() => logout()}
                                    className="cursor-pointer font-black uppercase text-[11px] p-2 hover:bg-red-400 transition-colors flex items-center gap-2 text-red-600"
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <Link href="/auth/signup">
                        <Button variant="default" className="bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none rounded-none px-6 font-black uppercase tracking-widest text-[13px] h-12 transition-all">
                            Start Free Trial
                        </Button>
                    </Link>
                )}
            </div>

            {/* Mobile Nav */}
            <div className="lg:hidden ml-auto">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-black bg-white border-4 border-black shadow-hard rounded-none h-12 w-12 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <Menu className="h-6 w-6 font-black" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="top" className="bg-white border-b-8 border-black">
                        <div className="flex flex-col gap-6 mt-8 items-center pb-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-2xl font-black uppercase tracking-widest ${pathname === link.href ? "text-primary bg-black px-4 py-2" : "text-black hover:bg-primary px-4 py-2 border-2 border-transparent hover:border-black transition-all"}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
                                {isDashboard ? (
                                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-black text-white border-4 border-black shadow-hard rounded-none h-14 font-black uppercase tracking-widest text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                            Open Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-primary text-black border-4 border-black shadow-hard rounded-none h-14 font-black uppercase tracking-widest text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                            Start Free Trial
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}