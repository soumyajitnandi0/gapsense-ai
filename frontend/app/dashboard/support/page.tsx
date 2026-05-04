"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PremiumCard } from "@/components/ui/PremiumCard"
import { LifeBuoy, Mail, MessageCircle, HelpCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SupportPage() {
    const { toast } = useToast()
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject.trim() || !message.trim()) {
            toast({ title: "Missing fields", description: "Please fill in both subject and message.", variant: "destructive" })
            return
        }
        setSending(true)
        // Simulate sending (no backend endpoint for support tickets)
        await new Promise(resolve => setTimeout(resolve, 1200))
        setSending(false)
        setSent(true)
        setSubject("")
        setMessage("")
        toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours. Thank you for reaching out." })
        // Reset sent state after a few seconds
        setTimeout(() => setSent(false), 5000)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20 text-[#2B2D2B]">
            <div className="text-center space-y-4 pt-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 border border-primary/20">
                    <LifeBuoy className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-heading font-medium tracking-tight text-[#111]">How can we help?</h1>
                <p className="text-[#2B2D2B]/60 text-lg max-w-xl mx-auto">
                    Search our knowledge base or reach out to our team for assistance with your GapSense journey.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <PremiumCard variant="white" className="p-8 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-[#111] mb-2">
                            <MessageCircle className="h-5 w-5 text-primary" /> Contact Us
                        </h2>
                        <p className="text-sm text-[#2B2D2B]/60">Drop us a message and we&apos;ll get back to you shortly.</p>
                    </div>

                    {sent ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-200">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#111] mb-1">Message Sent!</h3>
                            <p className="text-sm text-[#2B2D2B]/60">We&apos;ll respond within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#111] ml-1">Subject</Label>
                                <Input 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Issue with Resume Parsing" 
                                    className="bg-[#FAF9F6] border border-black/5 h-12 rounded-xl text-[15px] focus-visible:ring-primary/20" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#111] ml-1">Message</Label>
                                <Textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue in detail..." 
                                    className="bg-[#FAF9F6] border border-black/5 min-h-[120px] rounded-xl text-[15px] focus-visible:ring-primary/20" 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={sending || !subject.trim() || !message.trim()}
                                className="w-full h-12 bg-[#111] text-white rounded-full font-semibold hover:bg-black transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="h-4 w-4" /> Send Message</>
                                )}
                            </button>
                        </form>
                    )}
                </PremiumCard>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#111] flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
                    </h3>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        <AccordionItem value="item-1" className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline text-[#111] font-semibold text-[15px]">How is my readiness score calculated?</AccordionTrigger>
                            <AccordionContent className="text-[#2B2D2B]/60 leading-relaxed text-[15px]">
                                Your score is a weighted combination of your core skills mastery, project relevance to the target role, and the structural quality of your parsed resume. We map your extracted data against our Role Templates using a proprietary scoring engine.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline text-[#111] font-semibold text-[15px]">Can I update my profile after learning a new skill?</AccordionTrigger>
                            <AccordionContent className="text-[#2B2D2B]/60 leading-relaxed text-[15px]">
                                Yes! Navigate to the Dashboard or Profile page to log new skills. You can also re-upload your resume with new experience. Our engine will dynamically recalculate your readiness score.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline text-[#111] font-semibold text-[15px]">Is my resume data private?</AccordionTrigger>
                            <AccordionContent className="text-[#2B2D2B]/60 leading-relaxed text-[15px]">
                                Absolutely. We encrypt your uploads at rest, and anonymize data when computing cohort analytics. You can delete your account and all associated artifacts at any time from Settings.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline text-[#111] font-semibold text-[15px]">How does the AI Coach work?</AccordionTrigger>
                            <AccordionContent className="text-[#2B2D2B]/60 leading-relaxed text-[15px]">
                                The AI Coach uses Google Gemini and Groq LLMs to provide contextual career guidance. It has access to your assessment data, skill gaps, and roadmap progress to give personalized advice on interview preparation, resume optimization, and learning strategies.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline text-[#111] font-semibold text-[15px]">How do I export my data?</AccordionTrigger>
                            <AccordionContent className="text-[#2B2D2B]/60 leading-relaxed text-[15px]">
                                You can export all your data as JSON from Settings → Privacy & Security. This includes your profile, assessments, progress history, and chat sessions. We support full GDPR data portability.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Quick Links */}
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/60 shadow-sm">
                        <h4 className="text-sm font-bold text-[#111] mb-4 uppercase tracking-widest">Quick Links</h4>
                        <div className="space-y-3">
                            <a href="/dashboard/settings" className="flex items-center gap-2 text-[15px] text-[#2B2D2B]/70 hover:text-primary transition font-medium">
                                <ExternalLink className="h-4 w-4" /> Account Settings
                            </a>
                            <a href="/dashboard/profile" className="flex items-center gap-2 text-[15px] text-[#2B2D2B]/70 hover:text-primary transition font-medium">
                                <ExternalLink className="h-4 w-4" /> Profile & Resume
                            </a>
                            <a href="/dashboard/onboarding" className="flex items-center gap-2 text-[15px] text-[#2B2D2B]/70 hover:text-primary transition font-medium">
                                <ExternalLink className="h-4 w-4" /> Start New Assessment
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
