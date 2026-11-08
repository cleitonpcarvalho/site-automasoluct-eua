import Image from "next/image";

import type { BlogImage as ImageReference } from "@/lib/blog/types";

export function BlogImage({ image, featured = false }: { image: ImageReference; featured?: boolean }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
      <Image
        alt={image.alt}
        className="object-contain"
        fill
        loading={featured ? "eager" : "lazy"}
        sizes={featured ? "(min-width: 1280px) 1152px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
        src={image.url}
        // Files are served from a persistent runtime volume, outside public/.
        unoptimized
      />
    </div>
  );
}
