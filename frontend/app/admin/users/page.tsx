"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreVertical, ShieldAlert } from "lucide-react"

export default function AdminUsersPage() {
    const users = [
        { id: "1", name: "Alice Smith", email: "alice@example.com", targetRole: "Backend SDE", score: 76, status: "Active", joined: "Oct 24" },
        { id: "2", name: "Bob Johnson", email: "bob@example.com", targetRole: "Data Scientist", score: 45, status: "Inactive", joined: "Nov 02" },
        { id: "3", name: "Charlie Davis", email: "charlie@example.com", targetRole: "Frontend Dev", score: 92, status: "Active", joined: "Nov 05" },
        { id: "4", name: "Diana Prince", email: "diana@example.com", targetRole: "Product Manager", score: 68, status: "Active", joined: "Nov 12" },
    ]

    return (
        <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold font-heading">User Management</h3>
                    <p className="text-sm text-muted-foreground">View and manage student profiles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                    <Button className="bg-white text-black hover:bg-white/90">Export CSV</Button>
                </div>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-xl flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/40">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 bg-black/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary/50"
                        />
                    </div>
                </div>
                <CardContent className="p-0 overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-black/50 border-b border-white/10 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student Name</th>
                                <th className="px-6 py-4 font-medium">Target Role</th>
                                <th className="px-6 py-4 font-medium">Readiness Score</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{user.name}</div>
                                        <div className="text-muted-foreground">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white/80">{user.targetRole}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${user.score >= 70 ? 'bg-primary' : user.score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                    style={{ width: `${user.score}%` }}
                                                />
                                            </div>
                                            <span className="font-medium text-white">{user.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-white/10 text-white hover:bg-white/20"}>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.joined}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-muted-foreground hover:text-white rounded-full">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
