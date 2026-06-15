import { HeadingRenderer } from "./blocks/HeadingRenderer";
import { TextRenderer } from "./blocks/TextRenderer";
import { ImageRenderer } from "./blocks/ImageRenderer";
import { ButtonRenderer } from "./blocks/ButtonRenderer";
import { HeroRenderer } from "./blocks/HeroRenderer";
import { CardRenderer } from "./blocks/CardRenderer";
import { VideoRenderer } from "./blocks/VideoRenderer";
import { DividerRenderer } from "./blocks/DividerRenderer";
import { SpacerRenderer } from "./blocks/SpacerRenderer";
import { FormRenderer } from "./blocks/FormRenderer";
import { TestimonialRenderer } from "./blocks/TestimonialRenderer";
import { PricingTableRenderer } from "./blocks/PricingTableRenderer";
import { ParallaxRenderer } from "./blocks/ParallaxRenderer";
import { SliderRenderer } from "./blocks/SliderRenderer";
import { FaqRenderer } from "./blocks/FaqRenderer";
import { AccordionRenderer } from "./blocks/AccordionRenderer";
import { EmbedRenderer } from "./blocks/EmbedRenderer";
import { HtmlRenderer } from "./blocks/HtmlRenderer";
import type { Block } from "@/types/page";

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  isBuilder?: boolean;
}

export function BlockRenderer({ block, isEditing, isBuilder }: BlockRendererProps) {
  switch (block.type) {
    case "heading":  return <HeadingRenderer block={block} />;
    case "text":     return <TextRenderer block={block} />;
    case "image":    return <ImageRenderer block={block} />;
    case "button":   return <ButtonRenderer block={block} />;
    case "hero":     return <HeroRenderer block={block} />;
    case "card":     return <CardRenderer block={block} />;
    case "video":    return <VideoRenderer block={block} />;
    case "divider":  return <DividerRenderer block={block} />;
    case "spacer":   return <SpacerRenderer block={block} />;
    case "form":         return <FormRenderer block={block} />;
    case "testimonial":  return <TestimonialRenderer block={block} />;
    case "pricing":      return <PricingTableRenderer block={block} />;
    case "parallax":     return <ParallaxRenderer block={block} />;
    case "slider":       return <SliderRenderer block={block} />;
    case "faq":          return <FaqRenderer block={block} />;
    case "accordion":    return <AccordionRenderer block={block} />;
    case "embed":        return <EmbedRenderer block={block} />;
    case "html":         return isBuilder
      ? (
        <div className="flex items-center gap-2 px-4 py-6 bg-gray-100 border border-dashed border-gray-300 rounded text-gray-400 text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 7l-4 10" strokeLinecap="round" strokeLinejoin="round" /></svg>
          HTML Block — renders on published page
        </div>
      )
      : <HtmlRenderer block={block} />;
    default:             return null;
  }
}
