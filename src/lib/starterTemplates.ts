import { generateId } from "./utils";
import type { PageDocument, Section } from "@/types/page";

type ColBlocks = PageDocument["sections"][0]["columns"][0]["blocks"];

function col(blocks: ColBlocks) {
  return { id: generateId(), span: 12, blocks, styles: {} };
}

const SPANS: Record<number, number[]> = { 1: [12], 2: [6, 6], 3: [4, 4, 4], 4: [3, 3, 3, 3] };

function section(columns: ReturnType<typeof col>[], extra: Partial<Section> = {}): Section {
  const n = columns.length;
  const layout = n === 1 ? "1" : n === 3 ? "1/3+1/3+1/3" : "1/2+1/2";
  const spans = SPANS[n] ?? [12];
  return {
    id: generateId(),
    columns: columns.map((c, i) => ({ ...c, span: spans[i] ?? 12 })),
    columnLayout: layout as Section["columnLayout"],
    styles: {},
    ...extra,
  };
}

function hero(heading: string, subheading: string, ctaLabel = "", ctaHref = "", textColor = "#ffffff"): ColBlocks[0] {
  return { id: generateId(), type: "hero", props: { heading, subheading, ctaLabel, ctaHref, textColor }, styles: {} };
}

function card(heading: string, body: string, image?: string): ColBlocks[0] {
  return { id: generateId(), type: "card", props: { heading, body, ...(image ? { image } : {}) }, styles: {} };
}

function richText(content: string): ColBlocks[0] {
  return { id: generateId(), type: "text", props: { content }, styles: {} };
}

function heading2(content: string): ColBlocks[0] {
  return { id: generateId(), type: "heading", props: { content, level: 2 as const }, styles: {} };
}

function heading3(content: string): ColBlocks[0] {
  return { id: generateId(), type: "heading", props: { content, level: 3 as const }, styles: {} };
}

function contactForm(): ColBlocks[0] {
  return {
    id: generateId(), type: "form",
    props: {
      submitLabel: "Send Message",
      successMessage: "Thanks! We'll be in touch shortly.",
      emailTo: "",
      fields: [
        { id: generateId(), label: "Your Name", type: "text", required: true, placeholder: "John Smith" },
        { id: generateId(), label: "Email", type: "email", required: true, placeholder: "john@example.com" },
        { id: generateId(), label: "Message", type: "textarea", required: false, placeholder: "How can we help?" },
      ],
    },
    styles: {},
  };
}

function enquiryForm(): ColBlocks[0] {
  return {
    id: generateId(), type: "form",
    props: {
      submitLabel: "Send Enquiry",
      successMessage: "Message received! We'll respond within 1 business day.",
      emailTo: "",
      fields: [
        { id: generateId(), label: "Full Name", type: "text", required: true, placeholder: "Jane Smith" },
        { id: generateId(), label: "Email", type: "email", required: true, placeholder: "jane@example.com" },
        { id: generateId(), label: "Phone", type: "text", required: false, placeholder: "+61 400 000 000" },
        { id: generateId(), label: "How can we help?", type: "textarea", required: true, placeholder: "Tell us about your project..." },
      ],
    },
    styles: {},
  };
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function landingPage(): PageDocument {
  return {
    version: 1,
    meta: { title: "Landing Page", slug: "landing", description: "A clean, conversion-focused landing page." },
    settings: {},
    sections: [
      section([col([hero("Grow Your Business Online", "We build fast, beautiful websites that convert visitors into clients.", "Get Started", "#contact")])], { backgroundType: "color", backgroundValue: "#1e3a8a" }),
      section([
        col([card("Fast Performance", "Pages load in under 1 second. Google loves speed and so do your visitors.")]),
        col([card("SEO Optimised", "Built-in meta tags and structured data give you an edge in search results.")]),
        col([card("Easy to Manage", "Update your content anytime without touching code. Publish in one click.")]),
      ]),
      section([col([richText("<h2 style=\"text-align:center;font-size:1.875rem;font-weight:700;margin-bottom:1rem\">What Our Clients Say</h2><p style=\"text-align:center;color:#4b5563;max-width:36rem;margin:0 auto\">\"Working with this team transformed our online presence. Enquiries doubled within 3 months.\" &mdash; Sarah M., Small Business Owner</p>")])]),
      section([col([contactForm()])], { backgroundType: "color", backgroundValue: "#f9fafb" }),
    ],
  };
}

// ── About Page ────────────────────────────────────────────────────────────────
function aboutPage(): PageDocument {
  return {
    version: 1,
    meta: { title: "About Us", slug: "about", description: "Learn more about our team and mission." },
    settings: {},
    sections: [
      section([col([hero("About Our Agency", "We're a small team passionate about crafting exceptional digital experiences.", "Meet The Team", "#team")])], { backgroundType: "color", backgroundValue: "#0f172a" }),
      section([
        col([
          heading2("Our Story"),
          richText("<p>Founded in 2018, we have helped over 120 businesses across Australia build their digital presence. We believe every business deserves a website that works as hard as they do.</p>"),
        ]),
        col([{ id: generateId(), type: "image", props: { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", alt: "Our team at work", objectFit: "cover" as const }, styles: {} }]),
      ]),
      section([
        col([card("120+", "Clients served across Australia, New Zealand, and Southeast Asia.")]),
        col([card("8 Years", "Of experience building websites that rank and convert.")]),
        col([card("98%", "Client satisfaction rate. We do not stop until you are happy.")]),
      ], { backgroundType: "color", backgroundValue: "#f1f5f9" }),
      section([col([richText("<h2 style=\"text-align:center;font-size:1.5rem;font-weight:700;margin-bottom:2rem\" id=\"team\">Meet The Team</h2>")])]),
      section([
        col([card("Alex Chen", "Co-founder and Lead Developer. 10 years experience in React, Node.js, and cloud architecture.", "https://i.pravatar.cc/200?img=3")]),
        col([card("Jordan Lee", "Creative Director and UI Designer. Award-winning designer specialising in conversion-focused interfaces.", "https://i.pravatar.cc/200?img=5")]),
        col([card("Sam Williams", "SEO and Growth Strategist. Helps clients rank #1 for their most important keywords.", "https://i.pravatar.cc/200?img=8")]),
      ]),
    ],
  };
}

// ── Contact Page ──────────────────────────────────────────────────────────────
function contactPage(): PageDocument {
  return {
    version: 1,
    meta: { title: "Contact Us", slug: "contact", description: "Get in touch with our team." },
    settings: {},
    sections: [
      section([col([hero("Get In Touch", "Have a project in mind? Fill in the form or reach out directly.", "", "")])], { backgroundType: "color", backgroundValue: "#312e81" }),
      section([
        col([enquiryForm()]),
        col([
          heading3("Contact Details"),
          richText("<p>Melbourne VIC 3000, Australia</p><p style=\"margin-top:0.75rem\">Phone: +61 3 9000 0000</p><p style=\"margin-top:0.5rem\">Email: hello@agency.com.au</p><p style=\"margin-top:0.75rem\">Monday to Friday, 9am to 5:30pm AEST</p>"),
        ]),
      ]),
      section([
        col([card("Fast Response", "We respond to all enquiries within 1 business day.")]),
        col([card("Free Consultation", "Book a 30-minute call to discuss your project at no obligation.")]),
        col([card("Australia-Wide", "We work with clients across all states and territories.")]),
      ], { backgroundType: "color", backgroundValue: "#f8fafc" }),
    ],
  };
}

export interface StarterTemplate {
  name: string;
  category: string;
  content: PageDocument;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  { name: "Landing Page", category: "Marketing", content: landingPage() },
  { name: "About Us", category: "Business", content: aboutPage() },
  { name: "Contact Page", category: "Business", content: contactPage() },
];
