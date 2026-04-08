"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartProps {
    data: any[]
}

export function MainDetailedChart({ data }: ChartProps) {
    return (
        <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-xl border border-white/10 bg-[#1A1D26]/90 backdrop-blur-md p-3 text-sm shadow-2xl">
                                        <p className="text-muted-foreground mb-1">{label}</p>
                                        <p className="font-bold text-white text-lg">
                                            {payload[0].value} <span className="text-xs font-normal text-muted-foreground">Score</span>
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#a855f7"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
