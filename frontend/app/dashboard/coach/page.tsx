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
                    <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-[#111]">
                        AI Career Coach
                    </h1>
                    <p className="text-[#111]/50 text-base md:text-lg font-medium tracking-tight">Your intelligent edge in the job market.</p>
                </div>
                <button 
                    onClick={clearSession}
                    className="flex items-center gap-2 px-5 py-3 bg-white shadow-xl hover:shadow-2xl border border-black/5 rounded-full hover:bg-black/5 transition-all duration-300 text-[#2B2D2B] text-sm font-bold tracking-tight active:scale-95"
                >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Clear Conversation
                </button>
            </div>

            <PremiumCard className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden shadow-2xl relative">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar relative z-10 w-full max-w-5xl mx-auto">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-5 transition-all ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="h-12 w-12 shrink-0 border-2 border-white bg-primary/20 rounded-full flex items-center justify-center shadow-md">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            <div className={`rounded-[2rem] px-8 py-5 max-w-[85%] md:max-w-[70%] text-[16px] leading-[1.6] shadow-md transition-all ${msg.role === 'user'
                                    ? 'bg-[#111] text-white rounded-br-md font-medium tracking-tight'
                                    : 'bg-white/80 backdrop-blur-md border border-white/60 text-[#2B2D2B] rounded-bl-md shadow-xl'
                                }`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="h-12 w-12 shrink-0 border-2 border-white overflow-hidden rounded-full shadow-md bg-[#111] flex items-center justify-center text-white font-bold text-sm">
                                    {user?.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name ? user.name.charAt(0).toUpperCase() : "ME"
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-5 justify-start">
                            <div className="h-12 w-12 shrink-0 border-2 border-white bg-primary/20 rounded-full flex items-center justify-center shadow-md">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div className="rounded-[2rem] px-8 py-5 bg-white/80 backdrop-blur-md border border-white/60 text-[#2B2D2B] rounded-bl-md flex items-center gap-2 shadow-xl">
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 md:p-8 border-t border-white/20 bg-white/30 backdrop-blur-3xl z-20">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend() }}
                        className="flex gap-4 max-w-5xl mx-auto w-full relative"
                    >
                        <Input
                            placeholder="Ask me anything: interview questions, career paths, salary negotiation..."
                            className="h-16 bg-white/80 backdrop-blur-md border-2 border-white shadow-xl rounded-full pl-8 pr-20 focus-visible:ring-primary/40 focus-visible:border-primary/40 text-[16px] font-medium tracking-tight placeholder:text-foreground/30 transition-all w-full"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 bottom-3 aspect-square bg-[#111] hover:bg-[#222] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Send className="h-5 w-5 group-hover:block transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative right-[1px] top-[1px]" />
                        </button>
                    </form>
                </div>
            </PremiumCard>
        </div>
    )
}
