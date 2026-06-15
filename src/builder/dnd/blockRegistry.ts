import type { BlockMeta, BlockType } from "@/types/builder";

export const BLOCK_REGISTRY: BlockMeta[] = [
  { type: "heading",  label: "Heading",  icon: "Heading",            category: "text",        description: "Title text" },
  { type: "text",     label: "Text",     icon: "Type",               category: "text",        description: "Rich text paragraph" },
  { type: "image",    label: "Image",    icon: "Image",              category: "media",       description: "Image block" },
  { type: "button",   label: "Button",   icon: "MousePointerClick",  category: "interactive", description: "CTA button" },
  { type: "hero",     label: "Hero",     icon: "LayoutTemplate",     category: "layout",      description: "Full-width hero section" },
  { type: "card",     label: "Card",     icon: "CreditCard",         category: "layout",      description: "Content card" },
  { type: "video",    label: "Video",    icon: "Video",              category: "media",       description: "Embed video" },
  { type: "divider",  label: "Divider",  icon: "Minus",              category: "layout",      description: "Horizontal rule" },
  { type: "spacer",   label: "Spacer",   icon: "Space",              category: "layout",      description: "Vertical spacer" },
  { type: "form",        label: "Form",        icon: "FormInput",   category: "interactive", description: "Contact form" },
  { type: "testimonial", label: "Testimonial", icon: "Quote",       category: "layout",      description: "Customer quote" },
  { type: "pricing",     label: "Pricing",     icon: "Table",       category: "interactive", description: "Pricing table" },
];

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return BLOCK_REGISTRY.find((b) => b.type === type);
}
