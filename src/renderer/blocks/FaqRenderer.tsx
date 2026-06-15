import type { FaqBlock } from "@/types/page";

export function FaqRenderer({ block }: { block: FaqBlock }) {
  const { heading, items } = block.props;
  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      {heading && (
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">{heading}</h2>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.id}
            className="group border border-gray-200 rounded-lg overflow-hidden"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50 select-none">
              <span>{item.question}</span>
              <span className="ml-4 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </summary>
            <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
