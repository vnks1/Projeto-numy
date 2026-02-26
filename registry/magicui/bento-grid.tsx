import { cn } from "@/lib/utils";

type BentoGridProps = {
  className?: string;
  children: React.ReactNode;
};

type BentoCardProps = {
  Icon?: React.ComponentType<{ className?: string }>;
  name?: string;
  description?: string;
  href?: string;
  cta?: string;
  className?: string;
  background?: React.ReactNode;
};

export function BentoGrid({ className, children }: BentoGridProps) {
  return <div className={cn("grid grid-cols-3 gap-0 h-full w-full", className)}>{children}</div>;
}

export function BentoCard({
  Icon,
  name,
  description,
  href,
  cta,
  className,
  background,
}: BentoCardProps) {
  const hasMeta = Boolean(Icon || name || description || cta);

  return (
    <div className={cn("group relative col-span-3 h-full w-full overflow-hidden rounded-3xl", className)}>
      {background}
      {hasMeta ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/85 to-transparent p-4">
          <div className="flex items-center gap-2 text-zinc-700">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {name ? <span className="text-sm font-medium">{name}</span> : null}
          </div>
          {description ? <p className="mt-1 text-xs text-zinc-600">{description}</p> : null}
          {cta ? (
            <span className="mt-2 inline-block text-xs font-medium text-zinc-700">
              {href ? `${cta}` : cta}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
