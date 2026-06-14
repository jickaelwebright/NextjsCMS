import type { TestimonialBlock } from "@/types/page";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "text-yellow-400" : "text-gray-200"} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

export function TestimonialRenderer({ block }: { block: TestimonialBlock }) {
  const p = block.props;
  return (
    <figure className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
      {p.rating != null && p.rating > 0 && <Stars rating={p.rating} />}
      <blockquote className="text-gray-700 text-base leading-relaxed italic flex-1">
        &ldquo;{p.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {p.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatarUrl}
            alt={p.authorName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{p.authorName}</p>
          {(p.authorRole || p.authorCompany) && (
            <p className="text-xs text-gray-500">
              {[p.authorRole, p.authorCompany].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
