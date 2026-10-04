export type Answers = Record<string, unknown>;

/**
 * Commission charged by the management service, as a fraction of gross
 * revenue. The "net" figures on the result screen are computed after this fee.
 * TODO: confirmer le vrai pourcentage avec le client.
 */
export const MANAGEMENT_FEE = 0.2;

const DAYS_PER_MONTH = 30.4;
const MAX_OCCUPANCY = 0.85;

export type RevenueEstimate = {
  current: { nightly: number; occupancy: number; monthly: number; season: number; yearly: number };
  potential: { nightly: number; occupancy: number; monthly: number; season: number; yearly: number };
  // What the owner keeps after the management fee
  potentialNet: { monthly: number; season: number; yearly: number };
  gainNetYearly: number;
  gainPercent: number; // gross potential vs current, in %
  // Split of the yearly gross gain between the two levers
  breakdown: { fromRate: number; fromOccupancy: number };
  levers: {
    label: string;
    impact: "fort" | "moyen" | "faible";
    detail: string;
  }[];
};

function revenueFor(nightly: number, occupancy: number) {
  const monthly = Math.round(nightly * occupancy * DAYS_PER_MONTH);
  return { monthly, season: monthly * 3, yearly: monthly * 12 };
}

export function computeRevenue(answers: Answers): RevenueEstimate {
  const nightly = Number(answers.nightlyRate) || 0;
  const occupancy = Math.min(1, Math.max(0, (Number(answers.occupancy) || 0) / 100));
  const platforms = Array.isArray(answers.platforms) ? (answers.platforms as string[]) : [];
  const management = answers.management as string | undefined;
  const levers: RevenueEstimate["levers"] = [];

  // --- Prix par nuit : tarification dynamique + optimisation de l'annonce
  let rateUplift = 0.1;
  levers.push({
    label: "Tarification dynamique",
    impact: "fort",
    detail:
      "Ajuster le prix chaque jour selon la demande, les événements et les fins de semaine plutôt qu'un prix fixe.",
  });
  if (management !== "manager") {
    rateUplift += 0.05;
    levers.push({
      label: "Annonce optimisée",
      impact: "moyen",
      detail:
        "Photos professionnelles, titre et description pensés pour le référencement des plateformes.",
    });
  }

  // --- Occupation : diffusion multi-plateformes
  const otas = platforms.filter((p) => p !== "direct").length;
  let occUplift = 0;
  if (otas <= 1) {
    occUplift += 0.12;
    levers.push({
      label: "Diffusion multi-plateformes",
      impact: "fort",
      detail:
        "Vous êtes sur une seule plateforme : les touristes européens réservent surtout sur Booking.com, et plusieurs familles américaines sur VRBO. Vous passez à côté de ces réservations.",
    });
  } else if (otas === 2) {
    occUplift += 0.06;
    levers.push({
      label: "Diffusion élargie",
      impact: "moyen",
      detail:
        "Ajouter une ou deux plateformes de plus, avec un calendrier synchronisé, remplit les nuits creuses.",
    });
  } else {
    occUplift += 0.02;
  }
  if (management === "self" || management === "family") {
    occUplift += 0.05;
    levers.push({
      label: "Réponse rapide 7 jours sur 7",
      impact: "moyen",
      detail:
        "Les plateformes favorisent les hôtes qui répondent en quelques minutes, ce qui améliore votre visibilité.",
    });
  }

  const potentialNightly = Math.round(nightly * (1 + rateUplift));
  const potentialOcc = Math.max(occupancy, Math.min(MAX_OCCUPANCY, occupancy + occUplift));

  const current = { nightly, occupancy, ...revenueFor(nightly, occupancy) };
  const potential = {
    nightly: potentialNightly,
    occupancy: potentialOcc,
    ...revenueFor(potentialNightly, potentialOcc),
  };
  const net = (v: number) => Math.round(v * (1 - MANAGEMENT_FEE));
  const potentialNet = {
    monthly: net(potential.monthly),
    season: net(potential.season),
    yearly: net(potential.yearly),
  };

  // Rate gain measured at today's occupancy; the rest comes from extra nights.
  const fromRate = Math.round((potentialNightly - nightly) * occupancy * DAYS_PER_MONTH) * 12;

  return {
    current,
    potential,
    breakdown: {
      fromRate,
      fromOccupancy: Math.max(0, potential.yearly - current.yearly - fromRate),
    },
    potentialNet,
    gainNetYearly: potentialNet.yearly - current.yearly,
    gainPercent: current.yearly
      ? Math.round(((potential.yearly - current.yearly) / current.yearly) * 100)
      : 0,
    levers,
  };
}

export const formatMoney = (v: number) => `${Math.round(v).toLocaleString("fr-CA")} $`;
