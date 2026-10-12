export type JobberIconName =
  | "arrow-right"
  | "chat"
  | "copy"
  | "unlink"
  | "rules"
  | "media"
  | "repeat"
  | "sync"
  | "workflow"
  | "terminal"
  | "target"
  | "payments"
  | "accounting"
  | "folder"
  | "tune"
  | "route"
  | "down"
  | "verified"
  | "send"
  | "sms"
  | "mail";

const iconPaths: Record<JobberIconName, readonly string[]> = {
  "arrow-right": ["M5 12h14", "m14 0-5-5", "m14 0-5 5"],
  chat: ["M4 4.5h16v12H8l-4 3v-15Z", "M8 8.5h8", "M8 12.5h5"],
  copy: ["M8 8h11v12H8V8Z", "M5 16H4V4h11v1"],
  unlink: [
    "m9.5 14.5-1 1a4 4 0 0 1-5.7-5.7l2-2a4 4 0 0 1 5.7 0",
    "m14.5 9.5 1-1a4 4 0 0 1 5.7 5.7l-2 2a4 4 0 0 1-5.7 0",
    "M8 12h2M14 12h2",
    "m3 3 18 18",
  ],
  rules: ["M4 5h16v14H4V5Z", "M8 9h8", "M8 13h3", "m14 13 1.5 1.5L18 12"],
  media: [
    "M3 5h18v14H3V5Z",
    "M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "m3 17 5-5 3 3 2-2 5 4",
  ],
  repeat: [
    "M20 7v5h-5",
    "M4 17v-5h5",
    "M18.1 9A7 7 0 0 0 6.4 6.4L4 9",
    "M5.9 15A7 7 0 0 0 17.6 17.6L20 15",
  ],
  sync: ["M7 7h12m0 0-3-3m3 3-3 3", "M17 17H5m0 0 3 3m-3-3 3-3"],
  workflow: [
    "M4 4h6v5H4V4Z",
    "M14 15h6v5h-6v-5Z",
    "M14 4h6v5h-6V4Z",
    "M7 9v3h10v3",
    "M17 9v3",
  ],
  terminal: ["M4 5h16v14H4V5Z", "m8 9 3-3-3-3", "M13 14h4"],
  target: [
    "M20 12a8 8 0 1 1-2.34-5.66",
    "M16 12a4 4 0 1 1-1.17-2.83",
    "M12 12 21 3",
    "M17 3h4v4",
  ],
  payments: ["M3 6h18v12H3V6Z", "M3 10h18", "M7 15h3"],
  accounting: ["M3 9 12 4l9 5", "M5 10v8M9 10v8M15 10v8M19 10v8", "M3 20h18"],
  folder: ["M3 6h7l2 2h9v11H3V6Z"],
  tune: ["M4 7h10", "M18 7h2", "M4 17h2", "M10 17h10", "M14 4v6", "M6 14v6"],
  route: [
    "M6 5a2 2 0 1 0 0 .01",
    "M18 19a2 2 0 1 0 0 .01",
    "M8 5h4a3 3 0 0 1 3 3v8a3 3 0 0 0 3 3",
  ],
  down: ["M12 4v16", "m6 14 6 6 6-6"],
  verified: [
    "M12 2.75 14.2 5l3-.2.8 2.9 2.5 1.7-1.4 2.6 1.4 2.6-2.5 1.7-.8 2.9-3-.2-2.2 2.25-2.2-2.25-3 .2-.8-2.9-2.5-1.7L4.9 12 3.5 9.4 6 7.7l.8-2.9 3 .2L12 2.75Z",
    "m8.8 12 2.1 2.1 4.5-4.5",
  ],
  send: ["m3 3 18 9-18 9 4-9-4-9Z", "M7 12h14"],
  sms: ["M4 4.5h16v12H8l-4 3v-15Z", "M8 8.5h8", "M8 12.5h5"],
  mail: ["M3 5h18v14H3V5Z", "m3 7 9 6 9-6"],
};

type JobberIconProps = {
  className?: string;
  name: JobberIconName;
};

export function JobberIcon({
  className = "size-[18px]",
  name,
}: JobberIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {iconPaths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
