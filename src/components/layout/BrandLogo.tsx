import { cn } from "@/lib/utils";

type Props = {
  /**
   * Ideal mark sizes (full logo, no crop):
   * sm=36 (mobile header), md=40 (default), lg=44 (sidebar)
   */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: 36,
  md: 40,
  lg: 44,
} as const;

/** Site markası — lotus / hilâl; tam görünür, kırpılmadan */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const px = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className
      )}
      style={{ width: px, height: px }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/logo-mark.png?v=4"
        alt="Hayz"
        width={px}
        height={px}
        style={{ width: px, height: px }}
        className="block max-h-full max-w-full select-none object-contain object-center"
        draggable={false}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
      />
    </span>
  );
}
