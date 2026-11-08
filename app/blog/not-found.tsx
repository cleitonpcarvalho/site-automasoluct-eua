import Link from "next/link";

import { Container } from "@/components/layout/Container";

export default function BlogNotFound() {
  return <Container className="flex max-w-4xl flex-col items-start gap-5 py-16">
    <h1 className="font-heading text-3xl font-bold">Article not found.</h1>
    <p className="text-base leading-7 text-text-medium">This article is not available. Browse our published articles for more insights.</p>
    <Link className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold hover:bg-primary-hover" href="/blog">Back to the blog</Link>
  </Container>;
}
