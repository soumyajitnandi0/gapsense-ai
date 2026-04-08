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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
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
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
            <header className="w-full max-w-5xl rounded-full border border-white/10 bg-[#050707]/80 backdrop-blur-xl shadow-2xl supports-[backdrop-filter]:bg-[#050707]/60">
                <div className="flex h-14 items-center justify-between px-6">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mr-8">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                            <Sparkles className="h-4 w-4 fill-current" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white font-heading">GapSense</span>
                    </Link>

                    {/* Desktop Nav - Centered */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/5 data-[state=open]:bg-white/5 ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                                {!isDashboard && <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-2 ml-auto">
                        {!isDashboard && (
                            <Link href="https://github.com/soumyajitnandi0/gapsense-ai" target="_blank" className="text-muted-foreground hover:text-white transition-colors mr-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium">
                                    <Github className="h-3.5 w-3.5" />
                                    <span>Star on GitHub</span>
                                </div>
                            </Link>
                        )}

                        {isDashboard ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarImage src="/avatars/01.png" alt="@user" />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 text-white" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Student Candidate</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                student@example.com
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/signup">
                                <Button variant="default" className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold h-9">
                                    Start Free Trial
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Nav */}
                    <div className="md:hidden ml-auto">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="bg-[#050707] border-b border-white/10">
                                <div className="flex flex-col gap-6 mt-6 items-center">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`text-lg font-medium hover:text-white ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
                                        {isDashboard ? (
                                            <Link href="/" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full justify-center text-red-400 border-red-400/20 hover:bg-red-400/10 rounded-full">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Log out
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full">Start Free Trial</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </div>
    )
}