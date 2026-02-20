import { cn } from "@/lib/utils";

interface FeatureSectionProps {
    tag: string;
    title: string;
    description: string;
    imageSide?: "left" | "right";
    visual: React.ReactNode;
    titleClassName?: string;
    tagClassName?: string;
}

export function FeatureSection({
    tag,
    title,
    description,
    imageSide = "left",
    visual,
    titleClassName,
    tagClassName,
}: FeatureSectionProps) {
    return (
        <div
            className={cn(
                "flex flex-col lg:flex-row items-center gap-8 py-8",
                imageSide === "right" && "lg:flex-row-reverse"
            )}
        >
            {/* Visual */}
            <div className="flex-1 w-full flex justify-center">{visual}</div>

            {/* Text */}
            <div className="flex-1 flex flex-col gap-5">
                <span className={cn("inline-flex items-center text-xs font-medium text-[#4B5563] bg-white border border-gray-200 px-4 py-1.5 rounded-full w-fit shadow-sm", tagClassName)}>
                    {tag}
                </span>
                <h3 className={cn("text-3xl sm:text-4xl text-[#111827] leading-tight tracking-[-0.02em]", titleClassName ?? "font-bold")}>
                    {title}
                </h3>
                <p className="text-[#4B5563] text-base leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

// Generic feature card visual (phone/UI placeholder)
export function FeatureCard({ children }: { children?: React.ReactNode }) {
    return (
        <div className="w-full max-w-[420px] aspect-[4/3] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
