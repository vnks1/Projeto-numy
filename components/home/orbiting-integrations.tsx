import React from "react";
import { cn } from "@/lib/utils";
import "@/components/shadcn-space/orbiting-circles/orbiting-circles.css";
import {
  PlatformBrandIcon,
  type PlatformId,
} from "@/components/icons/platform-icons";
import { OrbitingCircleIcons } from "./orbiting-circle-icons";
import { NumaLogo } from "@/components/icons/numa-logo";

type OrbitingIntegrationsProps = {
  className?: string;
};

export default function OrbitingIntegrations({
  className,
}: OrbitingIntegrationsProps) {
  const icons: { id: PlatformId; label: string }[] = [
    { id: "whatsapp", label: "WhatsApp" },
    { id: "gmail", label: "Gmail" },
    { id: "slack", label: "Slack" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "instagram", label: "Instagram" },
    { id: "telegram", label: "Telegram" },
  ];

  return (
    <div
      className={cn(
        "relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-3xl bg-white/20 backdrop-blur-sm",
        className,
      )}
    >
      {/* Primeira orbita (4 primeiros icones) */}
      <OrbitingCircleIcons radius={130} duration={20}>
        {icons.slice(0, 4).map(({ id, label }) => (
          <div
            key={label}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.08)] border border-white/20"
          >
            <PlatformBrandIcon platform={id} className="h-5 w-5" />
          </div>
        ))}
      </OrbitingCircleIcons>

      {/* Segunda orbita (2 ultimos icones) */}
      <OrbitingCircleIcons radius={90} reverse duration={16} speed={1.5}>
        {icons.slice(4).map(({ id, label }) => (
          <div
            key={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-[0_8px_22px_rgba(0,0,0,0.06)] border border-white/20"
          >
            <PlatformBrandIcon platform={id} className="h-4 w-4" />
          </div>
        ))}
      </OrbitingCircleIcons>

      {/* Logo central fixa */}
      <div className="absolute flex h-28 w-28 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.12)] border border-white/20">
        <NumaLogo className="w-22" />
      </div>
    </div>
  );
}
