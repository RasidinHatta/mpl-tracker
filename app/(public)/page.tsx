import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themes/ModeToggle";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";
import { Trophy, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-160 h-160 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-160 h-160 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between p-6 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          MPL Tracker
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" className="font-medium rounded-full">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium rounded-full shadow-sm">
              Get Started
            </Button>
          </Link>
          <div className="ml-1">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 text-sm font-medium">
          <Activity className="w-4 h-4 animate-pulse" />
          <span><span className="font-bold">Recent Update:</span> Enhanced match predictions & real-time schedules!</span>
        </div>
        
        <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl text-foreground">
          The Tracker for <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">MLBB Esports</span>
        </h1>
        
        <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          The ultimate companion app for competitive Mobile Legends. Track standings, schedules, predict outcomes, and stay updated with the latest action across premier regions.
        </p>
        
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl mx-auto">
          {/* Card: MPL ID */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 group">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-5 text-primary shadow-inner">
              <span className="font-black text-xl">ID</span>
            </div>
            <h3 className="font-bold text-xl mb-2">MPL Indonesia</h3>
            <p className="text-sm text-muted-foreground">The most competitive region in the world. Witness legends rise.</p>
          </div>
          
          {/* Card: MPL PH */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/50 group">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center mb-5 text-blue-500 shadow-inner">
              <span className="font-black text-xl">PH</span>
            </div>
            <h3 className="font-bold text-xl mb-2">MPL Philippines</h3>
            <p className="text-sm text-muted-foreground">Home of the reigning world champions. Tactical masterclasses.</p>
          </div>
          
          {/* Card: MPL MY */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-yellow-500/50 group">
            <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors flex items-center justify-center mb-5 text-yellow-600 dark:text-yellow-500 shadow-inner">
              <span className="font-black text-xl">MY</span>
            </div>
            <h3 className="font-bold text-xl mb-2">MPL Malaysia</h3>
            <p className="text-sm text-muted-foreground">The dark horses and rising stars. Unpredictable and exciting.</p>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-700 flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/dashboard">
             <Button size="lg" className="px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                Go to Dashboard
             </Button>
          </Link>
          <Link href="/sign-up">
             <Button variant="outline" size="lg" className="px-8 h-14 text-base font-semibold rounded-full hover:bg-secondary transition-colors">
                Create an Account
             </Button>
          </Link>
        </div>
      </main>

      <Suspense fallback={<div className="h-24" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
