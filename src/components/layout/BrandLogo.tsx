import { cn } from "@/lib/utils";

type Props = {
  /** Sidebar/header: sm=48, md=56, lg=64 — Hayz yazısıyla hizalı */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: 48,
  md: 56,
  lg: 64,
} as const;

/** Site markası — lotus / hilâl (yüksek çözünürlük PNG, inline boyut) */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const px = SIZE[size];
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      {/* native img + inline size: net görünüm, Tailwind sınıfına bağımlı değil */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/logo-mark.png"
        alt="Hayz"
        width={px}
        height={px}
        style={{ width: px, height: px }}
        className="select-none object-contain object-center"
        draggable={false}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
      />
    </span>
  );
}
