export type ContactIconName =
  | "arrow-right"
  | "check"
  | "mail"
  | "send"
  | "shield"
  | "sms";

type ContactIconProps = {
  name: ContactIconName;
  className?: string;
};

export function ContactIcon({ name, className }: ContactIconProps) {
  const commonProps = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  switch (name) {
    case "arrow-right":
      return (
        <svg {...commonProps}>
          <path
            d="M5 12h14m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m8.5 12 2.25 2.25 4.75-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "mail":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="m5 7 7 5 7-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "send":
      return (
        <svg {...commonProps}>
          <path
            d="m4 4 16 8-16 8 2.5-8L4 4Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path d="M6.5 12H20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path
            d="M12 3.5 19 6v5.2c0 4.3-2.8 7.5-7 9.3-4.2-1.8-7-5-7-9.3V6l7-2.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path d="m8.7 11.9 2.1 2.1 4.4-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      );
    case "sms":
      return (
        <svg {...commonProps}>
          <path
            d="M5.5 5h13A2.5 2.5 0 0 1 21 7.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5.5 3v-3.3A2.5 2.5 0 0 1 3 14.5v-7A2.5 2.5 0 0 1 5.5 5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path d="M7 9h10M7 13h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
      );
  }
}
