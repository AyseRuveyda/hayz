import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Sidebar/header markası: sm≈40, md≈48, lg≈56 — Hayz yazısıyla hizalı */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { box: "h-10 w-10", px: 40 },
  md: { box: "h-12 w-12", px: 48 },
  lg: { box: "h-14 w-14", px: 56 },
} as const;

/** Site markası — lotus / hilâl logosu (yüksek çözünürlük, sıkıştırma yok) */
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
      <Image
        src="/icons/logo-mark.png"
        alt="Hayz"
        width={s.px * 2}
        height={s.px * 2}
        sizes={`${s.px}px`}
        quality={100}
        unoptimized
        className="h-full w-full object-contain object-center"
        priority={priority}
        draggable={false}
      />
    </span>
  );
}
