export type NavigationIcon = "home" | "sync_alt" | "hub" | "chat";

export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIcon;
};

export const mobileNavigation: readonly NavigationItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Jobber", href: "/jobber-automation", icon: "sync_alt" },
  { label: "Systems", href: "/integrations", icon: "hub" },
  { label: "Text Us", href: "/contact", icon: "chat" },
];

export const footerNavigation = [
  { label: "Jobber Automation", href: "/jobber-automation" },
  { label: "Integrations", href: "/integrations" },
  { label: "Contact", href: "/contact" },
  // TODO: Replace this placeholder with the approved legal route and content.
  { label: "Privacy & Terms", href: "#" },
] as const;
