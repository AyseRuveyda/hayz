import { cn } from "@/lib/utils";

type Props = {
  /**
   * Responsive ideal sizes (full logo, never cropped):
   * sm=40 mobile header · md=44 · lg=48 sidebar
   */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: 40,
  md: 44,
  lg: 48,
} as const;

/** Site markası — lotus / hilâl; tam görünür, kırpılmadan, ideal boyutta */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const px = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className
      )}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/logo-mark.png?v=6"
        alt="Hayz"
        width={px}
        height={px}
        style={{ width: px, height: px }}
        className="pointer-events-none block select-none object-contain object-center"
        draggable={false}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
      />
    </span>
  );
}
