"use client"

import * as React from "react"
import { Send, Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"

export default function ChatPage() {
    const { user } = useAuth()
interface Message {
    role: "user" | "assistant"
    content: string
}

    const [messages, setMessages] = React.useState<Message[]>([])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [sessionId, setSessionId] = React.useState<string | null>(null)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    // Load existing session on mount
    React.useEffect(() => {
        api.get("/chat/session").then((res: { data: { session?: { sessionId: string; messages?: Message[] } } }) => {
            if (res.data.session) {
                setSessionId(res.data.session.sessionId)
                if (res.data.session.messages && res.data.session.messages.length > 0) {
                    setMessages(res.data.session.messages)
                } else {
                    setMessages([{ role: "assistant", content: "Hi! I am connected to your learning resources and repository insights. Ask me to find a specific tutorial, explain a codebase feature, or summarize a JD." }])
                }
            }
        }).catch(() => {
            setMessages([{ role: "assistant", content: "Hi! I am connected to your learning resources and repository insights. Ask me to find a specific tutorial, explain a codebase feature, or summarize a JD." }])
        })
    }, [])

    // Auto-scroll to bottom
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        const currentInput = input
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
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I'm having trouble connecting to the server right now. Please try again."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const clearSession = async () => {
        if (!sessionId) return
        try {
            await api.delete(`/chat/session/${sessionId}`)
            setMessages([{ role: "assistant", content: "Hi! I am connected to your learning resources and repository insights. Ask me to find a specific tutorial, explain a codebase feature, or summarize a JD." }])
            setSessionId(null)
        } catch (error) {
            console.error("Failed to clear session", error)
        }
    }

    return (
        <div className="flex h-[calc(100vh-14rem)] flex-col gap-6 w-full max-w-7xl mx-auto text-[#2B2D2B]">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-4xl lg:text-[48px] font-heading font-medium tracking-tight text-[#111]">Resource Chat</h1>
                    <p className="text-[#2B2D2B]/60 text-[15px] mt-1">Search and query across your connected knowledge base</p>
                </div>
                <button
                    onClick={clearSession}
                    className="flex items-center gap-2 px-5 py-3 bg-white shadow-xl hover:shadow-2xl border border-black/5 rounded-full hover:bg-black/5 transition-all duration-300 text-[#2B2D2B] text-sm font-bold tracking-tight active:scale-95"
                >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Clear Conversation
                </button>
            </div>

            <PremiumCard className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl relative">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar relative z-10 w-full max-w-5xl mx-auto">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-5 transition-all ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="h-12 w-12 shrink-0 border-2 border-white bg-primary/20 rounded-full flex items-center justify-center shadow-md">
                                    <Search className="h-6 w-6 text-primary" />
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
                                <Search className="h-6 w-6 text-primary" />
                            </div>
                            <div className="rounded-[2rem] px-8 py-5 bg-white/80 backdrop-blur-md border border-white/60 text-[#2B2D2B] rounded-bl-md flex items-center gap-2 shadow-xl">
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-5 md:p-8 border-t border-black/5 bg-white/30 backdrop-blur-3xl z-20">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend() }}
                        className="flex gap-4 max-w-5xl mx-auto w-full relative"
                    >
                        <Input
                            placeholder="Fetch tutorials for React 18 Suspense..."
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
