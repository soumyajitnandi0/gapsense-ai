"use client"

import { useState } from "react"
import { Mic, Video, VideoOff, MicOff, PhoneOff, Settings, CheckCircle2, Send, Trophy, RotateCcw, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { PremiumCard } from "@/components/ui/PremiumCard"
import api from "@/lib/api"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface QuestionScore {
    question: string
    score: number
    feedback: string
}

export default function MockInterviewPage() {
    const { assessment } = useStore()
    const router = useRouter()
    const [isStarted, setIsStarted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [micOn, setMicOn] = useState(true)
    const [cameraOn, setCameraOn] = useState(true)
    const [showSummary, setShowSummary] = useState(false)

    const [questions, setQuestions] = useState<Array<{question: string, type: string, expectedAnswer?: string, hints?: string[]}>>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [dialog, setDialog] = useState<{speaker: 'AI' | 'You' | 'Feedback', text: string}[]>([])
    const [answer, setAnswer] = useState("")
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [scores, setScores] = useState<QuestionScore[]>([])

    const startInterview = async () => {
        setIsLoading(true)
        setShowSummary(false)
        setScores([])
        try {
            const roleId = typeof assessment?.roleId === 'object' ? (assessment.roleId as any)?._id : assessment?.roleId;
            const res = await api.post('/chat/mock-interview/questions', { 
                roleId: roleId,
                difficulty: 'medium', 
                count: 5 
            })
            const generatedQuestions = res.data.questions || [{question: "Tell me about your background."}, {question: "How do you handle technical debt?"}]
            setQuestions(generatedQuestions)
            setDialog([{ speaker: 'AI', text: generatedQuestions[0]?.question || "Tell me about yourself." }])
            setCurrentIndex(0)
            setIsStarted(true)
        } catch (error) {
            console.error("Failed to start", error)
            alert("Could not load questions. Check backend connectivity.")
        } finally {
            setIsLoading(false)
        }
    }

    const submitAnswer = async () => {
        if (!answer.trim() || isEvaluating) return
        
        const currentAnswer = answer
        setAnswer("")
        setDialog(prev => [...prev, { speaker: 'You', text: currentAnswer }])
        setIsEvaluating(true)

        try {
            const res = await api.post('/chat/mock-interview/evaluate', {
                question: questions[currentIndex]?.question || "",
                answer: currentAnswer,
                type: 'technical'
            })
            
            const score = res.data.evaluation?.score || 5
            const feedback = res.data.evaluation?.feedback || 'Good attempt.'
            
            // Track score
            setScores(prev => [...prev, {
                question: questions[currentIndex]?.question || "",
                score,
                feedback
            }])

            // Show feedback
            setDialog(prev => [...prev, { speaker: 'Feedback', text: `Score: ${score}/10 - ${feedback}` }])

            // Next question after a short delay
            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setDialog(prev => [...prev, { speaker: 'AI', text: questions[currentIndex + 1]?.question || "" }])
                } else {
                    // Show summary
                    setDialog(prev => [...prev, { speaker: 'AI', text: "That concludes our interview. Let me prepare your results..." }])
                    setTimeout(() => setShowSummary(true), 1500)
                }
            }, 2000)

        } catch (error) {
            console.error(error)
            setScores(prev => [...prev, {
                question: questions[currentIndex]?.question || "",
                score: 0,
                feedback: "Evaluation failed."
            }])
            setDialog(prev => [...prev, { speaker: 'Feedback', text: "Evaluation failed. Let's move to the next question." }])
            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setDialog(prev => [...prev, { speaker: 'AI', text: questions[currentIndex + 1]?.question || "" }])
                } else {
                    setTimeout(() => setShowSummary(true), 1000)
                }
            }, 1000)
        } finally {
            setIsEvaluating(false)
        }
    }

    const resetInterview = () => {
        setIsStarted(false)
        setShowSummary(false)
        setScores([])
        setDialog([])
        setCurrentIndex(0)
        setQuestions([])
    }

    // Summary Screen
    if (showSummary && scores.length > 0) {
        const avgScore = Math.round((scores.reduce((sum, s) => sum + s.score, 0) / scores.length) * 10) / 10
        const grade = avgScore >= 8 ? 'Excellent' : avgScore >= 6 ? 'Good' : avgScore >= 4 ? 'Needs Work' : 'Keep Practicing'
        const gradeColor = avgScore >= 8 ? 'text-emerald-600' : avgScore >= 6 ? 'text-primary' : avgScore >= 4 ? 'text-orange-500' : 'text-red-500'

        return (
            <div className="w-full pb-20 animate-in fade-in duration-700 text-[#2B2D2B]">
                <div className="text-center mb-12">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 border border-primary/20">
                        <Trophy className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-heading font-medium tracking-tight text-[#111] mb-3">Interview Complete</h1>
                    <p className="text-[#2B2D2B]/60 text-lg">Here&apos;s how you performed across {scores.length} questions</p>
                </div>

                {/* Score Overview */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
                    <PremiumCard variant="white" className="p-8 text-center shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/40 mb-3">Average Score</p>
                        <p className="text-6xl font-light tracking-tighter text-[#111]">{avgScore}<span className="text-xl text-[#2B2D2B]/40">/10</span></p>
                    </PremiumCard>
                    <PremiumCard variant="white" className="p-8 text-center shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/40 mb-3">Performance</p>
                        <p className={`text-4xl font-medium tracking-tight ${gradeColor}`}>{grade}</p>
                    </PremiumCard>
                    <PremiumCard variant="white" className="p-8 text-center shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#2B2D2B]/40 mb-3">Questions</p>
                        <p className="text-6xl font-light tracking-tighter text-[#111]">{scores.length}</p>
                    </PremiumCard>
                </div>

                {/* Per-question breakdown */}
                <div className="max-w-4xl mx-auto space-y-4 mb-12">
                    <h3 className="text-xl font-semibold text-[#111] mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" /> Question Breakdown
                    </h3>
                    {scores.map((s, idx) => (
                        <PremiumCard variant="white" key={idx} className="p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B2D2B]/40 mb-1">Question {idx + 1}</p>
                                    <p className="text-[15px] font-medium text-[#111]">{s.question}</p>
                                </div>
                                <div className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                                    s.score >= 8 ? 'bg-emerald-500' : s.score >= 6 ? 'bg-primary' : s.score >= 4 ? 'bg-orange-400' : 'bg-red-400'
                                }`}>
                                    {s.score}
                                </div>
                            </div>
                            <p className="text-sm text-[#2B2D2B]/60 leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-black/[0.03]">{s.feedback}</p>
                        </PremiumCard>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button onClick={resetInterview} className="flex items-center gap-2 px-8 py-3 bg-white border border-black/10 text-[#111] rounded-full font-semibold hover:bg-black/5 transition shadow-sm">
                        <RotateCcw className="h-4 w-4" /> Try Again
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-8 py-3 bg-[#111] text-white rounded-full font-semibold hover:bg-black transition shadow-lg">
                        Back to Dashboard <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )
    }

    if (!isStarted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse border border-primary/40 shadow-sm">
                    <Video className="h-10 w-10 text-primary" />
                </div>
                <div className="max-w-md space-y-2 mb-4">
                    <h1 className="text-4xl font-normal font-heading tracking-tight text-[#111]">Interactive Mock Interview</h1>
                    <p className="text-[#2B2D2B]/60 text-lg">
                        Your AI interviewer will generate 5 questions focused on your target role.
                    </p>
                </div>

                <div className="w-full max-w-lg glass-panel p-6 rounded-[2.5rem]">
                    <div className="aspect-video bg-[#1a1a1a] rounded-[1.5rem] mb-6 flex items-center justify-center border border-black/5 relative overflow-hidden shadow-inner">
                        {cameraOn ? (
                            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <Video className="h-8 w-8 text-white/60" />
                                </div>
                            </div>
                        ) : (
                            <VideoOff className="text-white/30 h-10 w-10" />
                        )}
                        <div className="absolute bottom-4 right-4 flex gap-3">
                            <button className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition ${micOn ? 'bg-white/20 text-white hover:bg-white/30 border border-white/20' : 'bg-red-500/80 text-white border border-red-400'}`} onClick={() => setMicOn(!micOn)}>
                                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </button>
                            <button className={`h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition ${cameraOn ? 'bg-white/20 text-white hover:bg-white/30 border border-white/20' : 'bg-red-500/80 text-white border border-red-400'}`} onClick={() => setCameraOn(!cameraOn)}>
                                {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <button 
                        disabled={isLoading} 
                        className="w-full h-14 text-[15px] font-semibold bg-[#111] hover:bg-black text-white rounded-full border-0 shadow-lg disabled:opacity-70 transition flex items-center justify-center gap-2" 
                        onClick={startInterview}
                    >
                        {isLoading ? (
                            <>
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                Generating Session...
                            </>
                        ) : "Join Interview Room"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-8rem)] pb-8 text-[#2B2D2B]">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-medium font-heading flex items-center gap-3 tracking-tight text-[#111]">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                        Interview in Progress
                    </h2>
                    <p className="text-[15px] text-[#2B2D2B]/60 mt-1 font-medium">Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}</p>
                </div>
                <div className="w-64 glass-panel p-3 rounded-2xl hidden md:block border-white/60">
                    <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-widest text-[#2B2D2B]/50">
                        <span>Progress</span>
                        <span className="text-[#111]">{Math.round(((currentIndex + (scores.length > currentIndex ? 1 : 0)) / questions.length) * 100)}%</span>
                    </div>
                    <Progress value={((currentIndex + (scores.length > currentIndex ? 1 : 0)) / questions.length) * 100} className="h-2 bg-[#2B2D2B]/5" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Video Panel */}
                <div className="lg:col-span-2 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col relative border border-white/60 shadow-sm">
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-10 text-center space-y-8">
                        <div className="h-32 w-32 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center relative">
                            <div className={`absolute inset-0 border-2 border-primary/40 rounded-full opacity-30 duration-1000 ${isEvaluating ? 'animate-none' : 'animate-ping'}`}></div>
                            <div className="h-[110px] w-[110px] rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-4xl">🤖</span>
                            </div>
                        </div>
                        <div className="flex-1 max-h-48 overflow-y-auto w-full flex items-start justify-center custom-scrollbar px-4">
                            <p className="text-2xl font-normal text-[#111] max-w-xl leading-relaxed">
                                {currentIndex < questions.length ? questions[currentIndex]?.question : "Interview Complete! Check your results."}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-white/40 border-t border-black/5 flex justify-center gap-6 z-10 backdrop-blur-xl">
                        <button className={`h-14 w-14 rounded-full flex items-center justify-center transition shadow-sm border ${micOn ? 'bg-white border-black/5 text-[#111] hover:bg-black/5' : 'bg-red-50 text-red-500 border-red-200'}`} onClick={() => setMicOn(!micOn)}>
                            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </button>
                        <button className={`h-14 w-14 rounded-full flex items-center justify-center transition shadow-sm border ${cameraOn ? 'bg-white border-black/5 text-[#111] hover:bg-black/5' : 'bg-red-50 text-red-500 border-red-200'}`} onClick={() => setCameraOn(!cameraOn)}>
                            {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </button>
                        <button className="h-14 w-14 rounded-full flex items-center justify-center bg-white border-black/5 text-[#111] hover:bg-black/5 transition shadow-sm border">
                            <Settings className="h-5 w-5 text-[#2B2D2B]/70" />
                        </button>
                        <button className="h-14 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] border-0 ml-4 font-semibold flex items-center transition" onClick={resetInterview}>
                            <PhoneOff className="h-5 w-5 mr-2" /> End
                        </button>
                    </div>
                </div>

                {/* Side Transcription & Feedback Panel */}
                <div className="lg:col-span-1 glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border border-white/60 shadow-sm relative">
                    <div className="p-6 border-b border-black/5 bg-white/40 flex items-center justify-between">
                        <h3 className="font-semibold text-[#111] flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> Transcription
                        </h3>
                        {scores.length > 0 && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                Avg: {Math.round((scores.reduce((s, q) => s + q.score, 0) / scores.length) * 10) / 10}/10
                            </span>
                        )}
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar bg-white/20">
                        {dialog.map((d, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${d.speaker === 'AI' ? 'text-primary' : d.speaker === 'Feedback' ? 'text-emerald-600' : 'text-[#2B2D2B]/50'}`}>
                                    {d.speaker}
                                </span>
                                <div className={`text-[14px] leading-relaxed ${d.speaker === 'AI' ? 'text-[#111] font-medium' : d.speaker === 'Feedback' ? 'text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-100' : 'text-[#2B2D2B] border-l-2 border-black/10 pl-3 py-1'}`}>
                                    {d.text}
                                </div>
                            </div>
                        ))}
                        {isEvaluating && (
                            <div className="flex items-center gap-1.5 pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2B2D2B]/40">System</span>
                                <div className="flex items-center gap-1 ml-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#111]/40 animate-bounce delay-75"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#111]/40 animate-bounce delay-150"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#111]/40 animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white/60 border-t border-black/5">
                         <form onSubmit={(e) => { e.preventDefault(); submitAnswer(); }} className="flex gap-2 relative">
                             <Input 
                                 value={answer} 
                                 onChange={(e) => setAnswer(e.target.value)} 
                                 placeholder="Type response aloud..." 
                                 className="h-12 bg-white border border-black/5 shadow-sm rounded-2xl pl-4 pr-12 text-[14px] focus-visible:ring-primary/20"
                                 disabled={currentIndex >= questions.length || isEvaluating}
                             />
                             <button 
                                type="submit" 
                                disabled={currentIndex >= questions.length || isEvaluating || !answer.trim()}
                                className="absolute right-1.5 top-1.5 h-9 w-9 bg-[#111] text-white rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black shadow-sm"
                             >
                                 <Send className="h-4 w-4 ml-0.5" />
                             </button>
                         </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
