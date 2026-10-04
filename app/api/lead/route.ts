import { NextRequest, NextResponse } from "next/server";
import { computeRevenue } from "@/app/lib/revenue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  consent: boolean;
  answers: Record<string, unknown>;
};

/**
 * Build a payload that GoHighLevel (and most CRMs) will map automatically.
 * Top-level fields use the field names GHL's contact mapper recognizes.
 */
function buildGhlPayload(lead: LeadPayload) {
  const trimmed = lead.name.trim();
  const firstSpace = trimmed.indexOf(" ");
  const firstName = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const lastName = firstSpace === -1 ? "" : trimmed.slice(firstSpace + 1);
  const answers = lead.answers ?? {};
  const estimate = computeRevenue(answers);

  return {
    source: "conciergite-form",
    receivedAt: new Date().toISOString(),

    // GHL-recognized contact fields (top-level)
    firstName,
    lastName,
    name: trimmed,
    phone: lead.phone,
    email: lead.email ?? "",
    tags: ["conciergite-form", `type-${answers.propertyType ?? "inconnu"}`],

    // Property
    region: answers.region ?? null,
    propertyType: answers.propertyType ?? null,
    guests: answers.guests ?? null,
    bedrooms: answers.bedrooms ?? null,
    bathrooms: answers.bathrooms ?? null,
    area: answers.area ?? null,
    platforms: Array.isArray(answers.platforms)
      ? (answers.platforms as string[]).join(", ")
      : null,
    nightlyRate: answers.nightlyRate ?? null,
    occupancy: answers.occupancy ?? null,
    management: answers.management ?? null,

    // Estimate
    currentYearly: estimate.current.yearly,
    potentialYearly: estimate.potential.yearly,
    potentialNetYearly: estimate.potentialNet.yearly,
    gainPercent: estimate.gainPercent,

    // Keep the raw bundle for debugging / future-proofing
    answers,
  };
}

export async function POST(req: NextRequest) {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.name || !payload.phone) {
    return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 });
  }
  if (!payload.consent) {
    return NextResponse.json({ error: "Consentement requis" }, { status: 400 });
  }

  const body = buildGhlPayload(payload);
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) {
    // No CRM configured yet — accept the lead but log it server-side.
    console.log("[lead] No CRM_WEBHOOK_URL set. Lead would be:", body);
    return NextResponse.json({ stored: true, forwarded: false });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CRM_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.CRM_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`CRM responded ${res.status}`);
    return NextResponse.json({ stored: true, forwarded: true });
  } catch (err) {
    console.error("[lead] CRM forward failed:", err);
    return NextResponse.json(
      { stored: true, forwarded: false, warning: "crm_unreachable" },
      { status: 202 },
    );
  }
}
