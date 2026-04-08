import { create } from 'zustand'

export interface User {
  id: number
  name: string
  email: string
}

export interface Profile {
  skills: any[]
  projects: any[]
  education: any[]
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

export interface Assessment {
  _id: string
  overallScore: number
  subScores: ISubScore[]
  gaps: IGap[]
  matchedSkills: string[]
  missingSkills: string[]
  roadmap?: any
  explanations?: any[]
  roleId?: any
}

interface AppState {
  user: User | null
  profile: Profile | null
  assessment: Assessment | null
  setUser: (u: User) => void
  setProfile: (p: Profile) => void
  setAssessment: (a: Assessment) => void
}

export const useStore = create<AppState>()((set) => ({
  user: { id: 1, name: "Demo User", email: "demo@example.com" }, // mock for MVP
  profile: null,
  assessment: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAssessment: (assessment) => set({ assessment })
}))
