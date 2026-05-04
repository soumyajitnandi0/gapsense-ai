"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle2, Target, Building2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
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
    const [roles, setRoles] = useState<any[]>([])
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
        } catch (error: any) {
            console.error("Analysis failed", error)
            alert(error.response?.data?.error || "Analysis failed. Ensure your JD text is valid.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-heading font-medium text-[#111] tracking-tight">Upload your Resume</h1>
                <p className="text-[#2B2D2B]/60 text-sm">We&apos;ll automatically extract your skills and projects to baseline your readiness.</p>
            </div>
            <div
                className={`relative group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] transition-all duration-300
                    ${isDragging ? "border-primary bg-primary/5" : "border-black/10 hover:border-black/20 hover:bg-[#FAF9F6]"}
                    ${file ? "border-solid border-primary/30 bg-primary/5" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {!file ? (
                    <>
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? "bg-primary/10 text-primary" : "bg-black/5 text-[#2B2D2B]/60 group-hover:text-[#111]"}`}>
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-medium text-[#111] mb-1">{isDragging ? "Drop your resume here" : "Click or drag resume"}</p>
                        <p className="text-xs text-[#2B2D2B]/40">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center w-full">
                        {isUploading ? (
                            <>
                                <div className="h-12 w-12 rounded-full border-2 border-black/10 border-t-primary animate-spin mb-4" />
                                <p className="text-[#111] font-medium">Extracting Skills...</p>
                                <p className="text-xs text-[#2B2D2B]/40 mt-1">Parsing your experience with AI</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3"><CheckCircle2 className="h-6 w-6" /></div>
                                <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl border border-black/5 mb-2 shadow-sm">
                                    <FileText className="h-4 w-4 text-[#2B2D2B]/40" />
                                    <span className="text-sm font-medium text-[#111] max-w-[200px] truncate">{file.name}</span>
                                </div>
                                <p className="text-xs text-primary font-medium">Successfully extracted your profile</p>
                                <Button variant="ghost" size="sm" className="mt-4 text-xs text-[#2B2D2B]/40 hover:text-[#111] relative z-10" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFile(null) }}>
                                    Upload a different file
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-4">
                <button className="gap-2 flex items-center px-8 py-3 rounded-full bg-[#111] text-white font-semibold shadow-lg hover:bg-black transition disabled:opacity-50" disabled={!file || isUploading} onClick={() => setStep(2)}>
                    Next: Target Role <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-heading font-medium text-[#111] tracking-tight">Role Intelligence</h1>
                <p className="text-[#2B2D2B]/60 text-sm">Tell us what you&apos;re aiming for so we can tailor your gap analysis.</p>
            </div>
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-[#111] flex items-center gap-2 ml-1">
                        <Target className="h-4 w-4" /> Select Target Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {roles.length === 0 && <p className="text-xs text-[#2B2D2B]/40 col-span-2">No roles found...</p>}
                        {roles.map((role) => (
                            <button
                                key={role._id}
                                onClick={() => { setSelectedRole(role._id); setJd("") }}
                                className={`p-4 rounded-2xl border text-sm font-medium transition-all duration-300 text-left ${selectedRole === role._id ? "bg-[#111] border-[#111] text-white shadow-lg" : "bg-white border-black/5 text-[#2B2D2B] hover:bg-[#FAF9F6] hover:border-black/10"}`}
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

                <div className="space-y-3">
                    <textarea value={jd} onChange={(e) => { setJd(e.target.value); if (e.target.value) setSelectedRole("") }} placeholder="Paste a full Job Description here..." className="w-full h-32 bg-white border border-black/5 rounded-2xl p-4 text-sm text-[#111] placeholder:text-[#2B2D2B]/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none transition-all shadow-sm" />
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-black/5 mt-2">
                <button className="gap-2 flex items-center text-[#2B2D2B]/60 hover:text-[#111] px-6 py-3 rounded-full transition font-medium" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</button>
                <button disabled={(!selectedRole && !jd) || isAnalyzing} onClick={handleAnalyze} className="gap-2 flex items-center px-8 py-3 bg-primary text-[#111] rounded-full font-bold shadow-lg hover:bg-primary/90 transition disabled:opacity-50">
                    {isAnalyzing ? "Analyzing..." : "Analyze Readiness"} <Sparkles className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= 1 ? "bg-primary" : "bg-black/10"}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= 2 ? "bg-primary" : "bg-black/10"}`} />
                </div>
                <PremiumCard className="p-8 sm:p-10 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === 1 && <div key="step1">{renderStep1()}</div>}
                        {step === 2 && <div key="step2">{renderStep2()}</div>}
                    </AnimatePresence>
                </PremiumCard>
            </div>
        </div>
    )
}
