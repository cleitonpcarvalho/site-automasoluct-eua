export type IntegrationsIconName =
  | "arrow-right"
  | "chat"
  | "copy"
  | "sync-problem"
  | "folder"
  | "search"
  | "reminder"
  | "rules"
  | "swap"
  | "bolt"
  | "tune"
  | "integration"
  | "verified"
  | "engineering";

const iconPaths: Record<IntegrationsIconName, readonly string[]> = {
  "arrow-right": ["M5 12h14", "m14 0-5-5", "m14 0-5 5"],
  chat: ["M4 4.5h16v12H8l-4 3v-15Z", "M8 8.5h8", "M8 12.5h5"],
  copy: ["M8 8h11v12H8V8Z", "M5 16H4V4h11v1"],
  "sync-problem": [
    "M20 7v5h-5",
    "M4 17v-5h5",
    "M18.1 9A7 7 0 0 0 6.4 6.4L4 9",
    "M5.9 15A7 7 0 0 0 17.6 17.6L20 15",
  ],
  folder: ["M3 6h7l2 2h9v11H3V6Z"],
  search: ["M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z", "m16 16 5 5"],
  reminder: ["M5 5h14v14H5V5Z", "M8 3v4M16 3v4", "M8 11h8", "m13 15 1.5 1.5L18 13"],
  rules: ["M4 5h16v14H4V5Z", "M8 9h8", "M8 13h3", "m14 13 1.5 1.5L18 12"],
  swap: ["M7 7h12m0 0-3-3m3 3-3 3", "M17 17H5m0 0 3 3m-3-3 3-3"],
  bolt: ["m13 2-7 11h5l-1 9 8-12h-5V2Z"],
  tune: ["M4 7h10", "M18 7h2", "M4 17h2", "M10 17h10", "M14 4v6", "M6 14v6"],
  integration: [
    "M12 9.5v-4",
    "M8.6 13.7 5.2 17",
    "m15.4 13.7 3.4 3.3",
    "M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z",
    "M10 3.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
    "M3.2 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
    "M16.8 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
  ],
  verified: [
    "M12 2.75 14.2 5l3-.2.8 2.9 2.5 1.7-1.4 2.6 1.4 2.6-2.5 1.7-.8 2.9-3-.2-2.2 2.25-2.2-2.25-3 .2-.8-2.9-2.5-1.7L4.9 12 3.5 9.4 6 7.7l.8-2.9 3 .2L12 2.75Z",
    "m8.8 12 2.1 2.1 4.5-4.5",
  ],
  engineering: [
    "m14.5 6.5 3-3 3 3-3 3",
    "M17.5 6.5 11 13",
    "m9.5 14.5-5 5",
    "M5 4l3 3-2 2-3-3 2-2Z",
    "m8 7 9 9",
  ],
};

type IntegrationsIconProps = {
  className?: string;
  name: IntegrationsIconName;
};

export function IntegrationsIcon({
  className = "size-[18px]",
  name,
}: IntegrationsIconProps) {
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
