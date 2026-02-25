"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  y?: number;
  amount?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  once = true,
  y = 16,
  amount = 0.2,
}: ScrollRevealProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const shouldReduceMotion = useReducedMotion();
  const disableMotion = !isHydrated || shouldReduceMotion;

  if (disableMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: "easeOut", delay }}
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}
