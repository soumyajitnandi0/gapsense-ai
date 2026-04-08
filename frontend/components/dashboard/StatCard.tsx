"use client"

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    subtitle: string
    value: string
    change: number
    data: any[]
    icon: React.ReactNode
    color: string
}

export function StatCard({ title, subtitle, value, change, data, icon, color }: StatCardProps) {
    const isPositive = change >= 0

    return (
        <div className="rounded-2xl border border-white/5 bg-[#13161F] p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            {/* Top Row: Icon, Title, Action */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg", color)}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                        <h3 className="text-sm font-semibold text-white">{title}</h3>
                    </div>
                </div>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>

            {/* Middle Row: Value & Change */}
            <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-1">Score Rate</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{value}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                        </div>
                    ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                            <ArrowDownRight className="h-3 w-3" />
                        </div>
                    )}
                    <span className={cn("text-xs font-medium", isPositive ? "text-emerald-500" : "text-red-500")}>
                        {Math.abs(change)}%
                    </span>
                </div>
            </div>

            {/* Bottom Row: Mini Chart */}
            <div className="h-16 w-full mt-4 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border border-white/10 bg-[#0B0E14] px-2 py-1 text-xs text-white shadow-xl">
                                            {payload[0].value}
                                        </div>
                                    )
                                }
                                return null
                            }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            strokeWidth={2}
                            dot={{ r: 3, fill: isPositive ? '#10b981' : '#ef4444', strokeWidth: 0, className: "drop-shadow-md" }}
                            activeDot={{ r: 5, fill: '#fff', strokeWidth: 0 }}
                            style={{ filter: `drop-shadow(0px 5px 8px ${isPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'})` }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            {/* Decorative Glow */}
            <div className={cn(
                "absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl pointer-events-none",
                isPositive ? "bg-emerald-500" : "bg-red-500"
            )} />
        </div>
    )
}
