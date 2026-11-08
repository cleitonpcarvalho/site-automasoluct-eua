export type IntegrationPlatform = {
  id: string;
  name: string;
  category: string;
  description: string;
  src: string;
  central?: boolean;
};

export const integrationPlatforms: readonly IntegrationPlatform[] = [
  {
    id: "jobber",
    name: "Jobber",
    category: "Core Operational Platform",
    description:
      "Serves as your primary record for field dispatch, client records, job quotes, and operational scheduling.",
    src: "/assets/logos/logo-jobber.png",
    central: true,
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    category: "Accounting",
    description:
      "Invoice and deposit synchronization with class and item code mapping.",
    src: "/assets/logos/logo-quickbooks-online.png",
  },
  {
    id: "xero",
    name: "Xero",
    category: "Ledger",
    description:
      "Tax reconciliation and ledger updates as Jobber jobs finalize.",
    src: "/assets/logos/logo-xero.png",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    category: "Cloud Storage",
    description:
      "Automated folder generation and file routing for estimates, proposals, and signed files.",
    src: "/assets/logos/logo-google-workspace.png",
  },
  {
    id: "companycam",
    name: "CompanyCam",
    category: "Field Visuals",
    description:
      "Automatic sync of before-and-after photos and inspection notes into Jobber client files.",
    src: "/assets/logos/logo-companycam.png",
  },
  {
    id: "highlevel",
    name: "HighLevel",
    category: "CRM & Marketing",
    description:
      "Connections for inbound marketing leads, campaign attribution, and client status updates.",
    src: "/assets/logos/logo-hightlevel.png",
  },
  {
    id: "quo",
    name: "Quo",
    category: "Business Communications",
    description:
      "Calls and messaging connections for service-business communication workflows.",
    src: "/assets/logos/logo-quo.png",
  },
];

/** React Bits item contract; only the existing local platform logos are used. */
export const integrationCarouselItems = integrationPlatforms.map((platform) => ({
  src: platform.src,
  alt: platform.name,
  title: platform.name,
  subtitle: platform.central ? "Central platform" : platform.category,
}));
