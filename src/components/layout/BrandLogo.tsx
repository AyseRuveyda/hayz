import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Dış kutu boyutu: sm=32, md=40, lg=48 — standart header/sidebar markası */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-10 w-10", px: 40 },
  lg: { box: "h-12 w-12", px: 48 },
} as const;

/** Site markası — lotus / hilâl logosu */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        s.box,
        className
      )}
    >
      <Image
        src="/icons/logo-mark.png"
        alt="Hayz"
        width={s.px}
        height={s.px}
        className="h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}
