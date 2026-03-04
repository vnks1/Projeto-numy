import Link from "next/link";
import { NumaLogo } from "@/components/icons/numa-logo";
import { FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-9 flex items-center justify-between">
        {/* Left: Logo + Copyright */}
        <div>
          <Link href="/" className="inline-flex items-center mb-1" aria-label="Numa Home">
            <NumaLogo style={{ width: 88, height: "auto" }} />
          </Link>
          <p className="text-[#6B7280] text-sm">
            © 2026 Numa. Todos os direitos reservados.
          </p>
        </div>

        {/* Right: Instagram */}
        <div className="text-right">
          <p className="text-[#6B7280] text-sm mb-2">Fique por dentro das novidades</p>
          <Link
            href="https://www.instagram.com/numa.social"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[18px] font-medium text-[#111827] hover:opacity-70 transition-opacity"
            aria-label="Instagram numa.social"
          >
            <FaInstagram className="w-6 h-6" size={24} />
            numa.social
          </Link>
        </div>
      </div>
    </footer>
  );
}
