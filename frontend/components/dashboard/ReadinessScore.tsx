"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

interface ReadinessScoreProps {
    score: number
    className?: string
}

export function ReadinessScore({ score, className }: ReadinessScoreProps) {
    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ]

    // Determine color based on score
    let color = "hsl(var(--primary))"
    if (score < 50) color = "hsl(var(--destructive))"
    else if (score < 80) color = "hsl(var(--chart-4))" // Use chart color for variety

    const COLORS = [color, "hsl(var(--primary) / 0.1)"]

    return (
        <div className={`relative h-[200px] w-full ${className || ""}`}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
        </div>
    )
}
