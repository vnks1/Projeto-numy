import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "NUMA — Lista de Espera",
  description: "Garanta seu acesso antecipado à Numa e receba novidades em primeira mão.",
};

export default function WaitlistPage() {
  return (
    <>
      {/* Background Flare — fixed behind everything, visible through transparent header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[900px] pointer-events-none select-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <Image
          src="/background-flare.png"
          alt=""
          width={900}
          height={500}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      <Header />
      <main className="relative">
        <section
          className="relative z-10 min-h-[calc(100vh-64px)] py-16"
        >
          <div className="grid-container">
            <div className="grid items-center gap-10">
              <div className="col-span-12 lg:col-span-5">
                <div className="flex flex-col">
                  <h1 className="text-[28px] font-semibold text-[#111827] sm:text-[32px]">
                    Garanta seu acesso antecipado!
                  </h1>
                  <p className="mt-3 text-base text-[#6B7280]">
                    Seja um dos primeiros a desbravar um novo conceito de assistente virtual.
                  </p>
                  <WaitlistForm />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-7">
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2FE] via-transparent to-[#FDE68A] opacity-60" />
                  <Image
                    src="/waitlist-placeholder.svg"
                    alt="Visualização do produto NUMA"
                    width={980}
                    height={760}
                    className="relative z-10 h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
