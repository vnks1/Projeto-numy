import type { LucideIcon } from "lucide-react";
import {
  Inbox,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Slack,
  Users,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa6";
import {
  SiGmail,
  SiInstagram,
  SiSlack,
  SiTelegram,
  SiWhatsapp,
} from "react-icons/si";
import { cn } from "@/lib/utils";

export type PlatformId =
  | "gmail"
  | "whatsapp"
  | "slack"
  | "teams"
  | "instagram"
  | "linkedin"
  | "outlook"
  | "telegram";

type PlatformMeta = {
  id: PlatformId;
  label: string;
};

const PLATFORM_ICON_MAP: Record<PlatformId, LucideIcon> = {
  gmail: Mail,
  whatsapp: MessageCircle,
  slack: Slack,
  teams: Users,
  instagram: Instagram,
  linkedin: Linkedin,
  outlook: Inbox,
  telegram: Send,
};

type PlatformBrandMeta = {
  color: string;
  icon: IconType;
};

const PLATFORM_BRAND_ICON_MAP: Partial<Record<PlatformId, PlatformBrandMeta>> =
  {
    gmail: { color: "#EA4335", icon: SiGmail },
    instagram: { color: "#E4405F", icon: SiInstagram },
    linkedin: { color: "#0A66C2", icon: FaLinkedin },
    slack: { color: "#4A154B", icon: SiSlack },
    telegram: { color: "#26A5E4", icon: SiTelegram },
    whatsapp: { color: "#25D366", icon: SiWhatsapp },
  };

export const INTEGRATION_PLATFORMS: PlatformMeta[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "gmail", label: "Gmail" },
  { id: "slack", label: "Slack" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "telegram", label: "Telegram" },
];

type PlatformIconProps = {
  platform: PlatformId;
  className?: string;
};

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const Icon = PLATFORM_ICON_MAP[platform];
  return (
    <Icon
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
      strokeWidth={2.1}
    />
  );
}

export function PlatformBrandIcon({ platform, className }: PlatformIconProps) {
  const brandMeta = PLATFORM_BRAND_ICON_MAP[platform];

  if (!brandMeta) {
    return <PlatformIcon platform={platform} className={className} />;
  }

  const BrandIcon = brandMeta.icon;

  return (
    <BrandIcon
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
      color={brandMeta.color}
    />
  );
}

type PlatformBadgeProps = {
  platform: PlatformId;
  label: string;
  className?: string;
  useBrandIcon?: boolean;
};

export function PlatformBadge({
  platform,
  label,
  className,
  useBrandIcon = false,
}: PlatformBadgeProps) {
  const IconComponent = useBrandIcon ? PlatformBrandIcon : PlatformIcon;
  const iconClassName = useBrandIcon
    ? "h-3.5 w-3.5"
    : "h-3.5 w-3.5 text-zinc-700";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-zinc-800 shadow-[0_4px_14px_rgba(0,0,0,0.05)] sm:text-xs",
        className,
      )}
    >
      <IconComponent platform={platform} className={iconClassName} />
      <span>{label}</span>
    </span>
  );
}
