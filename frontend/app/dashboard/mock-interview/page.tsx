"use client"

import { useState } from "react"
import { Mic, Video, VideoOff, MicOff, PhoneOff, Settings, CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useStore } from "@/lib/store"

export default function MockInterviewPage() {
    const { assessment } = useStore()
    const [isStarted, setIsStarted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [micOn, setMicOn] = useState(true)
    const [cameraOn, setCameraOn] = useState(true)

    const [questions, setQuestions] = useState<Array<{question: string, type: string, expectedAnswer?: string, hints?: string[]}>>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [dialog, setDialog] = useState<{speaker: 'AI' | 'You' | 'Feedback', text: string}[]>([])
    const [answer, setAnswer] = useState("")
    const [isEvaluating, setIsEvaluating] = useState(false)

    const startInterview = async () => {
        setIsLoading(true)
        try {
            const roleId = assessment?.roleId?._id || assessment?.roleId;
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
            
            // Show feedback
            setDialog(prev => [...prev, { speaker: 'Feedback', text: `Score: ${res.data.evaluation?.score}/10 - ${res.data.evaluation?.feedback || 'Good attempt.'}` }])

            // Next question after a short delay
            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setDialog(prev => [...prev, { speaker: 'AI', text: questions[currentIndex + 1]?.question || "" }])
                } else {
                    setDialog(prev => [...prev, { speaker: 'AI', text: "That concludes our interview. Excellent work!" }])
                }
            }, 2000)

        } catch (error) {
            console.error(error)
            setDialog(prev => [...prev, { speaker: 'Feedback', text: "Evaluation failed. Let's move to the next question." }])
            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setDialog(prev => [...prev, { speaker: 'AI', text: questions[currentIndex + 1]?.question || "" }])
                }
            }, 1000)
        } finally {
            setIsEvaluating(false)
        }
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
                            <img src="/avatars/01.png" alt="Preview" className="w-full h-full object-cover opacity-80" />
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
                    <p className="text-[15px] text-[#2B2D2B]/60 mt-1 font-medium">Question {Math.min(currentIndex + 1, 5)} of 5</p>
                </div>
                <div className="w-64 glass-panel p-3 rounded-2xl hidden md:block border-white/60">
                    <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-widest text-[#2B2D2B]/50">
                        <span>Progress</span>
                        <span className="text-[#111]">{Math.round((currentIndex / 5) * 100)}%</span>
                    </div>
                    <Progress value={(currentIndex / 5) * 100} className="h-2 bg-[#2B2D2B]/5" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Video Panel */}
                <div className="lg:col-span-2 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col relative border border-white/60 shadow-sm">
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-10 text-center space-y-8">
                        <div className="h-32 w-32 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center relative">
                            <div className={`absolute inset-0 border-2 border-primary/40 rounded-full opacity-30 duration-1000 ${isEvaluating ? 'animate-none' : 'animate-ping'}`}></div>
                            <img src="/avatars/04.png" alt="AI Agent" className="h-[110px] w-[110px] rounded-full object-cover bg-white shadow-sm" />
                        </div>
                        <div className="flex-1 max-h-48 overflow-y-auto w-full flex items-start justify-center custom-scrollbar px-4">
                            <p className="text-2xl font-normal text-[#111] max-w-xl leading-relaxed">
                                {questions[currentIndex]?.question || "Interview Complete."}
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
                        <button className="h-14 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] border-0 ml-4 font-semibold flex items-center transition" onClick={() => setIsStarted(false)}>
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
                                 disabled={currentIndex >= 5 || isEvaluating}
                             />
                             <button 
                                type="submit" 
                                disabled={currentIndex >= 5 || isEvaluating || !answer.trim()}
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
