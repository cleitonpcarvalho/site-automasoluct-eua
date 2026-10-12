export type HomeIconName =
  | "arrow-right"
  | "sms"
  | "verified"
  | "hub"
  | "bolt"
  | "sync"
  | "workflow"
  | "terminal"
  | "target"
  | "payments"
  | "receipt"
  | "folder"
  | "photo"
  | "route"
  | "support"
  | "code"
  | "clock"
  | "clipboard-check"
  | "send"
  | "chat"
  | "check-circle";

const iconPaths: Record<HomeIconName, readonly string[]> = {
  "arrow-right": ["M5 12h14", "m14 0-5-5", "m14 0-5 5"],
  sms: ["M4 4.5h16v12H8l-4 3v-15Z", "M8 8.5h8", "M8 12.5h5"],
  verified: [
    "M12 2.75 14.2 5l3-.2.8 2.9 2.5 1.7-1.4 2.6 1.4 2.6-2.5 1.7-.8 2.9-3-.2-2.2 2.25-2.2-2.25-3 .2-.8-2.9-2.5-1.7L4.9 12 3.5 9.4 6 7.7l.8-2.9 3 .2L12 2.75Z",
    "m8.8 12 2.1 2.1 4.5-4.5",
  ],
  hub: [
    "M12 9.5v-4",
    "M8.6 13.7 5.2 17",
    "m15.4 13.7 3.4 3.3",
    "M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z",
    "M10 3.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
    "M3.2 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
    "M16.8 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
  ],
  bolt: ["m13 2-7 11h5l-1 9 8-12h-5V2Z"],
  sync: [
    "M20 7v5h-5",
    "M4 17v-5h5",
    "M18.1 9A7 7 0 0 0 6.4 6.4L4 9",
    "M5.9 15A7 7 0 0 0 17.6 17.6L20 15",
  ],
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
  payments: [
    "M3 6h18v12H3V6Z",
    "M3 10h18",
    "M7 15h3",
  ],
  receipt: [
    "M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z",
    "M9 8h6",
    "M9 12h6",
    "M9 16h4",
  ],
  folder: ["M3 6h7l2 2h9v11H3V6Z"],
  photo: [
    "M3 5h18v14H3V5Z",
    "M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "m3 17 5-5 3 3 2-2 5 4",
  ],
  route: [
    "M6 5a2 2 0 1 0 0 .01",
    "M18 19a2 2 0 1 0 0 .01",
    "M8 5h4a3 3 0 0 1 3 3v8a3 3 0 0 0 3 3",
    "m10 9-2-2-2 2",
  ],
  support: [
    "M4 13v-2a8 8 0 0 1 16 0v2",
    "M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z",
    "M20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z",
    "M17 19c0 1.1-.9 2-2 2h-3",
  ],
  code: ["m9 18-6-6 6-6", "m15 6 6 6-6 6"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 7v5l3 2"],
  "clipboard-check": [
    "M9 4h6l1 2h3v15H5V6h3l1-2Z",
    "m8.5 14 2.2 2.2 4.8-5",
  ],
  send: ["m3 3 18 9-18 9 4-9-4-9Z", "M7 12h14"],
  chat: ["M4 4.5h16v12H8l-4 3v-15Z", "M8 8.5h8", "M8 12.5h5"],
  "check-circle": [
    "M21 11.1V12a9 9 0 1 1-5.3-8.2",
    "m8.5 11.5 2.5 2.5 6-6",
  ],
};

type HomeIconProps = {
  className?: string;
  name: HomeIconName;
};

export function HomeIcon({ className = "size-[18px]", name }: HomeIconProps) {
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
