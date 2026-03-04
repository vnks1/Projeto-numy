"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { WAITLIST_URL } from "@/lib/site-config";

export function CTA() {
    return (
        <section className="relative z-10 bg-[#FFFFFF] py-24 sm:py-32">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-medium text-[#111827] leading-tight tracking-[-0.02em]">
                    A próxima geração de assistentes começa aqui.
                </h2>
                <p className="mt-4 text-[#6B7280] text-base sm:text-lg">
                    Entre na lista e seja um dos primeiros a experimentar a Numa.
                </p>
                <div className="mt-8 flex justify-center">
                    <RainbowButton
                        asChild
                        variant="default"
                        className="inline-flex w-auto h-auto px-5 py-2.5"
                    >
                        <Link href={WAITLIST_URL}>
                            Entrar na lista de espera{" "}
                            <ChevronRight aria-hidden="true" className="size-[14px]" />
                        </Link>
                    </RainbowButton>
                </div>
            </div>
        </section>
    );
}
