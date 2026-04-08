"use client"

import * as React from "react"
import { Send, Bot, FileText, Search, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ChatPage() {
    const [messages, setMessages] = React.useState([
        { role: "assistant", content: "Hi! I am connected to your learning resources and repository insights. Ask me to find a specific tutorial, explain a codebase feature, or summarize a JD." }
    ])
    const [input, setInput] = React.useState("")

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: "user", content: input }])
        setInput("")

        // Simulate Retrieval response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Based on the recent Job Description you mapped to, I found 3 highly-rated System Design courses focusing on Load Balancing in Node.js. Should I add them to your roadmap?"
            }])
        }, 1200)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-white">Resource Chat</h1>
                    <p className="text-sm text-muted-foreground">Search and query across your connected knowledge base</p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden relative">
                {/* Aesthetic Background */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />

                <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 border border-white/10 bg-blue-500/20">
                                    <AvatarFallback className="text-blue-500"><Search className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-xl px-4 py-3 max-w-[80%] text-sm shadow-md ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-cyan-600 text-white'
                                : 'bg-white/5 border border-white/10 text-foreground backdrop-blur-md'
                                }`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8 border border-white/10">
                                    <AvatarImage src="/avatars/01.png" />
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#050707]/60 backdrop-blur-xl z-10">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend() }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Fetch tutorials for React 18 Suspense..."
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50 text-white h-12"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button type="submit" variant="glow" size="icon" className="h-12 w-12 shrink-0 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
