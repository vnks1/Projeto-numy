import Image from "next/image";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeatureSection, FeatureCard } from "@/components/feature-section";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

// Feature section visuals
function Feature1Visual() {
  return (
    <video
      src="/video1.webm"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full max-w-[420px] aspect-[4/3] rounded-3xl border border-gray-100 shadow-sm object-cover"
    />
  );
}

function Feature2Visual() {
  return (
    <FeatureCard>
      <div className="flex flex-col gap-2 p-6 w-[280px]">
        <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest">Resumo do dia</p>
        <p className="text-[13px] font-bold text-[#111827]">Bom dia, Ítalo!</p>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { icon: "📌", text: "2 mensagens urgentes de Marcos" },
            { icon: "📅", text: "Reunião às 10h com o time" },
            { icon: "💬", text: "5 grupos com menções não lidas" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">{item.icon}</span>
              <p className="text-[11px] text-[#4B5563] leading-tight">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </FeatureCard>
  );
}

function Feature3Visual() {
  return (
    <FeatureCard>
      <div className="flex flex-col gap-3 p-6 w-[280px]">
        <div className="bg-[#F0F2F8] rounded-xl p-3 flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#111827] leading-relaxed">
            Olá Ítalo! Percebi que o David te mandou uma mensagem importante ontem. Quer que eu te ajude a responder?
          </p>
        </div>
        <div className="flex gap-2">
          <button className="text-[10px] text-[#111827] border border-gray-200 rounded-full px-3 py-1 bg-white">Sugerir resposta</button>
          <button className="text-[10px] text-white rounded-full px-3 py-1 bg-[#111827]">Ver mensagem</button>
        </div>
      </div>
    </FeatureCard>
  );
}

const FEATURES = [
  {
    tag: "Clareza, no meio do caos",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light",
    title: "Veja o que importa primeiro.",
    titleClassName: "font-medium",
    description:
      "A Numa analisa suas conversas e destaca as mensagens que precisam de atenção imediata, para você nunca mais perder o que é importante.",
    imageSide: "left" as const,
    visual: <Feature1Visual />,
  },
  {
    tag: "Sempre presente",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light",
    title: "Comece seu dia sabendo o que importa.",
    titleClassName: "font-medium",
    description:
      "Toda manhã, a Numa prepara um resumo personalizado com as prioridades do dia — reuniões, mensagens importantes e lembretes.",
    imageSide: "right" as const,
    visual: <Feature2Visual />,
  },
  {
    tag: "Pronta para tudo",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light",
    title: "Uma assistente pessoal para suas conversas.",
    titleClassName: "font-medium",
    description:
      "Da sugestão de resposta ao acompanhamento de conversas importantes, a Numa está sempre pronta para te ajudar a se comunicar melhor.",
    imageSide: "left" as const,
    visual: <Feature3Visual />,
  },
];

export default function Home() {
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
      <main>
        {/* Hero */}
        <Hero />

        {/* Supporting headline */}
        <section className="relative z-10 bg-[#FFFFFF] py-[50px]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#111827] leading-tight tracking-[-0.03em]">
              <span className="font-normal">Uma mente auxiliar. </span>
              <span className="font-medium">Sempre presente.</span>
            </h2>
          </div>
        </section>

        {/* Feature sections */}
        <section id="como-funciona" className="relative z-10 bg-[#FFFFFF]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8">
            {FEATURES.map((feature) => (
              <FeatureSection key={feature.tag} {...feature} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <FAQ />

      </main>
      <Footer />
    </>
  );
}
