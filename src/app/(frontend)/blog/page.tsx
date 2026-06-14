import { headers } from "next/headers";
import { getPages } from "@/lib/pageService";
import Link from "next/link";
import type { Metadata } from "next";
import type { PageDocument } from "@/types/page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Blog" };
}

function getExcerpt(content: string): string {
  try {
    const doc = JSON.parse(content) as PageDocument;
    for (const section of doc.sections) {
      for (const col of section.columns) {
        for (const block of col.blocks) {
          if (block.type === "text" || block.type === "heading") {
            const text = (block.props as any).content ?? (block.props as any).text ?? "";
            // Strip HTML tags
            const plain = text.replace(/<[^>]+>/g, "").trim();
            if (plain.length > 20) return plain.slice(0, 160) + (plain.length > 160 ? "…" : "");
          }
        }
      }
    }
  } catch { /* empty */ }
  return "";
}

export default async function BlogIndexPage() {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";
  const allPages = await getPages(tenantSlug, "post");
  const posts = allPages.filter((p) => p.status === "published");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-10">Latest articles and updates</p>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts published yet.</p>
      ) : (
        <ul className="flex flex-col gap-8">
          {posts.map((post) => {
            const excerpt = getExcerpt(post.content);
            const date = post.publishedAt
              ? new Date(typeof post.publishedAt === "number" ? post.publishedAt * 1000 : post.publishedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })
              : null;
            return (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <time className="text-xs text-gray-400 mb-1 block">{date}</time>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {post.title}
                  </h2>
                  {excerpt && <p className="text-gray-600 text-sm leading-relaxed">{excerpt}</p>}
                  <span className="text-blue-600 text-sm mt-2 inline-block group-hover:underline">Read more →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
