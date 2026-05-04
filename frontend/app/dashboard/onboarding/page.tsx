"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle2, Target, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useStore } from "@/lib/store"
import { PremiumCard } from "@/components/ui/PremiumCard"

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    
    // Step 2 State
interface Role {
    _id: string
    name: string
}

    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [jd, setJd] = useState("")

    const router = useRouter()
    const { setProfile } = useStore()

    useEffect(() => {
        api.get("/roles").then(res => {
            setRoles(res.data.roles || [])
        }).catch(err => console.error(err))
    }, [])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = () => setIsDragging(false)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile)
        setIsUploading(true)
        
        try {
            const formData = new FormData()
            formData.append("resume", selectedFile)
            
            const res = await api.post(`/profile/resume`, formData)
            
            setProfile(res.data.parsedData)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed. Make sure the backend is running.")
            setFile(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleAnalyze = async () => {
        setIsAnalyzing(true)
        try {
            let activeRoleId = selectedRole;

            if (jd) {
                const roleRes = await api.post('/roles/from-jd', {
                    jdText: jd
                });
                
                if (roleRes.data && roleRes.data.role) {
                    activeRoleId = roleRes.data.role._id;
                } else {
                    throw new Error("Could not parse JD properly.");
                }
            }

            const onboardingRes = await api.post('/onboarding/complete', {
                roleId: activeRoleId
            });
            
            useStore.getState().setAssessment(onboardingRes.data.assessment)

            router.push("/dashboard")
        } catch (error: unknown) {
            console.error("Analysis failed", error)
            alert((error as { response?: { data?: { error?: string } } }).response?.data?.error || "Analysis failed. Ensure your JD text is valid.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-4 mb-8">
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter leading-none">Upload your Resume</h1>
                <p className="text-black/60 text-xs font-black uppercase tracking-widest">We'll automatically extract your skills and projects to baseline your readiness.</p>
            </div>
            <div
                className={`relative group flex flex-col items-center justify-center p-12 border-4 border-dashed transition-all duration-300
                    ${isDragging ? "border-primary bg-primary/10 shadow-hard" : "border-black bg-white shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none"}
                    ${file ? "border-solid border-primary bg-primary/5" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {!file ? (
                    <>
                        <div className={`p-6 border-4 border-black transition-colors shadow-hard ${isDragging ? "bg-primary text-black" : "bg-white text-black group-hover:bg-primary"}`}>
                            <UploadCloud className="h-10 w-10" />
                        </div>
                        <p className="text-xl font-black uppercase tracking-widest text-black mt-6 mb-1">{isDragging ? "Drop your resume here" : "Click or drag resume"}</p>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center w-full">
                        {isUploading ? (
                            <>
                                <div className="h-16 w-16 border-8 border-black border-t-primary animate-spin mb-6 shadow-hard" />
                                <p className="text-black font-black uppercase tracking-widest">Extracting Skills...</p>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40 mt-2">Parsing your experience with AI</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-primary border-4 border-black text-black mb-4 shadow-hard"><CheckCircle2 className="h-8 w-8" strokeWidth={4} /></div>
                                <div className="flex items-center gap-3 bg-white px-6 py-3 border-4 border-black mb-4 shadow-hard">
                                    <FileText className="h-5 w-5 text-black" />
                                    <span className="text-sm font-black uppercase tracking-widest text-black max-w-[250px] truncate">{file.name}</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary bg-black px-2 py-1">Successfully extracted your profile</p>
                                <Button variant="ghost" size="sm" className="mt-6 text-xs font-black uppercase tracking-widest text-black/40 hover:text-black border-2 border-transparent hover:border-black transition-all" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFile(null) }}>
                                    Upload a different file
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-6">
                <Button className="h-14 px-10 bg-black text-white border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all disabled:opacity-50" disabled={!file || isUploading} onClick={() => setStep(2)}>
                    Next: Target Role <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </motion.div>
    )

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-4 mb-8">
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter leading-none">Role Intelligence</h1>
                <p className="text-black/60 text-xs font-black uppercase tracking-widest">Tell us what you're aiming for so we can tailor your gap analysis.</p>
            </div>
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-[#111] flex items-center gap-2 ml-1">
                        <Target className="h-4 w-4" /> Select Target Role
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {roles.length === 0 && <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40 col-span-2">No roles found...</p>}
                        {roles.map((role) => (
                            <button
                                key={role._id}
                                onClick={() => { setSelectedRole(role._id); setJd("") }}
                                className={`p-5 border-4 transition-all duration-200 text-left font-black uppercase tracking-widest text-sm ${selectedRole === role._id ? "bg-black border-black text-white shadow-hard-lg -translate-y-1 translate-x-1" : "bg-white border-black text-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none"}`}
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-black/10"></div>
                    <span className="shrink-0 px-4 text-xs text-[#2B2D2B]/40 uppercase tracking-widest font-bold">Or upload JD</span>
                    <div className="flex-grow border-t border-black/10"></div>
                </div>

                <div className="space-y-4">
                    <textarea value={jd} onChange={(e) => { setJd(e.target.value); if (e.target.value) setSelectedRole("") }} placeholder="PASTE A FULL JOB DESCRIPTION HERE..." className="w-full h-40 bg-white border-4 border-black p-6 text-sm font-black uppercase tracking-widest text-black placeholder:text-black/20 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-hard resize-none" />
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t-4 border-black mt-4">
                <Button variant="ghost" className="h-14 px-8 border-4 border-transparent hover:border-black hover:bg-muted text-black transition font-black uppercase tracking-widest" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-5 w-5" /> Back</Button>
                <Button disabled={(!selectedRole && !jd) || isAnalyzing} onClick={handleAnalyze} className="h-14 px-10 bg-primary text-black border-4 border-black shadow-hard hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all disabled:opacity-50 font-black uppercase tracking-widest">
                    {isAnalyzing ? "Analyzing..." : "Analyze Readiness"} <Sparkles className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </motion.div>
    )

    return (
        <div className="flex min-h-[85vh] flex-col items-center justify-center p-8 bg-background">
            <div className="w-full max-w-2xl">
                <div className="flex justify-center gap-4 mb-12">
                    <div className={`h-4 w-16 border-4 border-black transition-all duration-500 shadow-hard ${step >= 1 ? "bg-primary" : "bg-white"}`} />
                    <div className={`h-4 w-16 border-4 border-black transition-all duration-500 shadow-hard ${step >= 2 ? "bg-primary" : "bg-white"}`} />
                </div>
                <PremiumCard className="p-10 border-8 border-black shadow-hard-xl rounded-none">
                    <AnimatePresence mode="wait">
                        {step === 1 && <div key="step1" className="animate-in fade-in slide-in-from-right-4 duration-500">{renderStep1()}</div>}
                        {step === 2 && <div key="step2" className="animate-in fade-in slide-in-from-right-4 duration-500">{renderStep2()}</div>}
                    </AnimatePresence>
                </PremiumCard>
            </div>
        </div>
    )
}
