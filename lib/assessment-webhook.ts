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
