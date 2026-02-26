import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import "@/components/shadcn-space/orbiting-circles/orbiting-circles.css";
import { OrbitingCircleIcons } from "./OrbitingCircleIcons";

type OrbitingIntegrationsProps = {
  className?: string;
};

export default function OrbitingIntegrations({ className }: OrbitingIntegrationsProps) {
  const icons = [
    { src: "/icons/whatsapp.svg", label: "WhatsApp" },
    { src: "/icons/gmail.svg", label: "Gmail" },
    { src: "/icons/slack.svg", label: "Slack" },
    { src: "/icons/linkedin.svg", label: "LinkedIn" },
    { src: "/icons/instagram.svg", label: "Instagram" },
    { src: "/icons/telegram.svg", label: "Telegram" },
  ];

  return (
    <div
      className={cn(
        "relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-3xl bg-white/20 backdrop-blur-sm",
        className
      )}
    >
      {/* Primeira orbita (4 primeiros icones) */}
      <OrbitingCircleIcons radius={130} duration={20}>
        {icons.slice(0, 4).map(({ src, label }) => (
          <div
            key={label}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.08)] border border-white/20"
          >
            <Image src={src} alt={label} width={20} height={20} />
          </div>
        ))}
      </OrbitingCircleIcons>

      {/* Segunda orbita (2 ultimos icones) */}
      <OrbitingCircleIcons radius={90} reverse duration={16} speed={1.5}>
        {icons.slice(4).map(({ src, label }) => (
          <div
            key={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-[0_8px_22px_rgba(0,0,0,0.06)] border border-white/20"
          >
            <Image src={src} alt={label} width={16} height={16} />
          </div>
        ))}
      </OrbitingCircleIcons>

      {/* Logo central fixa */}
      <div className="absolute flex h-28 w-28 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.12)] border border-white/20">
        <Image src="/logo-numa.svg" alt="Numa" width={70} height={24} />
      </div>
    </div>
  );
}

