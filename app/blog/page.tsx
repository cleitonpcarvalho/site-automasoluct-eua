import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { PostCard } from "@/components/blog/PostCard";
import { getBlogService } from "@/lib/blog/service";
import { createPageMetadata } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({ title: "Blog | Automa Soluct", description: "Practical insights on Jobber automation, software integrations, and custom business workflows.", path: "/blog" });

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const value = (await searchParams).page;
  if (value !== undefined && (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value) || Number(value) > 10000)) notFound();
  const page = value === undefined ? 1 : Number(value);
  const posts = getBlogService().listPublished(page, 10);
  if (page > 1 && posts.items.length === 0) notFound();
  const featured = page === 1 ? posts.items[0] : undefined;
  const remaining = featured ? posts.items.slice(1) : posts.items;
  const pages = Math.ceil(posts.total / posts.pageSize);

  return <Container className="flex max-w-7xl flex-col gap-10 py-10 sm:gap-14 sm:py-16 lg:py-20">
    <header className="flex max-w-3xl flex-col gap-4">
      <p className="font-mono text-xs uppercase tracking-wider text-primary-soft">Automa Soluct Journal</p>
      <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Practical ideas for connected operations.</h1>
      <p className="text-base leading-7 text-text-medium">Insights on Jobber automation, integrations, and custom software for service businesses.</p>
    </header>
    {posts.total === 0 ? <section aria-label="Blog updates" className="rounded-2xl border border-border-subtle bg-surface-1 p-6 sm:p-10">
      <h2 className="font-heading text-xl font-bold">Articles are on the way.</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-text-medium">Our first articles will appear here once they are ready. Have a workflow to discuss in the meantime?</p>
      <Link className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold hover:bg-primary-hover" href="/contact">Talk to an engineer</Link>
    </section> : <>
      {featured && <PostCard featured post={featured} />}
      {remaining.length > 0 && <section aria-label="More articles" className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{remaining.map(post => <PostCard key={post.id} post={post} />)}</section>}
      {pages > 1 && <nav aria-label="Blog pagination" className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
        {page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-lg border border-border-strong px-4 text-sm" href={page === 2 ? "/blog" : `/blog?page=${page - 1}`} rel="prev">← Previous</Link> : <span />}
        <span className="text-sm text-text-medium">Page {page} of {pages}</span>
        {page < pages ? <Link className="inline-flex min-h-11 items-center rounded-lg border border-border-strong px-4 text-sm" href={`/blog?page=${page + 1}`} rel="next">Next →</Link> : <span />}
      </nav>}
    </>}
  </Container>;
}
