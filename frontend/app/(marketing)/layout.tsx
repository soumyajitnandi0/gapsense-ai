import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

interface MarketingLayoutProps {
    children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
