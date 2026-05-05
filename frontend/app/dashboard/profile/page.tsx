"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, User, FileText, Loader2, Code2, Briefcase, GraduationCap, Building, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ProfileData {
    skills: Array<{ name: string; level?: string; category?: string; source?: string }>
    projects: Array<{ name: string; description?: string; technologies?: string[]; link?: string }>
    education: Array<{ institution: string; degree?: string; field?: string }>
    experience: Array<{ company: string; role?: string; description?: string }>
}

export default function ProfilePage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const { profile, setProfile, assessment, assessments } = useStore()
    const profileRef = useRef<HTMLDivElement>(null)
    const pdfTemplateRef = useRef<HTMLDivElement>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)
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

    const handleExportPDF = async () => {
        if (!pdfTemplateRef.current) return
        setExporting(true)
        try {
            // We use a dedicated hidden template for the PDF to make it unique
            const canvas = await html2canvas(pdfTemplateRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                logging: false,
            })
            
            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 3, canvas.height / 3]
            })
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
            pdf.save(`${user?.name?.replace(/\s+/g, '_')}_Career_Artifact.pdf`)
            
            toast({
                title: "Export Success",
                description: "Your unique career artifact has been generated.",
            })
        } catch (error) {
            console.error("PDF Export Error:", error)
            toast({
                title: "Export Failed",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive",
            })
        } finally {
            setExporting(false)
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
    const formattedDate = assessment?.createdAt ? new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
    const resumeName = assessment?.resumeData?.url?.split('/').pop()?.split('-').slice(1).join('-') || `${user?.name?.replace(' ', '_')}_Resume.pdf`;

    return (
        <div ref={profileRef} className="w-full pb-20 animate-in fade-in duration-500 text-[#2B2D2B] bg-[#F8F8F8] p-4">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl lg:text-[48px] font-black uppercase tracking-tighter text-black mb-2">Profile</h1>
                <p className="text-[16px] text-black font-bold uppercase tracking-widest max-w-xl">
                    Manage your account settings, resume, and extracted career data.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                
                {/* Profile Hero / Header Section */}
                <div className="xl:col-span-12">
                    <PremiumCard className="bg-white p-0 border-4 border-black shadow-hard rounded-none overflow-hidden relative group">
                        {/* Decorative Background Pattern */}
                        <div className="absolute top-0 right-0 w-[400px] h-full bg-primary/20 -skew-x-12 translate-x-20 pointer-events-none border-l-4 border-black/10" />
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
                        
                        <div className="relative z-10 p-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                            <div className="h-40 w-40 rounded-none border-4 border-black bg-primary flex items-center justify-center text-black text-5xl font-black shrink-0 shadow-hard-lg overflow-hidden group-hover:-rotate-3 transition-transform">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-16 w-16 text-black" />
                                )}
                            </div>
                            
                            <div className="flex-grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                                    <h2 className="text-6xl font-black uppercase text-black tracking-tighter leading-none">{user?.name || "User"}</h2>
                                    <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-1 mb-1">PRO MEMBER</span>
                                </div>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Email Address</span>
                                        <span className="text-lg font-black text-black">{user?.email}</span>
                                    </div>
                                    <div className="w-[2px] h-10 bg-black/10 hidden md:block" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Last Updated</span>
                                        <span className="text-lg font-black text-black">{formattedDate}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
                                    <span className="px-4 py-1.5 bg-accent border-2 border-black font-black text-[11px] uppercase tracking-widest shadow-hard-sm italic">
                                        {data?.skills?.length || 0} Skills Mastered
                                    </span>
                                    <span className="px-4 py-1.5 bg-secondary border-2 border-black font-black text-[11px] uppercase tracking-widest shadow-hard-sm italic">
                                        {data?.projects?.length || 0} Projects Completed
                                    </span>
                                    <span className="px-4 py-1.5 bg-primary border-2 border-black font-black text-[11px] uppercase tracking-widest shadow-hard-sm italic">
                                        {data?.experience?.length || 0} Positions Held
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4" data-html2canvas-ignore>
                                <button onClick={handleSave} className="px-8 py-4 bg-black text-white border-4 border-black font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-hard-sm flex items-center gap-3">
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Quick Sync
                                </button>
                                <button 
                                    onClick={handleExportPDF} 
                                    disabled={exporting}
                                    className="px-8 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-hard-sm flex items-center gap-3 disabled:opacity-50"
                                >
                                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </PremiumCard>
                </div>

                {/* LEFT CONTENT: Main Data */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                    
                    {/* Resume Upload Area - Enhanced */}
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none relative overflow-hidden" data-html2canvas-ignore>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-x-4 translate-y-4 blur-2xl" />
                        <div className="mb-8 flex justify-between items-start relative z-10">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-black mb-1 flex items-center gap-4">
                                    <FileText className="h-8 w-8 text-primary" strokeWidth={3} />
                                    Resume Intel
                                </h2>
                                <p className="text-xs font-black uppercase tracking-widest text-black/50">Keep your career data synchronized</p>
                            </div>
                            <div className="bg-primary px-3 py-1 border-2 border-black font-black text-[10px] uppercase tracking-[0.2em] shadow-hard-sm">
                                Auto-Parsing Enabled
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                            <div className="flex-grow w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-black rounded-none cursor-pointer bg-muted/30 hover:bg-accent/20 transition-all group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col items-center justify-center py-5 relative z-10">
                                        {uploading ? (
                                            <Loader2 className="h-10 w-10 mb-3 text-black animate-spin" />
                                        ) : (
                                            <Upload className="h-10 w-10 mb-3 text-black group-hover:-translate-y-2 transition-transform" />
                                        )}
                                        <p className="mb-1 text-sm font-black uppercase tracking-widest text-black">
                                            {uploading ? "Analyzing Artifacts..." : "Drop Resume Here"}
                                        </p>
                                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">PDF · DOCX · TXT (MAX 5MB)</p>
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
                            
                            <div className="flex flex-col gap-4 w-full md:w-64">
                                <div className="p-4 bg-white border-2 border-black shadow-hard-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">Current File</h4>
                                    <p className="text-xs font-black truncate">{resumeName}</p>
                                </div>
                                <div className="p-4 bg-white border-2 border-black shadow-hard-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">Parse Quality</h4>
                                    <div className="h-2 w-full bg-muted border-2 border-black overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-[95%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Experience & Projects Side by Side or Vertical */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Experience */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <Building className="h-6 w-6" /> Experience
                                </h3>
                                <button className="h-8 w-8 bg-black text-white flex items-center justify-center hover:bg-primary hover:text-black transition-colors" data-html2canvas-ignore>
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {data?.experience?.map((exp, idx) => (
                                    <div key={idx} className="p-6 bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-lg uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{exp.role}</h4>
                                            <span className="text-[10px] font-black bg-black text-white px-2 py-0.5">2021-2023</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-black/50 mb-4 bg-accent/10 px-2 py-1 w-fit">{exp.company}</p>
                                        <p className="text-xs font-bold text-black/70 leading-relaxed uppercase line-clamp-3">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <Briefcase className="h-6 w-6" /> Projects
                                </h3>
                                <button className="h-8 w-8 bg-black text-white flex items-center justify-center hover:bg-secondary hover:text-black transition-colors" data-html2canvas-ignore>
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {data?.projects?.map((proj, idx) => (
                                    <div key={idx} className="p-6 bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all group">
                                        <h4 className="font-black text-lg uppercase tracking-tight mb-2 leading-none group-hover:text-secondary transition-colors">{proj.name}</h4>
                                        <p className="text-xs font-bold text-black/70 leading-relaxed uppercase mb-4 line-clamp-2">{proj.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.technologies?.slice(0, 3).map((tech: string, tIdx: number) => (
                                                <span key={tIdx} className="text-[9px] px-1.5 py-0.5 bg-black text-white font-black uppercase tracking-tighter">{tech}</span>
                                            ))}
                                            {proj.technologies && proj.technologies.length > 3 && (
                                                <span className="text-[9px] px-1.5 py-0.5 bg-muted border border-black font-black uppercase tracking-tighter">+{proj.technologies.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT: Secondary Sidebar */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                    
                    {/* Skills Cloud - Enhanced */}
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                        <div className="mb-8 flex justify-between items-center">
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Code2 className="h-6 w-6 text-emerald-500" /> Skills
                            </h3>
                            <button onClick={() => setShowAddSkill(!showAddSkill)} className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 hover:bg-emerald-500 transition-colors" data-html2canvas-ignore>
                                Add New
                            </button>
                        </div>
                        
                        {showAddSkill && (
                            <div className="mb-8 p-6 bg-emerald-50 border-4 border-emerald-500 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <Input value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} placeholder="Skill Name" className="h-10 border-2 border-black rounded-none shadow-hard-sm font-black uppercase text-xs" />
                                <select value={newSkill.level} onChange={(e) => setNewSkill({...newSkill, level: e.target.value})} className="w-full h-10 bg-white border-2 border-black rounded-none text-xs font-black uppercase px-2 shadow-hard-sm">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <button onClick={handleAddSkill} className="w-full h-10 bg-emerald-500 text-black border-2 border-black font-black uppercase text-xs shadow-hard-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                    Confirm Addition
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2.5">
                            {data?.skills?.map((skill, idx) => (
                                <div key={idx} className={cn(
                                    "px-3 py-1.5 border-2 border-black text-[11px] font-black uppercase tracking-tighter shadow-hard-sm flex items-center gap-2",
                                    getLevelColor(skill.level || "")
                                )}>
                                    {skill.name}
                                    <span className="opacity-30">/</span>
                                    <span className="text-[9px]">{skill.level?.charAt(0)}</span>
                                </div>
                            ))}
                        </div>
                    </PremiumCard>

                    {/* Education */}
                    <PremiumCard className="bg-white p-8 border-4 border-black shadow-hard rounded-none">
                         <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 mb-8">
                            <GraduationCap className="h-6 w-6 text-orange-500" /> Education
                        </h3>
                        <div className="space-y-6">
                            {data?.education?.map((edu, idx) => (
                                <div key={idx} className="relative pl-6 border-l-4 border-black">
                                    <div className="absolute -left-[10px] top-0 h-4 w-4 bg-orange-500 border-2 border-black" />
                                    <h4 className="font-black text-sm uppercase tracking-tight mb-1">{edu.institution}</h4>
                                    <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">{edu.degree}</p>
                                    {edu.field && <p className="text-[11px] font-black uppercase text-orange-600 mt-2">{edu.field}</p>}
                                </div>
                            ))}
                        </div>
                    </PremiumCard>

                    {/* Quick Settings / Account */}
                    <PremiumCard className="bg-black text-white p-8 border-4 border-black shadow-hard rounded-none" data-html2canvas-ignore>
                         <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 mb-8 text-white">
                            <User className="h-6 w-6 text-primary" /> Identity
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/10 border-2 border-white/20 h-10 px-3 text-xs font-black uppercase focus:border-primary transition-colors outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Professional Bio</label>
                                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/10 border-2 border-white/20 h-24 p-3 text-xs font-black uppercase focus:border-primary transition-colors outline-none resize-none" />
                            </div>
                            <button onClick={handleSave} className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors">
                                Update Credentials
                            </button>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Unique PDF Template (Hidden from UI, visible only to export) */}
            <div className="fixed top-[-10000px] left-[-10000px] overflow-hidden" aria-hidden="true">
                <div ref={pdfTemplateRef} className="bg-white p-20 w-[900px] min-h-[1200px] text-black font-sans flex flex-col gap-12">
                    {/* Header */}
                    <div className="border-b-[12px] border-black pb-12 flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em]">Personal Artifact</div>
                            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none">{user?.name}</h1>
                            <div className="flex gap-6 items-center">
                                <span className="text-lg font-bold text-primary uppercase">{user?.email}</span>
                                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                                <span className="text-lg font-black uppercase tracking-widest">Career Profile</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                             <div className="h-20 w-20 border-4 border-black bg-primary flex items-center justify-center text-4xl font-black">
                                {user?.name?.charAt(0)}
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-4">Verified By Gapsense AI</p>
                        </div>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-12 gap-16">
                        {/* Left Sidebar */}
                        <div className="col-span-4 flex flex-col gap-12">
                            {/* Skills Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2">Technical Core</h2>
                                <div className="flex flex-col gap-3">
                                    {data?.skills?.map((s, i) => (
                                        <div key={i} className="flex justify-between items-center py-1 border-b border-black/10">
                                            <span className="font-bold uppercase text-xs">{s.name}</span>
                                            <span className="text-[9px] font-black uppercase bg-black text-white px-1.5">{s.level?.charAt(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2">Academic</h2>
                                <div className="flex flex-col gap-8">
                                    {data?.education?.map((e, i) => (
                                        <div key={i} className="space-y-1">
                                            <p className="font-black uppercase text-sm">{e.institution}</p>
                                            <p className="text-xs font-bold text-black/50">{e.degree}</p>
                                            <p className="text-[10px] font-black uppercase text-primary">{e.field}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Career Targets Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2">Career Targets</h2>
                                <div className="flex flex-col gap-4">
                                    {assessments?.length > 0 ? assessments.map((as, i) => (
                                        <div key={i} className="p-3 border-2 border-black flex justify-between items-center bg-accent/5">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-tight">Target Role</p>
                                                <p className="text-xs font-black uppercase leading-tight">
                                                    {typeof as.roleId === 'object' ? as.roleId?.name : (as as any).roleName || "Career Target"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase opacity-40">Readiness</p>
                                                <p className="text-sm font-black text-primary">{as.overallScore}%</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold italic opacity-40">No strategic targets defined.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Content Body */}
                        <div className="col-span-8 flex flex-col gap-12">
                            {/* Professional Experience */}
                            <div className="space-y-8">
                                <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2">Industry Experience</h2>
                                <div className="flex flex-col gap-10">
                                    {data?.experience?.map((exp, i) => (
                                        <div key={i} className="space-y-3 relative pl-8">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-black rotate-45" />
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{exp.role}</h3>
                                                <span className="text-[10px] font-black bg-primary px-2 py-0.5 border border-black italic">Active History</span>
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-black/40">{exp.company}</p>
                                            <p className="text-sm font-medium leading-relaxed text-black/80">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Projects */}
                            <div className="space-y-8">
                                <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2">Strategic Projects</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    {data?.projects?.map((p, i) => (
                                        <div key={i} className="p-5 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
                                            <h4 className="font-black uppercase text-sm tracking-tight">{p.name}</h4>
                                            <p className="text-[11px] font-medium leading-relaxed opacity-70 line-clamp-3">{p.description}</p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {p.technologies?.slice(0, 3).map((t, ti) => (
                                                    <span key={ti} className="text-[8px] font-black uppercase bg-black text-white px-1">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Auth */}
                    <div className="mt-auto pt-12 border-t-[12px] border-black flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Gapsense AI Intelligence System</p>
                            <p className="text-[9px] font-bold text-black/40 uppercase">This document is a verified career snapshot exported on {formattedDate}</p>
                        </div>
                        <div className="text-right">
                             <div className="inline-block border-2 border-black px-4 py-2 font-black uppercase text-xs tracking-widest italic">
                                Original Artifact
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
