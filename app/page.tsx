import Image from "next/image";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeatureSection, FeatureCard } from "@/components/feature-section";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/scroll-reveal";

// Feature section visuals
function Feature1Visual() {
  return (
    <FeatureCard>
      <div className="absolute inset-0">
        <Image
          src="/gif1.gif"
          alt="Clareza no meio do caos"
          fill
          unoptimized
          className="w-full h-full object-cover"
        />
      </div>
    </FeatureCard>
  );
}

function Feature2Visual() {
  return (
    <FeatureCard>
      <div className="absolute inset-0">
        <Image
          src="/gif2.gif"
          alt="Resumo do dia"
          fill
          unoptimized
          className="w-full h-full object-cover"
        />
      </div>
    </FeatureCard>
  );
}

function Feature3Visual() {
  return (
    <FeatureCard>
      <div className="absolute inset-0">
        <Image
          src="/gif3.gif"
          alt="Assistente pessoal"
          fill
          unoptimized
          className="w-full h-full object-cover"
        />
      </div>
    </FeatureCard>
  );
}

const FEATURES = [
  {
    tag: "Clareza, no meio do caos",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light text-zinc-800",
    title: "Veja o que importa primeiro.",
    titleClassName: "font-medium ",
    description:
      "A Numa analisa suas conversas e destaca as mensagens que precisam de atenÃ§Ã£o imediata, para vocÃª nunca mais perder o que Ã© importante.",
    imageSide: "left" as const,
    visual: <Feature1Visual />,
  },
  {
    tag: "Sempre presente",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light text-zinc-800",
    title: "Comece seu dia sabendo o que importa.",
    titleClassName: "font-medium",
    description:
      "Toda manhÃ£, a Numa prepara um resumo personalizado com as prioridades do dia â€” reuniÃµes, mensagens importantes e lembretes.",
    imageSide: "right" as const,
    visual: <Feature2Visual />,
  },
  {
    tag: "Pronta para tudo",
    tagClassName: "text-[14px] rounded-[8px] bg-zinc-100 shadow-none font-light text-zinc-800",
    title: "Uma assistente pessoal para suas conversas.",
    titleClassName: "font-medium",
    description:
      "Da sugestÃ£o de resposta ao acompanhamento de conversas importantes, a Numa estÃ¡ sempre pronta para te ajudar a se comunicar melhor.",
    imageSide: "left" as const,
    visual: <Feature3Visual />,
  },
];

export default function Home() {
  return (
    <>
      {/* Background Flare â€” fixed behind everything, visible through transparent header */}
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
        <ScrollReveal>
          <section className="relative z-10 bg-[#FFFFFF] py-[50px]">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#111827] leading-tight tracking-[-0.03em]">
                <span className="font-normal">Uma mente auxiliar. </span>
                <span className="font-medium">Sempre presente.</span>
              </h2>
            </div>
          </section>
        </ScrollReveal>

        {/* Feature sections */}
        <section id="como-funciona" className="relative z-10 bg-[#FFFFFF]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8">
            {FEATURES.map((feature, index) => (
              <ScrollReveal key={feature.tag} delay={index * 0.08}>
                <FeatureSection {...feature} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>

      </main>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </>
  );
}


