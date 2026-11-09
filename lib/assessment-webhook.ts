export type AssessmentPayload = {
  fullName: string;
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  businessDescription: string;
  estimatedProjectBudget: string;
  systemsInvolved: string[];
  jobberWorkflowRequest: string;
  sourcePage: "/contact" | "/jobber-automation";
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
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    businessName: String(formData.get("businessName") ?? "").trim(),
    businessEmail: String(formData.get("businessEmail") ?? "").trim(),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    businessDescription: "Not provided on this form.",
    estimatedProjectBudget: sourcePage === "/jobber-automation" ? (jobberBudgetValues[budget] ?? budget) : budget,
    systemsInvolved: sourcePage === "/jobber-automation" ? ["Jobber"] : [],
    jobberWorkflowRequest: String(formData.get("workflow") ?? "").trim(),
    sourcePage,
    turnstileToken,
  };
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
