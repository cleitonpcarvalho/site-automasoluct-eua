export type AssessmentPayload = {
  fullName: string;
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  businessDescription: string;
  estimatedProjectBudget: string;
  systemsInvolved: string[];
  jobberWorkflowRequest: string;
  sourcePage: string;
  turnstileToken: string;
};

const ASSESSMENT_WEBHOOK_URL =
  "https://webhook.automasoluct.com.br/webhook/automasoluct-free-assessment";

const jobberBudgetValues: Record<string, string> = {
  "$1,000 – $2,500": "1000-2500",
  "$2,500 – $5,000": "2500-5000",
  "$5,000 – $10,000": "5000-10000",
  "$10,000+": "10000+",
};

export function createAssessmentPayload(formData: FormData, sourcePage: AssessmentPayload["sourcePage"], turnstileToken: string): AssessmentPayload {
  const budget = String(formData.get("budget") ?? "");
  const isJobberPage = new URL(sourcePage).pathname.replace(/\/$/, "") === "/jobber-automation";
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    businessName: String(formData.get("businessName") ?? "").trim(),
    businessEmail: String(formData.get("businessEmail") ?? "").trim(),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    businessDescription: "Not provided on this form.",
    estimatedProjectBudget: isJobberPage ? (jobberBudgetValues[budget] ?? budget) : budget,
    systemsInvolved: isJobberPage ? ["Jobber"] : [],
    jobberWorkflowRequest: String(formData.get("workflow") ?? "").trim(),
    sourcePage,
    turnstileToken,
  };
}

export function getAssessmentValidationError(payload: AssessmentPayload): string | null {
  const required = [
    ["fullName", "Enter your full name."],
    ["businessName", "Enter your business name."],
    ["businessEmail", "Enter your business email."],
    ["phoneNumber", "Enter your phone number."],
    ["estimatedProjectBudget", "Select an estimated project budget."],
    ["jobberWorkflowRequest", "Describe what you want to automate, integrate, or improve."],
    ["turnstileToken", "Complete the security verification before sending your request."],
  ] as const;
  for (const [field, message] of required) if (!payload[field].trim()) return message;
  return null;
}

export async function submitAssessment(
  payload: AssessmentPayload,
): Promise<void> {
  const response = await fetch(ASSESSMENT_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Assessment webhook returned ${response.status}.`);
  }
}
