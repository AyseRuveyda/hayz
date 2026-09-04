import { cn } from "@/lib/utils";

type Props = {
  /** Sidebar/header: sm=44, md=56, lg=64 — Hayz yazısıyla hizalı, görünür marka */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { box: "h-11 w-11", px: 44 },
  md: { box: "h-14 w-14", px: 56 },
  lg: { box: "h-16 w-16", px: 64 },
} as const;

/** Site markası — lotus / hilâl (yüksek çözünürlük, sıkıştırma yok) */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center leading-none",
        s.box,
        className
      )}
    >
      {/* native img: next/image sıkıştırması markayı yumuşatıyordu */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/logo-mark.png"
        alt="Hayz"
        width={s.px}
        height={s.px}
        className="h-full w-full select-none object-contain object-center"
        draggable={false}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
      />
    </span>
  );
}
