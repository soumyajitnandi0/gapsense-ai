import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            <section className="relative w-full py-20 overflow-hidden">
                <div className="absolute inset-0 bg-orbit-gradient pointer-events-none opacity-40" />
                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-heading mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                        Invest in your career with plans designed for every stage of your journey.
                    </p>
                </div>
            </section>

            <section className="container px-4 md:px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
                    {/* Free Tier */}
                    <Card className="flex flex-col border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Starter</CardTitle>
                            <CardDescription>Perfect for exploring your gaps.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {["1 Resume Analysis / month", "Basic Gap Identification", "Limited Roadmap Generation", "Community Support"].map((item) => (
                                    <li key={item} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/auth/signup" className="w-full">
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/10">Get Started</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro Tier (Highlighted) */}
                    <Card className="flex flex-col relative border-primary/50 bg-primary/5 backdrop-blur-md shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)] scale-105 z-10">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge variant="default" className="bg-primary hover:bg-primary text-black font-semibold px-3 py-1 rounded-full">Most Popular</Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Pro Career</CardTitle>
                            <CardDescription>Accelerate your job hunt.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">$29</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-foreground/90">
                                {["Unlimited Resume Scans", "Advanced Gap Analysis", "Full 60-Day Personalized Roadmap", "AI Career Coach Access", "Mock Interview Sessions"].map((item) => (
                                    <li key={item} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/auth/signup" className="w-full">
                                <Button variant="glow" className="w-full">Start Free Trial</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Enterprise Tier */}
                    <Card className="flex flex-col border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Bootcamps</CardTitle>
                            <CardDescription>For education providers.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">Custom</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {["Bulk Student Management", "Cohort Analytics", "Custom Curriculum Integration", "API Access", "Dedicated Success Manager"].map((item) => (
                                    <li key={item} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full">Contact Sales</Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>
        </div>
    )
}
