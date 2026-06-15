import type React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import type {
  Block,
  BlockType,
  Column,
  ColumnLayout,
  Section,
  PageDocument,
  ResponsiveStyle,
  StyleProperties,
} from "@/types/page";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  12
);

export function generateId(): string {
  return nanoid();
}

export function emptyStyles(): ResponsiveStyle {
  return { mobile: {}, tablet: {}, desktop: {} };
}

export function createBlock(type: BlockType): Block {
  const base = { id: generateId(), styles: emptyStyles() };
  switch (type) {
    case "text":
      return { ...base, type: "text", props: { content: "<p>Add your text here</p>", align: "left" } };
    case "heading":
      return { ...base, type: "heading", props: { content: "Your Heading", level: 2, align: "left" } };
    case "image":
      return { ...base, type: "image", props: { src: "", alt: "Image", objectFit: "cover" } };
    case "button":
      return { ...base, type: "button", props: { label: "Click Here", href: "#", variant: "primary", size: "md" } };
    case "hero":
      return {
        ...base,
        type: "hero",
        props: {
          heading: "Welcome to Your Site",
          subheading: "A compelling subtitle that drives action",
          ctaLabel: "Get Started",
          ctaHref: "#",
          align: "center",
          minHeight: "60vh",
          textColor: "#ffffff",
          backgroundOverlay: 50,
        },
      };
    case "card":
      return {
        ...base,
        type: "card",
        props: { heading: "Card Title", body: "Card description goes here.", variant: "default" },
      };
    case "video":
      return { ...base, type: "video", props: { url: "", controls: true } };
    case "divider":
      return { ...base, type: "divider", props: { style: "solid", color: "#e5e7eb", thickness: 1, width: 100 } };
    case "spacer":
      return { ...base, type: "spacer", props: { height: 40 } };
    case "form":
      return {
        ...base,
        type: "form",
        props: {
          submitLabel: "Submit",
          successMessage: "Thank you! We'll be in touch.",
          fields: [
            { id: generateId(), type: "text", label: "Name", placeholder: "Your name", required: true },
            { id: generateId(), type: "email", label: "Email", placeholder: "your@email.com", required: true },
            { id: generateId(), type: "textarea", label: "Message", placeholder: "Your message", required: false },
          ],
        },
      };
    case "testimonial":
      return {
        ...base,
        type: "testimonial",
        props: {
          quote: "This product completely changed how we work. Highly recommend!",
          authorName: "Jane Smith",
          authorRole: "CEO",
          authorCompany: "Acme Corp",
          rating: 5,
        },
      };
    case "pricing":
      return {
        ...base,
        type: "pricing",
        props: {
          heading: "Simple, Transparent Pricing",
          subheading: "Choose the plan that works for you",
          tiers: [
            { name: "Basic", price: "$9", period: "/month", features: ["Feature 1", "Feature 2"], ctaLabel: "Get Started", ctaHref: "#", highlighted: false },
            { name: "Pro", price: "$29", period: "/month", features: ["Feature 1", "Feature 2", "Feature 3"], ctaLabel: "Get Started", ctaHref: "#", highlighted: true, badge: "Popular" },
            { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "Priority Support", "Custom Integrations"], ctaLabel: "Contact Us", ctaHref: "#", highlighted: false },
          ],
        },
      };
    case "parallax":
      return {
        ...base,
        type: "parallax",
        props: {
          backgroundImage: "",
          speed: 40,
          minHeight: "60vh",
          heading: "A Powerful Statement",
          subheading: "Your message here, supported by a stunning background",
          overlayOpacity: 40,
          textColor: "#ffffff",
        },
      };
    case "slider":
      return {
        ...base,
        type: "slider",
        props: {
          slides: [
            { image: "", heading: "Slide One", subheading: "First slide description", ctaLabel: "Learn More", ctaHref: "#" },
            { image: "", heading: "Slide Two", subheading: "Second slide description", ctaLabel: "Get Started", ctaHref: "#" },
          ],
          autoplay: true,
          autoplayDelay: 4000,
          showDots: true,
          showArrows: true,
          height: "500px",
          overlayOpacity: 40,
        },
      };
    default:
      return { ...base, type: "text", props: { content: "Block" } } as Block;
  }
}

export function createColumn(span: number): Column {
  return { id: generateId(), span, blocks: [], styles: emptyStyles() };
}

export function createSection(layout: ColumnLayout = "1"): Section {
  const spans: Record<ColumnLayout, number[]> = {
    "1": [12],
    "1/2+1/2": [6, 6],
    "1/3+2/3": [4, 8],
    "2/3+1/3": [8, 4],
    "1/3+1/3+1/3": [4, 4, 4],
    "1/4+1/4+1/4+1/4": [3, 3, 3, 3],
  };
  return {
    id: generateId(),
    columns: spans[layout].map(createColumn),
    columnLayout: layout,
    styles: { mobile: { paddingTop: "48px", paddingBottom: "48px" }, tablet: {}, desktop: {} },
    containerWidth: "xl",
  };
}

export function createEmptyPage(title: string, slug: string): PageDocument {
  return {
    version: 1,
    meta: { title, slug },
    settings: { headerVisible: true, footerVisible: true },
    sections: [],
  };
}

// Re-stamp all IDs in an AI-generated document to avoid collisions
export function rehydrateDocumentIds(doc: PageDocument): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map(rehydrateSectionIds),
  };
}

export function rehydrateSectionIds(section: Section): Section {
  return {
    ...section,
    id: generateId(),
    columns: section.columns.map((c) => ({
      ...c,
      id: generateId(),
      blocks: c.blocks.map((b) => ({ ...b, id: generateId() })),
    })),
  };
}

// Convert ResponsiveStyle to inline style object for a given device
export function styleToInline(style?: StyleProperties): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties = {};
  if (style.marginTop) css.marginTop = style.marginTop;
  if (style.marginBottom) css.marginBottom = style.marginBottom;
  if (style.paddingTop) css.paddingTop = style.paddingTop;
  if (style.paddingBottom) css.paddingBottom = style.paddingBottom;
  if (style.paddingLeft) css.paddingLeft = style.paddingLeft;
  if (style.paddingRight) css.paddingRight = style.paddingRight;
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.textColor) css.color = style.textColor;
  if (style.borderRadius) css.borderRadius = style.borderRadius;
  if (style.borderWidth && style.borderColor)
    css.border = `${style.borderWidth}px solid ${style.borderColor}`;
  if (style.boxShadow) css.boxShadow = style.boxShadow;
  if (style.opacity) css.opacity = parseFloat(style.opacity) / 100;
  return css;
}
