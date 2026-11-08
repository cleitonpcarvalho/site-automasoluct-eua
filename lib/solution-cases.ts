import type { HomeIconName } from "@/components/sections/home/HomeIcon";

type SolutionExample = {
  title: string;
  description: string;
  mobileDescription: string;
  icon: HomeIconName;
};

export type SolutionCase = {
  id: string;
  title: string;
  subtitle: string;
  icon: HomeIconName;
  flow: readonly [string, string, string];
  examples: readonly SolutionExample[];
};

// Keep the six existing blueprints, grouped by the solution they illustrate.
export const solutionCases: readonly SolutionCase[] = [
  {
    id: "jobber-automation",
    title: "Jobber Automation",
    subtitle: "Events, rules & operational actions",
    icon: "bolt",
    flow: ["Event", "Business rule", "Operational action"],
    examples: [
      {
        title: "Payment-Triggered Workflows",
        description:
          "Release lien waivers, trigger review-request messages, and notify territory managers when payments clear.",
        mobileDescription:
          "Auto-release lien waivers, trigger review request text messages, and notify territory managers instantly when payments clear.",
        icon: "payments",
      },
      {
        title: "Custom Dispatch Logic & Routing",
        description:
          "Route emergency calls and priority service contracts using crew locations and technician skill tags.",
        mobileDescription:
          "Route emergency calls and high-margin service contracts based on crew geo-coordinates and specific technician skill tags.",
        icon: "route",
      },
    ],
  },
  {
    id: "accounting-sync",
    title: "Accounting Sync",
    subtitle: "Invoices, deposits & reconciliation",
    icon: "receipt",
    flow: ["Jobber", "Data transformation", "Xero / QuickBooks"],
    examples: [
      {
        title: "Accounting & Xero/QBO Sync",
        description:
          "Multi-tier invoice sync with tax-code mapping, customer deposit reconciliation, and class tracking.",
        mobileDescription:
          "Deep multi-tier invoice sync with automated tax code mapping, customer deposit reconciliation, and class tracking.",
        icon: "receipt",
      },
    ],
  },
  {
    id: "lead-follow-up",
    title: "Lead Follow-up",
    subtitle: "Attribution, qualification & communication",
    icon: "target",
    flow: ["Lead", "Qualification", "Communication"],
    examples: [
      {
        title: "Referral & Lead-Source Attribution",
        description:
          "Capture source tags, UTM parameters, and lead forms directly into Jobber client custom fields.",
        mobileDescription:
          "Automatically capture source tags, UTM parameters, and lead forms directly into Jobber client custom fields.",
        icon: "target",
      },
    ],
  },
  {
    id: "custom-apis",
    title: "Custom APIs",
    subtitle: "Dedicated connections between systems",
    icon: "code",
    flow: ["Source system", "API", "Destination system"],
    examples: [
      {
        title: "Field Photo & Documentation Pipelines",
        description:
          "Streamline before-and-after photo transfers from tools like CompanyCam to client notes and insurance claims.",
        mobileDescription:
          "Streamline before/after photo transfers from tools like CompanyCam directly to client notes and insurance claims.",
        icon: "photo",
      },
    ],
  },
  {
    id: "internal-workflows",
    title: "Internal Workflows",
    subtitle: "Documents, approvals & notifications",
    icon: "workflow",
    flow: ["Approval", "Document", "Notification"],
    examples: [
      {
        title: "Google Workspace & Drive Sync",
        description:
          "Structure customer folders, job-site documentation, estimates, and executed contracts in organized cloud drives.",
        mobileDescription:
          "Instantly structure customer folders, job site documentation, estimates, and executed contracts into organized cloud drives.",
        icon: "folder",
      },
    ],
  },
];
