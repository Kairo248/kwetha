import Image from "next/image";

/** White submark — shown on a dark chip so it reads on light backgrounds */
export const SITE_SUBMARK_SRC = "/images/submark-logo-2-white.png";

type SiteBrandMarkProps = {
  size?: "header" | "footer" | "hero";
  className?: string;
};

export function SiteBrandMark({ size = "header", className = "" }: SiteBrandMarkProps) {
  const footer = size === "footer";
  const hero = size === "hero";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-stone-900 ring-1 ring-black/15 dark:bg-stone-950 dark:ring-white/10 ${hero ? "px-8 py-6 sm:px-10 sm:py-7" : footer ? "px-3 py-2 sm:px-4 sm:py-2.5" : "px-2 py-1.5 sm:px-2.5 sm:py-2"} ${className}`}
    >
      <Image
        src={SITE_SUBMARK_SRC}
        alt="Ikwetha"
        width={hero ? 520 : footer ? 160 : 96}
        height={hero ? 182 : footer ? 52 : 36}
        className={
          hero
            ? "h-24 w-auto max-w-104 object-contain object-center sm:h-28 sm:max-w-lg"
            : footer
            ? "h-8 w-auto max-w-40 object-contain object-center sm:h-9 sm:max-w-44"
            : "h-6 w-auto max-w-23 object-contain object-center sm:h-7 sm:max-w-26"
        }
        priority={!footer || hero}
        unoptimized
      />
    </span>
  );
}
