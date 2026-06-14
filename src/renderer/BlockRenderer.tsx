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
import type { Block } from "@/types/page";

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
}

export function BlockRenderer({ block, isEditing }: BlockRendererProps) {
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
    default:             return null;
  }
}
