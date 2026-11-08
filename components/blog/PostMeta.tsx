export function PostMeta({ date, tags }: { date: string; tags: string[] }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-5 text-text-medium">
      <time dateTime={date}>
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date))}
      </time>
      {tags.length > 0 && (
        <ul aria-label="Post tags" className="flex min-w-0 flex-wrap gap-2">
          {tags.map(tag => <li className="max-w-full break-words rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-primary-soft" key={tag}>{tag}</li>)}
        </ul>
      )}
    </div>
  );
}
