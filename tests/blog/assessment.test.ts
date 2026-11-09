import assert from "node:assert/strict";
import { test } from "node:test";

import { createAssessmentPayload, getAssessmentValidationError, submitAssessment } from "../../lib/assessment-webhook.ts";

function completedForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ fullName: " Test User ", businessName: " Test Company ", businessEmail: " test@example.com ", phoneNumber: "+1 (555) 000-0000", budget: "$2,500 – $5,000", workflow: " Connect scheduling and invoicing. " })) form.set(key, value);
  return form;
}

test("compact contact form retains all assessment fields and the existing webhook contract", () => {
  assert.deepEqual(createAssessmentPayload(completedForm(), "https://automasoluct.com/contact", "test-verification-token"), {
    fullName: "Test User", businessName: "Test Company", businessEmail: "test@example.com", phoneNumber: "+1 (555) 000-0000",
    businessDescription: "Not provided on this form.", estimatedProjectBudget: "$2,500 – $5,000", systemsInvolved: [],
    jobberWorkflowRequest: "Connect scheduling and invoicing.", sourcePage: "https://automasoluct.com/contact", turnstileToken: "test-verification-token",
  });
});

test("shared Jobber form preserves its source, budget encoding and known system", () => {
  const payload = createAssessmentPayload(completedForm(), "https://automasoluct.com/jobber-automation?utm_source=blog#assessment-form", "test-verification-token");
  assert.equal(payload.sourcePage, "https://automasoluct.com/jobber-automation?utm_source=blog#assessment-form");
  assert.equal(payload.estimatedProjectBudget, "2500-5000");
  assert.deepEqual(payload.systemsInvolved, ["Jobber"]);
  assert.equal(payload.jobberWorkflowRequest, "Connect scheduling and invoicing.");
});

test("assessment source preserves full blog and preview URLs without changing the form payload", () => {
  for (const sourcePage of [
    "https://automasoluct.com/blog/jobber-quote-follow-up-automation",
    "http://localhost:3000/admin/blog/test-post/preview?revision=3#free-assessment",
  ]) {
    const payload = createAssessmentPayload(completedForm(), sourcePage, "test-verification-token");
    assert.equal(payload.sourcePage, sourcePage);
    assert.equal(payload.estimatedProjectBudget, "$2,500 – $5,000");
    assert.deepEqual(payload.systemsInvolved, []);
  }
});

test("only the six remaining form fields and Turnstile token are required", () => {
  const payload = createAssessmentPayload(completedForm(), "https://automasoluct.com/contact", "test-verification-token");
  payload.businessDescription = "";
  payload.systemsInvolved = [];
  assert.equal(getAssessmentValidationError(payload), null);
  for (const field of ["fullName", "businessName", "businessEmail", "phoneNumber", "estimatedProjectBudget", "jobberWorkflowRequest", "turnstileToken"] as const) {
    assert.ok(getAssessmentValidationError({ ...payload, [field]: "   " }), field);
  }
});

test("assessment submits JSON with the verification token and reports webhook failure without sending real leads", async t => {
  const payload = createAssessmentPayload(completedForm(), "https://automasoluct.com/contact", "test-verification-token");
  const calls: { url: unknown; options: RequestInit | undefined }[] = [];
  let response = new Response(null, { status: 200 });
  t.mock.method(globalThis, "fetch", async (url: unknown, options: RequestInit | undefined) => {
    calls.push({ url, options });
    return response;
  });
  await submitAssessment(payload);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://webhook.automasoluct.com.br/webhook/automasoluct-free-assessment");
  assert.equal(calls[0].options?.method, "POST");
  assert.deepEqual(calls[0].options?.headers, { "Content-Type": "application/json" });
  assert.deepEqual(JSON.parse(String(calls[0].options?.body)), payload);
  response = new Response(null, { status: 503 });
  await assert.rejects(submitAssessment(payload), /503/);
});
