"use client"

import { useState } from "react"
import { Mic, Video, VideoOff, MicOff, PhoneOff, Settings, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function MockInterviewPage() {
    const [isStarted, setIsStarted] = useState(false)
    const [micOn, setMicOn] = useState(true)
    const [cameraOn, setCameraOn] = useState(true)

    if (!isStarted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse border border-primary/50 shadow-[0_0_30px_-5px_hsl(var(--primary))]">
                    <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="max-w-md space-y-2">
                    <h1 className="text-3xl font-bold font-heading text-white">System Design Interview</h1>
                    <p className="text-muted-foreground">
                        Your AI interviewer will ask you 5 questions focused on Microservices and Database Scaling. Estimated duration: 15 minutes.
                    </p>
                </div>

                <Card className="w-full max-w-sm border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-4">
                    <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
                        {cameraOn ? (
                            <img src="/avatars/01.png" alt="Preview" className="h-[80%] opacity-50 blur-[2px]" />
                        ) : (
                            <VideoOff className="text-white/20 h-10 w-10" />
                        )}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-black/70 border border-white/10 backdrop-blur-md text-white" onClick={() => setMicOn(!micOn)}>
                                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-400" />}
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-black/70 border border-white/10 backdrop-blur-md text-white" onClick={() => setCameraOn(!cameraOn)}>
                                {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-red-400" />}
                            </Button>
                        </div>
                    </div>
                    <Button variant="glow" className="w-full h-12 text-base shadow-[0_0_20px_-5px_hsl(var(--primary))] bg-gradient-to-r from-primary to-blue-600 border-0" onClick={() => setIsStarted(true)}>
                        Join Interview Room
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        Interview in Progress
                    </h2>
                    <p className="text-sm text-muted-foreground">Question 1 of 5</p>
                </div>
                <div className="w-64">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Session Progress</span>
                        <span className="text-primary font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2 bg-white/10 inner-shadow" />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 flex-1">
                <Card className="md:col-span-2 border-white/10 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-50 pointer-events-none" />

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8 text-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]">
                            {/* Soundwave effect rings */}
                            <div className="absolute inset-0 border border-blue-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                            <img src="/avatars/04.png" alt="AI Agent" className="h-20 w-20 rounded-full" />
                        </div>
                        <div className="h-16">
                            <p className="text-xl font-medium text-white max-w-lg leading-relaxed">
                                "Before we start scaling the database, how exactly would you design the API Gateway to rate-limit incoming requests dynamically?"
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-black/50 border-t border-white/10 flex justify-center gap-4 z-10 backdrop-blur-xl">
                        <Button size="lg" variant="outline" className={`rounded-full h-14 w-14 ${!micOn ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all`} onClick={() => setMicOn(!micOn)}>
                            {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                        </Button>
                        <Button size="lg" variant="outline" className={`rounded-full h-14 w-14 ${!cameraOn ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all`} onClick={() => setCameraOn(!cameraOn)}>
                            {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full h-14 w-14 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <Settings className="h-6 w-6" />
                        </Button>
                        <Button size="lg" className="rounded-full h-14 px-8 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] border-0 ml-4 font-semibold" onClick={() => setIsStarted(false)}>
                            <PhoneOff className="h-5 w-5 mr-2" /> End Interview
                        </Button>
                    </div>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> Live Transcription
                        </h3>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                        <div className="text-sm text-blue-400">
                            <strong>AI:</strong> Welcome! Let's talk about System Design. To start, if you were building an e-commerce platform...
                        </div>
                        <div className="text-sm text-white/80 border-l-2 border-primary/50 pl-3">
                            <strong>You:</strong> I think I would use a microservices approach to separate user accounts from product catalog.
                        </div>
                        <div className="text-sm text-blue-400">
                            <strong>AI:</strong> That makes sense. Before we start scaling the database, how exactly would you design the API Gateway to rate-limit incoming requests dynamically?
                        </div>

                        {/* Currently typing indicator */}
                        {micOn && (
                            <div className="flex items-center gap-1 text-primary pt-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-75"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-150"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-300"></span>
                                <span className="text-xs text-primary/70 ml-2">Listening...</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
