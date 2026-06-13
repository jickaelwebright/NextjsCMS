import type { HeroBlock } from "@/types/page";

export function HeroRenderer({ block }: { block: HeroBlock }) {
  const p = block.props;
  const alignClass = p.align === "center" ? "items-center text-center" : p.align === "right" ? "items-end text-right" : "items-start text-left";

  const bgStyle: React.CSSProperties = p.backgroundImage
    ? { backgroundImage: `url(${p.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: "#1e3a5f" };

  return (
    <section
      className="relative flex items-center w-full overflow-hidden"
      style={{ minHeight: p.minHeight ?? "60vh", ...bgStyle }}
    >
      {/* Overlay */}
      {(p.backgroundOverlay ?? 0) > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: (p.backgroundOverlay ?? 0) / 100 }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-8 py-16 flex flex-col gap-4 ${alignClass}`}>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{ color: p.textColor ?? "#ffffff" }}
        >
          {p.heading}
        </h1>
        {p.subheading && (
          <p className="text-xl opacity-90" style={{ color: p.textColor ?? "#ffffff" }}>
            {p.subheading}
          </p>
        )}
        {p.ctaLabel && p.ctaHref && (
          <a
            href={p.ctaHref}
            className="inline-block mt-2 px-6 py-3 rounded font-semibold transition-colors bg-white text-blue-700 hover:bg-blue-50 w-fit"
          >
            {p.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
