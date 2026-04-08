"use client"

import { Check } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Role {
    id: string
    title: string
    description: string
}

const roles: Role[] = [
    {
        id: "frontend",
        title: "Frontend Engineer",
        description: "React, Next.js, TypeScript, Tailwind CSS",
    },
    {
        id: "backend",
        title: "Backend Engineer",
        description: "Node.js, Python, Go, SQL, Distributed Systems",
    },
    {
        id: "fullstack",
        title: "Full Stack Engineer",
        description: "Frontend + Backend, Database Design, API Security",
    },
    {
        id: "datascience",
        title: "Data Scientist",
        description: "Python, ML, Statistics, SQL, Pandas",
    },
]

interface RoleSelectorProps {
    selectedRole?: string
    onSelectRole: (roleId: string) => void
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
                <Card
                    key={role.id}
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary",
                        selectedRole === role.id ? "border-primary bg-primary/5" : ""
                    )}
                    onClick={() => onSelectRole(role.id)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{role.title}</CardTitle>
                        {selectedRole === role.id && <Check className="h-4 w-4 text-primary" />}
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
