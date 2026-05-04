"use client"

import * as React from "react"
import { Send, Bot, Sparkles } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { PremiumCard } from "@/components/ui/PremiumCard"
import { useAuth } from "@/contexts/AuthContext"

export default function CoachPage() {
    const { user } = useAuth()
    const [messages, setMessages] = React.useState<any[]>([])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [sessionId, setSessionId] = React.useState<string | null>(null)

    React.useEffect(() => {
        api.get("/chat/session").then((res: any) => {
            if (res.data.session) {
                setSessionId(res.data.session.sessionId)
                if (res.data.session.messages && res.data.session.messages.length > 0) {
                    setMessages(res.data.session.messages)
                } else {
                    setMessages([{ role: "assistant", content: "Hello! I'm your AI Career Coach. I can help you with mock interviews, resume feedback, or technical concepts. What would you like to work on today?" }])
                }
            }
        }).catch((err: any) => console.error("Could not load chat session", err))
    }, [])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        
        const currentInput = input;
        setMessages(prev => [...prev, { role: "user", content: currentInput }])
        setInput("")
        setIsLoading(true)
        
        try {
            const res = await api.post("/chat/message", {
                message: currentInput,
                sessionId
            })
            setMessages(prev => [...prev, { role: "assistant", content: res.data.message }])
            if (res.data.sessionId) setSessionId(res.data.sessionId)
        } catch (error) {
            console.error("Failed to send message", error)
            setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting to the server right now." }])
        } finally {
            setIsLoading(false)
        }
    }

    const clearSession = async () => {
        if (!sessionId) return;
        try {
            await api.delete(`/chat/session/${sessionId}`)
            setMessages([{ role: "assistant", content: "Hello! I'm your AI Career Coach. I can help you with mock interviews, resume feedback, or technical concepts. What would you like to work on today?" }])
            setSessionId(null)
        } catch (error) {
            console.error("Failed to clear session", error)
        }
    }

    return (
        <div className="flex h-[calc(100vh-14rem)] flex-col gap-10 w-full pb-0 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between px-2 gap-4">
                <div className="space-y-1">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black">
                        AI Career Coach
                    </h1>
                    <p className="text-black/80 text-base md:text-lg font-black uppercase tracking-widest mt-2 bg-primary w-fit px-2 border-2 border-black">Your intelligent edge in the job market.</p>
                </div>
                <button 
                    onClick={clearSession}
                    className="flex items-center gap-2 px-6 py-4 bg-white border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 text-black text-sm font-black uppercase tracking-widest"
                >
                    <Sparkles className="h-5 w-5 text-black" />
                    Clear Conversation
                </button>
            </div>

            <PremiumCard className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden relative border-0 shadow-none bg-transparent">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar relative z-10 w-full max-w-5xl mx-auto">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-5 transition-all ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="h-12 w-12 shrink-0 border-4 border-black bg-primary flex items-center justify-center shadow-hard">
                                    <Bot className="h-6 w-6 text-black" />
                                </div>
                            )}
                            <div className={`px-8 py-5 max-w-[85%] md:max-w-[70%] text-[16px] leading-[1.6] shadow-hard border-4 border-black transition-all ${msg.role === 'user'
                                    ? 'bg-black text-white font-black uppercase tracking-widest'
                                    : 'bg-white text-black font-medium'
                                }`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="h-12 w-12 shrink-0 border-4 border-black overflow-hidden shadow-hard bg-black flex items-center justify-center text-white font-black text-sm uppercase">
                                    {user?.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover grayscale" />
                                    ) : (
                                        user?.name ? user.name.charAt(0).toUpperCase() : "ME"
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-5 justify-start">
                            <div className="h-12 w-12 shrink-0 border-4 border-black bg-primary flex items-center justify-center shadow-hard">
                                <Bot className="h-6 w-6 text-black" />
                            </div>
                            <div className="px-8 py-5 bg-white border-4 border-black text-black flex items-center gap-2 shadow-hard">
                                <span className="h-3 w-3 bg-black border-2 border-black animate-pulse"></span>
                                <span className="h-3 w-3 bg-black border-2 border-black animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="h-3 w-3 bg-black border-2 border-black animate-pulse" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 md:p-8 bg-transparent z-20">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend() }}
                        className="flex gap-4 max-w-5xl mx-auto w-full relative"
                    >
                        <Input
                            placeholder="ASK ME ANYTHING: INTERVIEW QUESTIONS, CAREER PATHS..."
                            className="h-16 bg-white border-4 border-black shadow-hard rounded-none pl-8 pr-20 focus-visible:ring-0 focus-visible:border-black text-[16px] font-black tracking-widest uppercase placeholder:text-black/40 transition-all w-full"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-accent border-4 border-black text-black flex items-center justify-center shadow-hard transition-all active:translate-y-1 active:translate-x-1 active:shadow-none hover:-translate-y-1 hover:translate-x-1 disabled:opacity-50 disabled:pointer-events-none group"
                        >
                            <Send className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </PremiumCard>
        </div>
    )
}
