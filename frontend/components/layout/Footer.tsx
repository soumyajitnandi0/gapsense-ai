import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t-8 border-black bg-primary">
            <div className="container px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <span className="text-4xl font-black uppercase tracking-tighter text-black bg-white px-2 border-4 border-black shadow-hard inline-block hover:translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all">GapSense AI</span>
                        <p className="text-black font-black uppercase tracking-widest text-sm leading-relaxed">
                            Gen-AI powered readiness & gap-analysis platform for students.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-black text-xl mb-6">Product</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-black">
                            <li><Link href="/features" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">Features</Link></li>
                            <li><Link href="/pricing" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-black text-xl mb-6">Company</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-black">
                            <li><Link href="/about" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">About</Link></li>
                            <li><Link href="/contact" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-black text-xl mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-black">
                            <li><Link href="/privacy" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:bg-white hover:px-2 border-2 border-transparent hover:border-black transition-all">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t-4 border-black pt-8 flex justify-between items-center text-sm font-black uppercase tracking-widest text-black">
                    <p>© {new Date().getFullYear()} GapSense AI.</p>
                    <p>All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
