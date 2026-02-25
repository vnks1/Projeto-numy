import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { WaitlistForm } from "@/components/waitlist-form";

const title = "NUMA - Lista de espera";
const description =
  "Garanta seu acesso antecipado a Numa e receba novidades em primeira mao.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/waitlist",
  },
  openGraph: {
    title,
    description,
    url: "/waitlist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function WaitlistPage() {
  return (
    <>
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

      <main className="relative z-10 flex min-h-screen w-full flex-col overflow-hidden bg-transparent md:flex-row">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.08)_1px,transparent_0)] [background-size:18px_18px] opacity-30" />

        <section className="relative z-10 flex w-full items-center justify-center px-6 py-16 md:w-1/2 md:px-12 lg:px-20">
          <div className="w-full max-w-[460px]">
            <Suspense fallback={null}>
              <WaitlistForm />
            </Suspense>
          </div>
        </section>

        <section className="relative hidden w-1/2 items-center justify-center overflow-hidden border-l border-zinc-200/70 bg-[rgba(134,134,134,0.05)] md:flex">
          <div className="absolute inset-0 backdrop-blur-[1px]" />
          <div className="relative z-10 ml-auto h-[88vh] w-[92%] overflow-hidden">
            <Image
              src="/mockup.png"
              alt="Mockup da interface"
              fill
              sizes="(max-width: 768px) 0px, 50vw"
              className="object-contain object-right"
              priority
            />
          </div>
        </section>
      </main>
    </>
  );
}
