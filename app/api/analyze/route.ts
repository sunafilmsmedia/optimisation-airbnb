import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeRevenue, formatMoney, type RevenueEstimate } from "@/app/lib/revenue";
import type { AIReport } from "@/app/components/ResultScreen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyzePayload = {
  answers: Record<string, unknown>;
};

function fallbackReport(estimate: RevenueEstimate): AIReport {
  const gain = estimate.gainNetYearly;
  return {
    headline:
      gain > 0
        ? `Vous pourriez empocher ${formatMoney(gain)} de plus par année, sans gérer quoi que ce soit.`
        : "Votre propriété performe déjà bien — et pourrait le faire sans vous.",
    summary:
      "En combinant une tarification dynamique, une annonce optimisée et une présence sur plusieurs plateformes, vous rejoignez des voyageurs qui ne vous voient pas aujourd'hui.",
    marketInsight:
      "Une propriété affichée uniquement sur Airbnb est invisible pour une grande partie des voyageurs européens, qui réservent majoritairement sur Booking.com.",
  };
}

export async function POST(req: NextRequest) {
  let payload: AnalyzePayload;
  try {
    payload = (await req.json()) as AnalyzePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = payload.answers ?? {};
  const estimate = computeRevenue(answers);

  // If no API key, return the deterministic fallback report.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ estimate, report: fallbackReport(estimate), ai: false });
  }

  try {
    const client = new Anthropic({ apiKey });

    const system = `Tu es un expert québécois en location courte durée (Airbnb, Booking, VRBO) qui aide les propriétaires à maximiser leurs revenus. Tu écris en français du Québec, avec le vouvoiement, un ton chaleureux, confiant et concret, sans jargon. Tu ne modifies JAMAIS les chiffres fournis et tu n'en inventes pas d'autres. Tu retournes EXCLUSIVEMENT du JSON valide qui suit le schéma demandé, sans texte autour.`;

    const userPrompt = `Voici les réponses d'un propriétaire qui loue sa propriété en courte durée :

${JSON.stringify(answers, null, 2)}

Estimation calculée (en $ CA) :
- Revenus actuels : ${formatMoney(estimate.current.monthly)}/mois, ${formatMoney(estimate.current.yearly)}/an
- Revenus optimisés (bruts) : ${formatMoney(estimate.potential.monthly)}/mois, ${formatMoney(estimate.potential.yearly)}/an
- Net au propriétaire s'il délègue la gestion : ${formatMoney(estimate.potentialNet.monthly)}/mois, ${formatMoney(estimate.potentialNet.yearly)}/an
- Gain net annuel pour le propriétaire (après frais de gestion) : ${formatMoney(estimate.gainNetYearly)}
- Leviers identifiés : ${JSON.stringify(estimate.levers.map((l) => l.label))}

Rédige un rapport personnalisé avec EXACTEMENT cette structure JSON :
{
  "headline": "phrase d'accroche percutante d'une ligne, adaptée à la région et au type de propriété. Si tu cites un montant de gain, utilise UNIQUEMENT le gain net annuel fourni",
  "summary": "2-3 phrases qui expliquent d'où vient le potentiel",
  "marketInsight": "un fait pertinent sur la clientèle touristique de leur région (ex. provenance des voyageurs, plateformes utilisées, saisonnalité), sans chiffre précis inventé"
}

Retourne UNIQUEMENT le JSON.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");

    const report = JSON.parse(jsonMatch[0]) as AIReport;
    return NextResponse.json({ estimate, report, ai: true });
  } catch (err) {
    console.error("AI analysis failed, falling back:", err);
    return NextResponse.json({ estimate, report: fallbackReport(estimate), ai: false });
  }
}
