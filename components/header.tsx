"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { WAITLIST_URL } from "@/lib/site-config";

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const selector = [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
        ].join(",");

        const getFocusableElements = () => {
            return Array.from(mobileMenuRef.current?.querySelectorAll<HTMLElement>(selector) ?? []);
        };

        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            mobileMenuRef.current?.focus();
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setMobileOpen(false);
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const updatedFocusable = getFocusableElements();
            if (updatedFocusable.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = updatedFocusable[0];
            const lastElement = updatedFocusable[updatedFocusable.length - 1];
            const target = event.target;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            if (event.shiftKey && target === firstElement) {
                event.preventDefault();
                lastElement.focus();
                return;
            }

            if (!event.shiftKey && target === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const menuButtonElement = menuButtonRef.current;

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            menuButtonElement?.focus();
        };
    }, [mobileOpen]);

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                width: "100%",
                transition: "background-color 0.3s ease, border-color 0.3s ease",
                backgroundColor: scrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
                borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
                borderRadius: scrolled ? "0 0 12px 12px" : "0",
            }}
        >
            <ScrollProgress className="absolute inset-x-0 bottom-0 top-auto z-[60] h-0.5 bg-gradient-to-r from-pink-500 to-blue-500" />

            <div className="max-w-7xl mx-auto px-6 w-full h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center" aria-label="Numa Home">
                    <Image src="/logo.svg" alt="Numa" width={80} height={32} priority className="h-8 w-auto" />
                </Link>

                <div className="hidden md:flex items-center ml-auto">
                    {/* Desktop Nav */}
                    <nav className="flex items-center gap-8" aria-label="Navegação principal">
                        <Link
                            href="#como-funciona"
                            className="text-[#4B5563] text-sm font-medium hover:text-[#111827] transition-colors"
                        >
                            Como funciona
                        </Link>
                        <Link
                            href="#faq"
                            className="text-[#4B5563] text-sm font-medium hover:text-[#111827] transition-colors"
                        >
                            FAQ
                        </Link>
                    </nav>

                    <Link
                        href={WAITLIST_URL}
                        className="inline-flex ml-8 items-center justify-center gap-1 rounded-[20px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900"
                    >
                        Garantir meu acesso
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    ref={menuButtonRef}
                    type="button"
                    className="md:hidden p-2 text-[#111827]"
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? (
                        <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 top-16 z-50" aria-hidden={false}>
                    <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} aria-hidden="true" />

                    <div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu principal"
                        tabIndex={-1}
                        className="relative bg-[#FFFFFF] border-t border-gray-100 px-6 py-4 flex flex-col gap-8"
                    >
                        <Link href="#como-funciona" className="text-[#4B5563] text-sm font-medium" onClick={() => setMobileOpen(false)}>
                            Como funciona
                        </Link>
                        <Link href="#faq" className="text-[#4B5563] text-sm font-medium" onClick={() => setMobileOpen(false)}>
                            FAQ
                        </Link>
                        <Link
                            href={WAITLIST_URL}
                            onClick={() => setMobileOpen(false)}
                            className="inline-flex w-full items-center justify-center gap-1 rounded-[20px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900"
                        >
                            Garantir meu acesso
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
