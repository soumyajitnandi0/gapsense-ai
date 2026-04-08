"use client"

import { Search, Bell, User, PlusCircle, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
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

import { useAuth } from "@/contexts/AuthContext"

interface HeaderProps {
    isOpen?: boolean
}

export function Header({ isOpen = false }: HeaderProps) {
    const { logout, user } = useAuth()
    return (
        <header className={`fixed top-0 right-0 z-30 flex h-[72px] items-center justify-between border-b border-white/5 bg-[#0B0E14]/80 px-8 backdrop-blur-xl transition-all duration-300 ${isOpen ? "left-64" : "left-[60px]"
            }`}>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-muted-foreground">@{user?.email?.split('@')[0] || "user"}</span>
                                <span className="text-sm font-medium">{user?.name || "User"}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-[#13161F] border-white/10 text-white rounded-xl">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer rounded-lg">Profile</DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer rounded-lg">Settings</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer text-red-400 rounded-lg" onClick={logout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/dashboard/onboarding">
                    <Button className="h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium border-none px-5 gap-2 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]">
                        New Assessment
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative w-64 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-9 h-10 rounded-xl bg-[#1A1D26] border-white/5 text-sm focus-visible:ring-purple-500/50 hover:bg-[#20242F] transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl rounded-full bg-[#1A1D26] hover:bg-[#20242F] border border-white/5 text-muted-foreground hover:text-white relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-purple-500"></span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl rounded-full bg-[#1A1D26] hover:bg-[#20242F] border border-white/5 text-muted-foreground hover:text-white md:hidden">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 px-3 w-auto rounded-xl rounded-full bg-[#1A1D26] hover:bg-[#20242F] border border-white/5 text-muted-foreground hover:text-white gap-2 hidden lg:flex">
                         <span className="text-sm font-medium">Settings</span>
                         <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
