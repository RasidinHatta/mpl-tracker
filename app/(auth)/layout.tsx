import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Visual / Branding side */}
      <div className="relative hidden md:flex flex-col p-12 lg:col-span-2 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop"
            alt="Esports Arena Background"
            fill
            priority
            className="object-cover opacity-50 transition-transform duration-1000 hover:scale-105"
          />
        </div>

        {/* Branding content */}
        <div className="relative z-10 flex flex-col h-full w-full justify-between text-white">
          <div className="flex items-center gap-3 font-bold text-3xl font-heading tracking-tight">
            <div className="bg-primary/20 p-2.5 rounded-xl backdrop-blur-md border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <svg className="size-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">MPL Tracker</span>
          </div>
          
          <div className="space-y-5 max-w-xl mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary backdrop-blur-md mb-2 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
              ✨ Season 17 Tracking Live
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
              Dominate your <br />
              <span className="text-primary italic">Predictions.</span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-300 font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Analyze professional matches, track the current meta, and perfect your bracket predictions for the Mobile Legends Professional League.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-4 sm:p-12 bg-background relative z-10 w-full min-h-dvh md:border-l border-white/10">
        {/* Mobile Background Image (Visible only on mobile) */}
        <div className="absolute inset-0 z-0 md:hidden overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop"
            alt="Mobile Background"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/80 to-background" />
        </div>

        {/* Subtle glow effect behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="w-full max-w-md z-10 relative animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center gap-6 sm:gap-0">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8 font-bold text-3xl">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
              <svg className="size-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            MPL Tracker
          </div>

          <div className="w-full relative px-1 sm:px-0 mt-4 sm:mt-0">
            <div className="absolute -inset-0.5 bg-linear-to-br from-primary/30 to-background rounded-xl blur-[3px] opacity-50" />
            <div className="relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
