import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ThemeInit from "@/components/layout/ThemeInit";

export const metadata: Metadata = {
 title: "MindBridge",
 description: "Understand your wellbeing - with clarity, compassion, and context",
 icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="en" data-theme="dark" suppressHydrationWarning>
   <body className="min-h-dvh bg-bg text-fg antialiased">
    <ThemeInit />
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
     {children}
    </main>
    {/* Crisis footer strip */}
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 py-2 px-4 text-xs bg-bg2/80 backdrop-blur-sm border-t border-border/50">
     <span className="text-fg3">In crisis?</span>
     <span className="font-bold text-rose">Call or text 988</span>
     <span className="text-fg3">·</span>
     <span className="text-fg3">Text HOME to <span className="font-semibold text-rose">741741</span></span>
     <span className="text-fg3 hidden sm:inline">· Academic demo, not clinical advice</span>
    </div>
   </body>
  </html>
 );
}
