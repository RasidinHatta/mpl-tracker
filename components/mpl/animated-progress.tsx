"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function AnimatedProgress({ 
  value, 
  className, 
  title 
}: { 
  value: number; 
  className?: string; 
  title?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Small delay to ensure the initial 0% state is painted
    // before translating to the target value, triggering the CSS transition.
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Progress 
      value={progress} 
      className={className} 
      title={title} 
    />
  );
}
