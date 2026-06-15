import { Check } from "lucide-react";
import type { PricingTableBlock } from "@/types/page";

export function PricingTableRenderer({ block }: { block: PricingTableBlock }) {
  const { heading, subheading, tiers } = block.props;

  return (
    <div className="w-full py-8 px-4">
      {(heading || subheading) && (
        <div className="text-center mb-10">
          {heading && <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>}
          {subheading && <p className="text-gray-500 text-lg">{subheading}</p>}
        </div>
      )}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(tiers.length, 3)}, minmax(0, 1fr))` }}>
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`relative rounded-2xl border p-6 flex flex-col gap-4 ${
              tier.highlighted
                ? "border-blue-500 bg-blue-600 text-white shadow-xl scale-105"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-0.5 rounded-full">
                {tier.badge}
              </span>
            )}
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wide mb-1 ${tier.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                {tier.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className={`text-sm ${tier.highlighted ? "text-blue-200" : "text-gray-400"}`}>{tier.period}</span>
                )}
              </div>
            </div>
            <ul className="flex flex-col gap-2 flex-1">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check size={15} className={`mt-0.5 shrink-0 ${tier.highlighted ? "text-blue-200" : "text-blue-500"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {tier.ctaLabel && (
              <a
                href={tier.ctaHref ?? "#"}
                className={`mt-2 text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {tier.ctaLabel}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
