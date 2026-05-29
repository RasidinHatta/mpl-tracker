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
            sizes="(min-width: 1024px) 66vw, 50vw"
            priority
            className="object-cover opacity-50 transition-transform duration-1000 hover:scale-105"
          />
        </div>

        {/* Branding content */}
        <div className="relative z-10 flex flex-col h-full w-full justify-between text-white">
          <div className="flex items-center gap-3 font-bold text-3xl font-heading tracking-tight">
            <div className="relative size-13 overflow-hidden rounded-xl border border-primary/30 bg-background shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <Image
                src="/mpl-tracker-logo.png"
                alt="MPL Tracker logo"
                fill
                sizes="52px"
                className="object-cover"
                priority
              />
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
            sizes="(max-width: 767px) 100vw, 0vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/80 to-background" />
        </div>

        {/* Subtle glow effect behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="w-full max-w-md z-10 relative animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center gap-6 sm:gap-0">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8 font-bold text-3xl">
            <div className="relative size-11 overflow-hidden rounded-xl border border-primary/30 bg-background">
              <Image
                src="/mpl-tracker-logo.png"
                alt="MPL Tracker logo"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
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
