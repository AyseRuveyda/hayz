import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Dış kutu boyutu (px class): sm=28, md=32, lg=40 */
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { box: "h-7 w-7", px: 28 },
  md: { box: "h-8 w-8", px: 32 },
  lg: { box: "h-10 w-10", px: 40 },
} as const;

/** Site markası — lotus / hilâl logosu */
export function BrandLogo({ size = "md", className, priority }: Props) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#F42566]/15 dark:bg-[#1C161B] dark:ring-[#F42566]/25",
        s.box,
        className
      )}
    >
      <Image
        src="/icons/logo-mark.png"
        alt="Hayz"
        width={s.px}
        height={s.px}
        className="h-[85%] w-[85%] object-contain"
        priority={priority}
      />
    </span>
  );
}
