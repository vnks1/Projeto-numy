"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { WAITLIST_URL } from "@/lib/site-config";
import iphoneImg from "../src/iphone.png";

setWasmUrl("/dotlottie-player.wasm");

export function Hero() {

    return (
        <motion.section
            id="hero"
            className="relative overflow-hidden min-h-screen flex items-start justify-start pt-12 lg:items-center lg:justify-center lg:pt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Background circular arcs */}
            <BackgroundArcs />

            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                <div className="flex flex-col items-center gap-6 sm:gap-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">

                    {/* Column 1 â€” Title (Left) */}
                    <div className="flex w-full flex-col items-center text-center lg:items-start lg:text-left lg:col-span-4 order-1">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                            className="text-[40px] sm:text-[48px] lg:text-[56px] font-medium text-[#111827] leading-[1.1] tracking-[-0.02em]"
                        >
                            <span className="font-semibold">Menos</span> ruído.
                            <br />
                            <span className="font-semibold">Mais</span> foco.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.72 }}
                        >
                            Clareza para o seu dia a dia.
                        </motion.p>
                        <motion.ul
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.82 }}
                            className="mt-6 space-y-2"
                        >
                            <motion.li
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: "easeOut", delay: 0.88 }}
                                className="flex items-center gap-3"
                            >
                                <Check aria-hidden="true" className="size-5 text-black" />
                                <span>80% menos distrações</span>
                            </motion.li>
                            <motion.li
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: "easeOut", delay: 0.93 }}
                                className="flex items-center gap-3"
                            >
                                <Check aria-hidden="true" className="size-5 text-black" />
                                <span>Decida 3x mais rápido</span>
                            </motion.li>
                            <motion.li
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: "easeOut", delay: 0.98 }}
                                className="flex items-center gap-3"
                            >
                                <Check aria-hidden="true" className="size-5 text-black" />
                                <span>Economize até 2 horas por dia</span>
                            </motion.li>
                        </motion.ul>
                    </div>

                    {/* Column 2 â€” iPhone (Center) */}
                    <div className="flex justify-center items-end lg:col-span-4 order-3 lg:order-2 relative mt-10 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 400 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                            className="relative z-10 w-full max-w-[320px] mx-auto"
                        >
                            <Image
                                src={iphoneImg}
                                alt="NUMA App no iPhone"
                                width={600}
                                height={1217}
                                className="w-full h-auto object-contain drop-shadow-2xl"
                                sizes="(max-width: 1024px) 85vw, 320px"
                                priority
                            />

                            {/* Floating Bubble 1 - Left */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.6 }}
                                className="hidden sm:flex absolute left-[-90px] top-[65%] items-center gap-[6px] bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg px-[12px] py-[6px] rounded-full z-20"
                            >
                                <DotLottieReact
                                    src="https://lottie.host/8084e342-8444-4476-b961-bb906d45b29d/yr4NteD52G.lottie"
                                    loop
                                    autoplay
                                    className="w-6 h-6 object-contain"
                                />
                                <span className="text-[12px] font-medium text-gray-800 whitespace-nowrap">Respondendo Davi Marson</span>
                            </motion.div>

                            {/* Floating Bubble 2 - Right */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                                className="hidden sm:flex absolute right-[-90px] top-[30%] items-center gap-[6px] bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg px-[12px] py-[6px] rounded-full z-20"
                            >
                                <DotLottieReact
                                    src="https://lottie.host/8084e342-8444-4476-b961-bb906d45b29d/yr4NteD52G.lottie"
                                    loop
                                    autoplay
                                    className="w-6 h-6 object-contain"
                                />
                                <span className="text-[12px] font-medium text-gray-800 whitespace-nowrap">Resumindo últimas mensagens...</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Column 3 â€” Description + CTA (Right) */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
                        className="flex w-full flex-col items-center text-center lg:items-end gap-6 lg:col-span-4 order-2 lg:order-3 lg:text-right"
                    >
                        <p className="text-[#4B5563] text-base sm:text-lg leading-relaxed max-w-[400px]">
                            A Numa resume, prioriza e organiza suas mensagens automaticamente.
                        </p>

                        <div className="flex flex-col items-center lg:items-end gap-3 w-full">
                            <RainbowButton asChild variant="default" className="inline-flex w-auto h-auto px-5 py-2.5">
                                <Link href={WAITLIST_URL}>
                                    Entrar na lista de espera <ChevronRight aria-hidden="true" className="size-[14px]" />
                                </Link>
                            </RainbowButton>

                            <p className="text-[#6B7280] text-sm">
                                Mais de{" "}
                                <span className="font-semibold text-[#111827]">5,285</span>{" "}
                                cadastrados
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>

        </motion.section>
    );
}

export function SocialsMarquee() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 639px)");
        const updateIsMobile = () => setIsMobile(mediaQuery.matches);

        updateIsMobile();
        mediaQuery.addEventListener("change", updateIsMobile);

        return () => mediaQuery.removeEventListener("change", updateIsMobile);
    }, []);

    return (
        <div className="relative z-10 w-full mt-10 sm:mt-12 py-6 sm:py-7 overflow-hidden">
            <p className="text-center text-[11px] sm:text-xs font-medium tracking-[0.28em] text-[#4B5563] uppercase">
                INTEGRAÇÃO COM AS PRINCIPAIS PLATAFORMAS
            </p>

            <div className="mt-7 sm:mt-8 overflow-hidden" aria-hidden="true">
                <motion.div
                    className="flex w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: isMobile ? 30 : 40, ease: "linear", repeat: Infinity }}
                >
                    <div className="shrink-0 pr-6 sm:pr-8">
                        <Image
                            src="/socials.svg"
                            alt=""
                            width={1440}
                            height={39}
                            className="h-[25px] sm:h-[30px] md:h-[30px] w-auto max-w-none"
                            sizes="100vw"
                        />
                    </div>
                    <div className="shrink-0 pr-6 sm:pr-8">
                        <Image
                            src="/socials.svg"
                            alt=""
                            width={1440}
                            height={39}
                            className="h-[25px] sm:h-[30px] md:h-[30px] w-auto max-w-none"
                            sizes="100vw"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function BackgroundArcs() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-[-1]"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <circle cx="600" cy="800" r="350" stroke="#D1D5DB" strokeWidth="1" />
            <circle cx="600" cy="800" r="500" stroke="#D1D5DB" strokeWidth="1" />
            <circle cx="600" cy="800" r="650" stroke="#D1D5DB" strokeWidth="1" />
        </svg>
    );
}

