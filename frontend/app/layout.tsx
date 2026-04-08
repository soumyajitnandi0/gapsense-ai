import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "GapSense AI",
  description: "Master your career readiness with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-primary/20`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
