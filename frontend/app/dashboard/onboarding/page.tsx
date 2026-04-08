"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle2, Target, Building2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useStore } from "@/lib/store"

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
    const { setProfile } = useStore() // We use API data mostly

    useEffect(() => {
        // Fetch roles for step 2
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
            if (jd) {
                // Future expansion: Create role from JD and assess
                alert("JD Analysis not wired yet. Please select a template role.")
                setIsAnalyzing(false)
                return
            }

            const res = await api.post(`/assessments`, {
                roleId: selectedRole
            })
            
            // Redirect to analysis page to view results
            router.push("/dashboard/analysis")
        } catch (error) {
            console.error("Analysis failed", error)
            alert("Analysis failed.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-heading font-semibold text-white">Upload your Resume</h1>
                <p className="text-muted-foreground text-sm">We'll automatically extract your skills and projects to baseline your readiness.</p>
            </div>
            <div
                className={`relative group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300
                    ${isDragging ? "border-lime-400 bg-lime-400/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"}
                    ${file ? "border-solid border-white/20 bg-white/5" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {!file ? (
                    <>
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? "bg-lime-400/10 text-lime-400" : "bg-white/5 text-muted-foreground group-hover:text-white"}`}>
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-medium text-white mb-1">{isDragging ? "Drop your resume here" : "Click or drag resume"}</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center w-full">
                        {isUploading ? (
                            <>
                                <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-lime-400 animate-spin mb-4" />
                                <p className="text-white font-medium">Extracting Skills...</p>
                                <p className="text-xs text-muted-foreground mt-1">Parsing your experience with AI</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-lime-400/10 text-lime-400 mb-3"><CheckCircle2 className="h-6 w-6" /></div>
                                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 mb-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-white max-w-[200px] truncate">{file.name}</span>
                                </div>
                                <p className="text-xs text-lime-400">Successfully extracted your profile</p>
                                <Button variant="ghost" size="sm" className="mt-4 text-xs text-muted-foreground hover:text-white relative z-10" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFile(null) }}>
                                    Upload a different file
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-4">
                <Button variant="glow" className="gap-2" disabled={!file || isUploading} onClick={() => setStep(2)}>
                    Next: Target Role <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    )

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-heading font-semibold text-white">Role Intelligence</h1>
                <p className="text-muted-foreground text-sm">Tell us what you're aiming for so we can tailor your gap analysis.</p>
            </div>
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Target className="h-4 w-4" /> Select Target Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {roles.length === 0 && <p className="text-xs text-muted-foreground col-span-2">No roles found...</p>}
                        {roles.map((role) => (
                            <button
                                key={role._id}
                                onClick={() => { setSelectedRole(role._id); setJd("") }}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 text-left ${selectedRole === role._id ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`}
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="shrink-0 px-4 text-xs text-muted-foreground uppercase tracking-widest">Or upload JD</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="space-y-3">
                    <textarea value={jd} onChange={(e) => { setJd(e.target.value); if (e.target.value) setSelectedRole("") }} placeholder="Paste a full Job Description here... (Mock UI)" className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-lime-400/50 resize-none transition-all" />
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5 mt-2">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button variant="glow" disabled={(!selectedRole && !jd) || isAnalyzing} onClick={handleAnalyze} className="gap-2 bg-lime-400 text-black hover:bg-lime-500 shadow-[0_0_20px_-5px_rgba(163,230,53,0.4)] hover:shadow-[0_0_25px_-5px_rgba(163,230,53,0.6)]">
                    {isAnalyzing ? "Analyzing..." : "Analyze Readiness"} <Sparkles className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    )

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= 1 ? "bg-primary" : "bg-white/10"}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= 2 ? "bg-primary" : "bg-white/10"}`} />
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl" />
                    <div className="relative p-8 sm:p-10 z-10 overflow-hidden rounded-3xl">
                        <AnimatePresence mode="wait">
                            {step === 1 && <div key="step1">{renderStep1()}</div>}
                            {step === 2 && <div key="step2">{renderStep2()}</div>}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
