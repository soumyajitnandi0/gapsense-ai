import { CheckCircle2, Circle, PlayCircle } from "lucide-react"

export interface Milestone {
    id: string
    title: string
    description: string
    status: "completed" | "in-progress" | "pending"
    week: number
}

interface RoadmapTimelineProps {
    milestones: Milestone[]
}

export function RoadmapTimeline({ milestones }: RoadmapTimelineProps) {
    return (
        <div className="relative space-y-8 pl-8 before:absolute before:left-3.5 before:top-2 before:h-[calc(100%-2rem)] before:w-[1px] before:bg-border">
            {milestones.map((milestone) => (
                <div key={milestone.id} className="relative">
                    <div className="absolute -left-[32px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background ring-2 ring-border">
                        {milestone.status === "completed" && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                        {milestone.status === "in-progress" && (
                            <PlayCircle className="h-5 w-5 text-primary" />
                        )}
                        {milestone.status === "pending" && (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Week {milestone.week}</span>
                            <h4 className="text-sm font-semibold">{milestone.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {milestone.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}