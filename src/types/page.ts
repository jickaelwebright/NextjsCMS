export type NodeId = string;

export interface StyleProperties {
  marginTop?: string;
  marginBottom?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  opacity?: string;
  display?: "flex" | "block" | "hidden" | "grid";
  customCss?: string;
}

export interface ResponsiveStyle {
  mobile?: StyleProperties;
  tablet?: StyleProperties;
  desktop?: StyleProperties;
}

// ─── Block Types ─────────────────────────────────────────────────────────────

export interface TextBlock {
  id: NodeId;
  type: "text";
  props: {
    content: string;
    align?: "left" | "center" | "right" | "justify";
    color?: string;
    fontSize?: string;
  };
  styles: ResponsiveStyle;
}

export interface HeadingBlock {
  id: NodeId;
  type: "heading";
  props: {
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align?: "left" | "center" | "right";
    color?: string;
  };
  styles: ResponsiveStyle;
}

export interface ImageBlock {
  id: NodeId;
  type: "image";
  props: {
    src: string;
    alt: string;
    href?: string;
    objectFit?: "cover" | "contain" | "fill";
    width?: number;
    height?: number;
  };
  styles: ResponsiveStyle;
}

export interface ButtonBlock {
  id: NodeId;
  type: "button";
  props: {
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    openInNewTab?: boolean;
    align?: "left" | "center" | "right";
  };
  styles: ResponsiveStyle;
}

export interface HeroBlock {
  id: NodeId;
  type: "hero";
  props: {
    heading: string;
    subheading?: string;
    backgroundImage?: string;
    backgroundOverlay?: number;
    ctaLabel?: string;
    ctaHref?: string;
    ctaVariant?: "primary" | "secondary" | "outline";
    minHeight?: string;
    align?: "left" | "center" | "right";
    textColor?: string;
  };
  styles: ResponsiveStyle;
}

export interface CardBlock {
  id: NodeId;
  type: "card";
  props: {
    image?: string;
    heading: string;
    body: string;
    ctaLabel?: string;
    ctaHref?: string;
    variant?: "default" | "outlined" | "elevated";
  };
  styles: ResponsiveStyle;
}

export interface VideoBlock {
  id: NodeId;
  type: "video";
  props: {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  };
  styles: ResponsiveStyle;
}

export interface DividerBlock {
  id: NodeId;
  type: "divider";
  props: {
    style?: "solid" | "dashed" | "dotted" | "none";
    color?: string;
    thickness?: number;
    width?: number;
  };
  styles: ResponsiveStyle;
}

export interface SpacerBlock {
  id: NodeId;
  type: "spacer";
  props: {
    height: number;
  };
  styles: ResponsiveStyle;
}

export interface FormBlock {
  id: NodeId;
  type: "form";
  props: {
    formId?: string;
    submitLabel?: string;
    successMessage?: string;
    fields?: FormField[];
    emailTo?: string;
  };
  styles: ResponsiveStyle;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  span?: "full" | "half";
}

export interface TestimonialBlock {
  id: NodeId;
  type: "testimonial";
  props: {
    quote: string;
    authorName: string;
    authorRole?: string;
    authorCompany?: string;
    avatarUrl?: string;
    rating?: number;
  };
  styles: ResponsiveStyle;
}

export interface ParallaxBlock {
  id: NodeId;
  type: "parallax";
  props: {
    backgroundImage: string;
    speed?: number;
    minHeight?: string;
    heading?: string;
    subheading?: string;
    overlayOpacity?: number;
    textColor?: string;
  };
  styles: ResponsiveStyle;
}

export interface SliderBlock {
  id: NodeId;
  type: "slider";
  props: {
    slides: Array<{
      image: string;
      heading?: string;
      subheading?: string;
      ctaLabel?: string;
      ctaHref?: string;
    }>;
    autoplay?: boolean;
    autoplayDelay?: number;
    showDots?: boolean;
    showArrows?: boolean;
    height?: string;
    overlayOpacity?: number;
  };
  styles: ResponsiveStyle;
}

export type Block =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ButtonBlock
  | HeroBlock
  | CardBlock
  | VideoBlock
  | DividerBlock
  | SpacerBlock
  | FormBlock
  | TestimonialBlock
  | PricingTableBlock
  | ParallaxBlock
  | SliderBlock;

export type BlockType = Block["type"];

// ─── Layout Nodes ─────────────────────────────────────────────────────────────

export type ColumnLayout =
  | "1"
  | "1/2+1/2"
  | "1/3+2/3"
  | "2/3+1/3"
  | "1/3+1/3+1/3"
  | "1/4+1/4+1/4+1/4";

export interface Column {
  id: NodeId;
  span: number;
  blocks: Block[];
  styles: ResponsiveStyle;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingTableBlock {
  id: NodeId;
  type: "pricing";
  props: {
    heading?: string;
    subheading?: string;
    tiers: PricingTier[];
  };
  styles: ResponsiveStyle;
}

export interface Section {
  id: NodeId;
  label?: string;
  anchorId?: string;
  columns: Column[];
  columnLayout: ColumnLayout;
  styles: ResponsiveStyle;
  backgroundType?: "color" | "image" | "gradient" | "video";
  backgroundValue?: string;
  backgroundOverlay?: number;
  fullWidth?: boolean;
  containerWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  hidden?: boolean;
  locked?: boolean;
}

// ─── Page Document ─────────────────────────────────────────────────────────────

export interface PageMeta {
  title: string;
  slug: string;
  description?: string;
  ogImage?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface PageSettings {
  globalFontFamily?: string;
  globalPrimaryColor?: string;
  headerVisible?: boolean;
  footerVisible?: boolean;
  customHeadHtml?: string;
}

export interface PageDocument {
  version: number;
  meta: PageMeta;
  settings: PageSettings;
  sections: Section[];
}

// ─── Column layout helpers ─────────────────────────────────────────────────────

export const COLUMN_LAYOUT_SPANS: Record<ColumnLayout, number[]> = {
  "1": [12],
  "1/2+1/2": [6, 6],
  "1/3+2/3": [4, 8],
  "2/3+1/3": [8, 4],
  "1/3+1/3+1/3": [4, 4, 4],
  "1/4+1/4+1/4+1/4": [3, 3, 3, 3],
};
