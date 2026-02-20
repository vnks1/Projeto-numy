import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="relative z-10 bg-[#FFFFFF] border-t border-gray-100 py-10">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center" aria-label="Numa Home">
                    <Image src="/logo.svg" alt="Numa" width={80} height={32} className="h-8 w-auto" />
                </Link>

                {/* Copyright */}
                <p className="text-[#6B7280] text-sm">
                    © 2026 Numa. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
