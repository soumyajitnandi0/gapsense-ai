import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Target, Activity, Zap, TrendingUp, BarChart3 } from "lucide-react"

export default function AdminPage() {
    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold font-heading">Cohort Analytics</h1>
                <p className="text-muted-foreground">Aggregated insight into student readiness and skill gaps.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">2,845</div>
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> +15.5% this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Readiness Score</CardTitle>
                        <Activity className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">68.4</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all cohorts
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roadmaps Active</CardTitle>
                        <Target className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1,432</div>
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> +22.1% this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Skill Gap</CardTitle>
                        <Zap className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-white truncate">System Design</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Missing in 42% of users
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 border-0 flex flex-col h-[400px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="h-5 w-5" /> Readiness Distribution
                        </CardTitle>
                        <CardDescription>Histogram of overall readiness scores.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-6 border-t border-white/5 bg-black/50">
                        {/* Placeholder for chart */}
                        <div className="flex items-end gap-2 h-full w-full justify-between opacity-50 px-4">
                            {[20, 35, 60, 100, 80, 50, 30].map((h, i) => (
                                <div key={i} className="w-12 bg-primary/40 rounded-t-sm hover:bg-primary transition-colors" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Most Requested Roles</CardTitle>
                        <CardDescription>Target template mappings by frequency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { role: "Backend Software Engineer", count: 840, percent: 85 },
                            { role: "Data Scientist", count: 520, percent: 50 },
                            { role: "Frontend Developer", count: 480, percent: 45 },
                            { role: "Product Manager", count: 210, percent: 20 },
                        ].map(item => (
                            <div key={item.role} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{item.role}</span>
                                        <span className="text-muted-foreground">{item.count} users</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
