"use client"

import { useState, useEffect } from "react"
import { Upload, User, FileText, Loader2, Code2, Briefcase, GraduationCap, Building, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"

interface ProfileData {
    skills: Array<{ name: string; level?: string; category?: string; source?: string }>
    projects: Array<{ name: string; description?: string; technologies?: string[]; link?: string }>
    education: Array<{ institution: string; degree?: string; field?: string }>
    experience: Array<{ company: string; role?: string; description?: string }>
}

export default function ProfilePage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const { profile, setProfile } = useStore()
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
    })
    // Add skill form
    const [showAddSkill, setShowAddSkill] = useState(false)
    const [newSkill, setNewSkill] = useState({ name: "", level: "intermediate" })
    const [addingSkill, setAddingSkill] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                bio: "",
            })
        }
    }, [user])

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile')
            if (res.data?.profile?.parsedData) {
                setProfileData(res.data.profile.parsedData)
                setProfile(res.data.profile.parsedData)
            }
        } catch {
            // Profile may not exist yet
        } finally {
            setLoadingProfile(false)
        }
    }

    const handleResumeUpload = async (file: File) => {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("resume", file)
            const res = await api.post("/profile/resume", formData)
            setProfile(res.data.parsedData)
            setProfileData(res.data.parsedData || res.data.profile?.parsedData)
            toast({
                title: "Success",
                description: "Resume uploaded and parsed successfully!",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload resume. Please try again.",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put("/settings/account", {
                name: formData.name,
                email: formData.email,
            })
            toast({
                title: "Success",
                description: "Profile updated successfully!",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleAddSkill = async () => {
        if (!newSkill.name.trim()) return
        setAddingSkill(true)
        try {
            const res = await api.post('/profile/skills', {
                name: newSkill.name,
                level: newSkill.level,
                category: 'technical'
            })
            if (res.data?.profile?.parsedData) {
                setProfileData(res.data.profile.parsedData)
            } else {
                // Optimistic update
                setProfileData(prev => prev ? {
                    ...prev,
                    skills: [...prev.skills, { name: newSkill.name, level: newSkill.level, category: 'technical', source: 'self_assessed' }]
                } : null)
            }
            setNewSkill({ name: "", level: "intermediate" })
            setShowAddSkill(false)
            toast({ title: "Skill Added", description: `"${newSkill.name}" has been added to your profile.` })
        } catch (error) {
            toast({ title: "Error", description: "Failed to add skill.", variant: "destructive" })
        } finally {
            setAddingSkill(false)
        }
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'advanced': return 'bg-emerald-300 text-black border-black'
            case 'intermediate': return 'bg-primary text-black border-black'
            case 'beginner': return 'bg-orange-300 text-black border-black'
            default: return 'bg-white text-black border-black'
        }
    }

    const data = profileData || profile

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500 text-[#2B2D2B]">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl lg:text-[48px] font-black uppercase tracking-tighter text-black mb-2">Profile</h1>
                <p className="text-[16px] text-black font-bold uppercase tracking-widest max-w-xl">
                    Manage your account settings, resume, and extracted career data.
                </p>
            </div>

            <div className="grid gap-8 max-w-4xl">
                {/* User Avatar & Info */}
                <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard flex items-center gap-6 rounded-none">
                    <div className="h-24 w-24 rounded-none border-4 border-black bg-primary flex items-center justify-center text-black text-3xl font-black shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                        {user?.picture ? (
                            <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-10 w-10 text-black" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase text-black tracking-widest">{user?.name || "User"}</h2>
                        <p className="text-black font-bold uppercase">{user?.email}</p>
                        <p className="text-xs text-black mt-2 font-black uppercase tracking-widest bg-accent px-2 border-2 border-black w-fit">
                            {data?.skills?.length || 0} skills · {data?.projects?.length || 0} projects · {data?.experience?.length || 0} exp
                        </p>
                    </div>
                </PremiumCard>

                {/* Resume Upload */}
                <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <FileText className="h-5 w-5 text-black" />
                            </div> Resume Upload
                        </h2>
                        <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                            Upload your latest resume (PDF/DOCX) to update your readiness score.
                        </p>
                    </div>
                    <div className="flex items-center justify-center w-full mt-4">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-black rounded-none cursor-pointer bg-white hover:bg-accent transition-all group">
                            <div className="flex flex-col items-center justify-center py-5">
                                {uploading ? (
                                    <Loader2 className="h-10 w-10 mb-3 text-black animate-spin" />
                                ) : (
                                    <Upload className="h-10 w-10 mb-3 text-black group-hover:-translate-y-2 transition-transform" />
                                )}
                                <p className="mb-1 text-sm font-black uppercase tracking-widest text-black">
                                    <span className="font-black text-black">{uploading ? "Uploading..." : "Click to upload"}</span>{!uploading && " or drag and drop"}
                                </p>
                                <p className="text-xs font-bold text-black uppercase tracking-widest">PDF or DOCX (MAX. 5MB)</p>
                            </div>
                            <Input 
                                id="dropzone-file" 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                            />
                        </label>
                    </div>
                </PremiumCard>

                {/* Extracted Skills */}
                {data?.skills && data.skills.length > 0 && (
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <Code2 className="h-5 w-5 text-black" />
                                    </div> Skills
                                </h2>
                                <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">Extracted from resume & self-assessments</p>
                            </div>
                            <button onClick={() => setShowAddSkill(!showAddSkill)} className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-black rounded-none text-sm font-black uppercase tracking-widest text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <Plus className="h-5 w-5" /> Add Skill
                            </button>
                        </div>

                        {/* Add Skill Form */}
                        {showAddSkill && (
                            <div className="mb-6 p-6 bg-accent border-4 border-black rounded-none flex flex-col sm:flex-row gap-4 items-end shadow-hard">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-sm font-black uppercase tracking-widest text-black">Skill Name</Label>
                                    <Input value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} placeholder="e.g. TypeScript" className="h-12 bg-white border-4 border-black rounded-none text-sm font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
                                </div>
                                <div className="w-40 space-y-2">
                                    <Label className="text-sm font-black uppercase tracking-widest text-black">Level</Label>
                                    <select value={newSkill.level} onChange={(e) => setNewSkill({...newSkill, level: e.target.value})} className="w-full h-12 bg-white border-4 border-black rounded-none text-sm font-bold px-3 focus:outline-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleAddSkill} disabled={addingSkill || !newSkill.name.trim()} className="h-12 px-6 bg-primary border-4 border-black text-black font-black uppercase tracking-widest rounded-none disabled:opacity-50 flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                        {addingSkill ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
                                    </button>
                                    <button onClick={() => setShowAddSkill(false)} className="h-12 w-12 bg-white border-4 border-black rounded-none flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-4">
                            {data.skills.map((skill, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-sm font-black uppercase tracking-widest border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${getLevelColor(skill.level || "")}`}>
                                    {skill.name}
                                    <span className="text-[10px] font-black bg-white border-2 border-black px-1 py-0.5">{skill.level || "N/A"}</span>
                                </span>
                            ))}
                        </div>
                    </PremiumCard>
                )}

                {/* Extracted Experience */}
                {data?.experience && data.experience.length > 0 && (
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <Building className="h-5 w-5 text-black" />
                                </div> Experience
                            </h2>
                            <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">Work experience extracted from your resume</p>
                        </div>
                        <div className="space-y-6 mt-6">
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-black text-xl uppercase tracking-widest text-black">{exp.role}</h4>
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest text-black bg-primary px-2 border-2 border-black w-fit mb-4">{exp.company}</p>
                                    {exp.description && <p className="text-[15px] font-bold text-black/80 leading-relaxed uppercase">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </PremiumCard>
                )}

                {/* Extracted Education */}
                {data?.education && data.education.length > 0 && (
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <GraduationCap className="h-5 w-5 text-black" />
                                </div> Education
                            </h2>
                            <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">Education details from your resume</p>
                        </div>
                        <div className="space-y-6 mt-6">
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
                                    <h4 className="font-black text-xl uppercase tracking-widest text-black mb-2">{edu.degree}</h4>
                                    <p className="text-sm font-black uppercase tracking-widest text-black bg-primary px-2 border-2 border-black w-fit">{edu.institution}</p>
                                    {edu.field && <p className="text-[15px] font-bold text-black/80 mt-4 uppercase">{edu.field}</p>}
                                </div>
                            ))}
                        </div>
                    </PremiumCard>
                )}

                {/* Extracted Projects */}
                {data?.projects && data.projects.length > 0 && (
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    <Briefcase className="h-5 w-5 text-black" />
                                </div> Projects
                            </h2>
                            <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">Projects from your resume and manual additions</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
                                    <h4 className="font-black text-xl uppercase tracking-widest text-black mb-4">{proj.name}</h4>
                                    <p className="text-sm font-bold text-black/80 leading-relaxed mb-6 uppercase">{proj.description}</p>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {proj.technologies.map((tech: string, tIdx: number) => (
                                                <span key={tIdx} className="text-[11px] px-2 py-1 bg-white border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black uppercase text-black tracking-widest">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </PremiumCard>
                )}

                {/* Personal Information */}
                <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-1 flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <User className="h-5 w-5 text-black" />
                            </div> Personal Information
                        </h2>
                        <p className="text-sm font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                            Update your personal details.
                        </p>
                    </div>
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-black">Full Name</Label>
                                <Input 
                                    id="name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="bg-white border-4 border-black h-14 rounded-none text-[15px] font-bold text-black focus-visible:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-black">Email</Label>
                                <Input 
                                    id="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="bg-white border-4 border-black h-14 rounded-none text-[15px] font-bold text-black focus-visible:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="bio" className="text-sm font-black uppercase tracking-widest text-black">Bio</Label>
                            <Input 
                                id="bio" 
                                placeholder="Full Stack Developer..." 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="bg-white border-4 border-black h-14 rounded-none text-[15px] font-bold text-black focus-visible:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
                            />
                        </div>
                        <div className="flex justify-end pt-6 border-t-4 border-black">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 bg-primary border-4 border-black text-black font-black uppercase tracking-widest rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-3"
                            >
                                {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    )
}
