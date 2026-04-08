import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LifeBuoy, Mail, MessageCircle } from "lucide-react"

export default function SupportPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                    <LifeBuoy className="h-8 w-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold font-heading">How can we help?</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Search our knowledge base or reach out to our team for assistance with your GapSense journey.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MessageCircle className="h-5 w-5 text-primary" /> Contact Us
                        </CardTitle>
                        <CardDescription>Drop us a message and we'll get back to you shortly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input placeholder="e.g. Issue with Resume Parsing" className="bg-black/50 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea placeholder="Describe your issue in detail..." className="bg-black/50 border-white/10 min-h-[120px]" />
                            </div>
                            <Button className="w-full gap-2 variant-glow bg-blue-600 hover:bg-blue-500 text-white">
                                <Mail className="h-4 w-4" /> Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/10">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline">How is my readiness score calculated?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Your score is a weighted combination of your core skills mastery, project relevance to the target role, and the structural quality of your parsed resume. We map your extracted data against our Role Templates using a proprietary scoring engine.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/10">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline">Can I update my profile after learning a new skill?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Yes! Navigate to the Dashboard or Projects view to log new skills or link new repositories. Our engine will dynamically recalculate your score.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/10">
                            <AccordionTrigger className="hover:text-primary transition-colors hover:no-underline">Is my resume data private?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Absolutely. We encrypt your uploads at rest, and anonymize data when computing cohort analytics. You can delete your account and all associated artifacts at any time from Settings.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
