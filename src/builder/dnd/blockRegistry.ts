import type { BlockMeta, BlockType } from "@/types/builder";

export const BLOCK_REGISTRY: BlockMeta[] = [
  { type: "heading",  label: "Heading",  icon: "Heading",            category: "text",        description: "Title text" },
  { type: "text",     label: "Text",     icon: "Type",               category: "text",        description: "Rich text paragraph" },
  { type: "image",    label: "Image",    icon: "Image",              category: "media",       description: "Image block" },
  { type: "button",   label: "Button",   icon: "MousePointerClick",  category: "interactive", description: "CTA button" },
  { type: "hero",     label: "Hero",     icon: "LayoutTemplate",     category: "layout",      description: "Full-width hero section" },
  { type: "card",     label: "Card",     icon: "CreditCard",         category: "layout",      description: "Content card" },
  { type: "video",    label: "Video / YouTube", icon: "Video",        category: "media",       description: "Embed video or YouTube" },
  { type: "divider",  label: "Divider",  icon: "Minus",              category: "layout",      description: "Horizontal rule" },
  { type: "spacer",   label: "Spacer",   icon: "Space",              category: "layout",      description: "Vertical spacer" },
  { type: "form",        label: "Form",        icon: "FormInput",   category: "interactive", description: "Contact form" },
  { type: "testimonial", label: "Testimonial", icon: "Quote",       category: "layout",      description: "Customer quote" },
  { type: "pricing",     label: "Pricing",     icon: "Table",       category: "interactive", description: "Pricing table" },
  { type: "parallax",    label: "Parallax",    icon: "Layers",      category: "media",       description: "Parallax scroll background" },
  { type: "slider",      label: "Slider",      icon: "GalleryHorizontal", category: "media", description: "Image carousel / slider" },
  { type: "embed",       label: "Embed",       icon: "Globe2",            category: "media", description: "Iframe embed (Maps, Calendly, etc.)" },
  { type: "faq",         label: "FAQ",         icon: "HelpCircle",        category: "interactive", description: "Accordion-style FAQ" },
  { type: "accordion",   label: "Accordion",   icon: "ListCollapse",      category: "interactive", description: "Expandable accordion sections" },
  { type: "html",        label: "HTML Block",  icon: "Code",              category: "interactive", description: "Raw HTML / custom code" },
];

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return BLOCK_REGISTRY.find((b) => b.type === type);
}
