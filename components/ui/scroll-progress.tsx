"use client";

import { motion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

type ScrollProgressProps = {
    className?: string;
};

export function ScrollProgress({ className }: ScrollProgressProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className={cn("fixed inset-x-0 top-0 z-50 h-1 origin-left bg-primary", className)}
            style={{ scaleX }}
        />
    );
}
