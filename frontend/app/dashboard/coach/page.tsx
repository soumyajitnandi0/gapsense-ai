"use client"

import * as React from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CoachPage() {
    const [messages, setMessages] = React.useState([
        { role: "assistant", content: "Hello! I'm your AI Career Coach. I can help you with mock interviews, resume feedback, or technical concepts. What would you like to work on today?" }
    ])
    const [input, setInput] = React.useState("")

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: "user", content: input }])
        setInput("")
        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: "That sounds like a great plan. Let's break that down into smaller steps. First, what specific role are you targeting?" }])
        }, 1000)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-heading text-white">AI Career Coach</h1>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Clear Conversation
                </Button>
            </div>

            <Card className="flex-1 flex flex-col border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 border border-white/10 bg-primary/20">
                                    <AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-xl px-4 py-2 max-w-[80%] text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white/10 text-foreground'
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

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend() }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Ask about interview prep, salary negotiation..."
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button type="submit" variant="glow" size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
