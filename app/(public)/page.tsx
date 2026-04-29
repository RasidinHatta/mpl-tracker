"use client";

import { Suspense, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themes/ModeToggle";
import Footer from "@/components/navigation/footer";
import { Trophy, Activity, Calendar, TrendingUp, Target, Users, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "motion/react";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};



const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: "-50px" }
};

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    />
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="absolute top-0 right-0 -mr-20 -mt-20 w-160 h-160 rounded-full bg-primary/10 blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute bottom-0 left-0 -ml-20 -mb-20 w-160 h-160 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={heroInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-tr from-primary/5 to-blue-500/5 blur-3xl pointer-events-none"
      />

      {/* Animated floating shapes */}
      <FloatingShape className="absolute top-20 left-[10%] w-4 h-4 bg-primary/30 rounded-full" />
      <FloatingShape className="absolute top-40 right-[15%] w-3 h-3 bg-blue-500/30 rounded-full" delay={1} />
      <FloatingShape className="absolute bottom-32 left-[20%] w-2 h-2 bg-yellow-500/30 rounded-full" delay={2} />
      <FloatingShape className="absolute bottom-20 right-[25%] w-3 h-3 bg-primary/20 rounded-full" delay={1.5} />
      <FloatingShape className="absolute top-60 left-[5%] w-2 h-2 bg-blue-500/20 rounded-full" delay={0.5} />

      {/* Header */}
      <motion.header 
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="flex items-center justify-between p-6 md:px-8 w-full z-10 sticky top-0 bg-background/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-bold text-2xl tracking-tight flex items-center gap-2"
        >
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm"
          >
            <Trophy className="w-5 h-5" />
          </motion.div>
          MPL Tracker
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" className="font-medium rounded-full">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up" className="hidden sm:inline-flex">
            <Button className="font-medium rounded-full shadow-sm">
              Get Started
            </Button>
          </Link>
          <div className="ml-1">
            <ModeToggle />
          </div>
        </motion.div>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        {/* Hero Section */}
        <div ref={heroRef}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 text-sm font-medium"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Activity className="w-4 h-4" />
            </motion.div>
            <span><span className="font-bold">Recent Update:</span> Enhanced match predictions & real-time schedules!</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl text-foreground text-center"
          >
            The Tracker for{" "}
            <motion.span
              className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500"
              animate={heroInView ? { backgroundPosition: "0% 50%" } : {}}
              style={{ backgroundSize: "200% 200%" }}
            >
              MLBB Esports
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed text-center mx-auto"
          >
            The ultimate companion app for competitive Mobile Legends. Track standings, schedules, predict outcomes, and stay updated with the latest action across premier regions.
          </motion.p>

          {/* Hero CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-12 justify-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="px-8 h-14 text-base font-semibold rounded-full hover:bg-secondary transition-colors">
                Create an Account
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Region Cards Section */}
        <Section className="w-full max-w-4xl mx-auto mb-8">
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Card: MPL ID */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all group cursor-pointer"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary shadow-inner"
                >
                  <span className="font-black text-xl">ID</span>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"
                />
              </div>
              <h3 className="font-bold text-xl mb-2">MPL Indonesia</h3>
              <p className="text-sm text-muted-foreground text-center">The most competitive region in the world. Witness legends rise.</p>
              <div className="mt-4 text-xs font-medium text-primary/80 bg-primary/10 px-3 py-1 rounded-full">Season 14 Live</div>
            </motion.div>
            
            {/* Card: MPL PH */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all group cursor-pointer"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5 text-blue-500 shadow-inner"
                >
                  <span className="font-black text-xl">PH</span>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full"
                />
              </div>
              <h3 className="font-bold text-xl mb-2">MPL Philippines</h3>
              <p className="text-sm text-muted-foreground text-center">Home of the reigning world champions. Tactical masterclasses.</p>
              <div className="mt-4 text-xs font-medium text-blue-500/80 bg-blue-500/10 px-3 py-1 rounded-full">Season 14 Live</div>
            </motion.div>
            
            {/* Card: MPL MY */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-card/60 backdrop-blur-sm border shadow-sm transition-all group cursor-pointer"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-5 text-yellow-600 dark:text-yellow-500 shadow-inner"
                >
                  <span className="font-black text-xl">MY</span>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"
                />
              </div>
              <h3 className="font-bold text-xl mb-2">MPL Malaysia</h3>
              <p className="text-sm text-muted-foreground text-center">The dark horses and rising stars. Unpredictable and exciting.</p>
              <div className="mt-4 text-xs font-medium text-yellow-600/80 dark:text-yellow-500/80 bg-yellow-500/10 px-3 py-1 rounded-full">Coming Soon</div>
            </motion.div>
          </motion.div>
        </Section>

        {/* Features Section */}
        <Section className="w-full max-w-5xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Stay Ahead</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Track every match, predict outcomes, and compete with other fans across the MPL regions.</p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-card/40 border backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Live Schedules</h3>
              <p className="text-sm text-muted-foreground">Never miss a match with real-time schedules</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-card/40 border backdrop-blur-sm hover:bg-card/80 hover:border-blue-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Make Predictions</h3>
              <p className="text-sm text-muted-foreground">Predict outcomes and climb the leaderboard</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-card/40 border backdrop-blur-sm hover:bg-card/80 hover:border-yellow-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Standings</h3>
              <p className="text-sm text-muted-foreground">Track team rankings and performance stats</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-card/40 border backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">Join thousands of passionate fans</p>
            </motion.div>
          </motion.div>
        </Section>

        {/* Stats Section */}
        <Section className="w-full max-w-4xl mx-auto mb-16">
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { value: "50+", label: "Teams" },
              { value: "200+", label: "Matches" },
              { value: "10K+", label: "Predictions" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-4 rounded-2xl bg-card/50 border backdrop-blur-sm"
              >
                <div className="text-3xl md:text-4xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Section>
        
        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-16"
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-muted-foreground/50 rounded-full"
            />
          </div>
        </motion.div>
      </main>

      <Suspense fallback={<div className="h-24" />}>
        <Footer />
      </Suspense>
    </div>
  );
}