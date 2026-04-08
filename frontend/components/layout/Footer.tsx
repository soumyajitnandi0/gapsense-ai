import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <span className="text-lg font-bold text-primary">GapSense AI</span>
                        <p className="text-sm text-muted-foreground">
                            Gen-AI powered readiness & gap-analysis platform for students.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/features">Features</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy">Privacy</Link></li>
                            <li><Link href="/terms">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} GapSense AI. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
