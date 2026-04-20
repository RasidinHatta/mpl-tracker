import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themes/ModeToggle";
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="font-bold text-2xl tracking-tight">
          MPL Tracker
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium">
              Sign Up
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Tracking MPL <span className="text-primary">E-Sports</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          A definitive tool to check standings, schedules, history and predict outcomes of matches.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard">
             <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
