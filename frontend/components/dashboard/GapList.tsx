import { AlertTriangle, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface Gap {
    id: string
    title: string
    priority: "High" | "Medium" | "Low"
    status: "Missing" | "Weak" | "To Improve"
}

interface GapListProps {
    gaps: Gap[]
}

export function GapList({ gaps }: GapListProps) {
    return (
        <div className="space-y-4">
            {gaps.map((gap) => (
                <div
                    key={gap.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="font-medium">{gap.title}</p>
                            <p className="text-sm text-muted-foreground">{gap.priority} Priority</p>
                        </div>
                    </div>
                    <Badge variant={gap.priority === "High" ? "destructive" : "secondary"}>
                        {gap.status}
                    </Badge>
                </div>
            ))}
        </div>
    )
}
