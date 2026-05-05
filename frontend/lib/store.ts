import { create } from 'zustand'

export interface User {
  id: number
  name: string
  email: string
}

export interface Skill {
  name: string
  level?: string
}

export interface Project {
  name: string
  description?: string
  url?: string
  technologies?: string[]
  link?: string
}

export interface Education {
  institution: string
  degree?: string
  field?: string
  year?: string
}

export interface Experience {
  company: string
  role?: string
  duration?: string
  description?: string
}

export interface Profile {
  skills: Skill[]
  projects: Project[]
  education: Education[]
  experience: Experience[]
}

export interface IGap {
  skill: string
  currentLevel: string
  requiredLevel: string
  priority: 'high' | 'medium' | 'low'
  rationale: string
}

export interface ISubScore {
  category: string
  score: number
  maxScore: number
  weight: number
  explanation: string
}

export interface Task {
  id?: string
  _id?: string
  title?: string
  estimatedHours?: number
}

export interface Milestone {
  week?: number
  title?: string
  tasks?: Task[]
}

export interface Roadmap {
  duration?: number
  milestones?: Milestone[]
  projectSuggestions?: Array<{ title?: string; description?: string; technologies?: string[] }> | string[]
}

export interface Role {
  _id?: string
  name?: string
}

export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface Assessment {
  _id: string
  overallScore: number
  subScores: ISubScore[]
  gaps: IGap[]
  matchedSkills: string[]
  missingSkills: string[]
  roadmap?: Roadmap
  profileSnapshot?: {
    skills: Skill[]
    projects: Project[]
    experience: Experience[]
    education: Education[]
  }
  resumeData?: {
    text?: string
    url?: string
  }
  explanations?: string[]
  roleId?: string | Role
  createdAt?: string
}

interface AppState {
  user: User | null
  profile: Profile | null
  assessment: Assessment | null
  assessments: Assessment[]
  setUser: (u: User) => void
  setProfile: (p: Profile) => void
  setAssessment: (a: Assessment) => void
  setAssessments: (as: Assessment[]) => void
}

export const useStore = create<AppState>()((set) => ({
  user: null,
  profile: null,
  assessment: null,
  assessments: [],
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAssessment: (assessment) => set({ assessment }),
  setAssessments: (assessments) => set({ assessments })
}))
