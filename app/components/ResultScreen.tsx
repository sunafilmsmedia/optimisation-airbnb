"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  formatMoney,
  MANAGEMENT_FEE,
  type RevenueEstimate,
} from "@/app/lib/revenue";
import { trackFbEvent } from "@/app/lib/fbq";
import { services, LEVER_LABEL } from "@/app/lib/services";

export type AIReport = {
  headline: string;
  summary: string;
  marketInsight: string;
};

type Props = {
  estimate: RevenueEstimate;
  report: AIReport;
  answers: Record<string, unknown>;
};

type Period = "monthly" | "season" | "yearly";

const PERIODS: { value: Period; label: string; suffix: string }[] = [
  { value: "monthly", label: "Par mois", suffix: "/ mois" },
  { value: "season", label: "Par saison", suffix: "/ saison" },
  { value: "yearly", label: "Par année", suffix: "/ an" },
];

type LeadDraft = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const inputClass =
  "w-full px-4 py-3 text-base md:text-lg text-[#0B1F4D] bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-[#003DA5] focus:ring-4 focus:ring-blue-100";

function RevenueComparison({ estimate }: { estimate: RevenueEstimate }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const suffix = PERIODS.find((p) => p.value === period)!.suffix;
  const current = estimate.current[period];
  const gross = estimate.potential[period];
  const net = estimate.potentialNet[period];
  const max = Math.max(current, gross, 1);
  const netGain = net - current;

  const rows = [
    {
      label: "Aujourd'hui",
      value: current,
      detail: `${formatMoney(estimate.current.nightly)} / nuit · ${Math.round(estimate.current.occupancy * 100)} % d'occupation`,
      bar: "bg-slate-300",
    },
    {
      label: "Revenus optimisés",
      value: gross,
      detail: `${formatMoney(estimate.potential.nightly)} / nuit · ${Math.round(estimate.potential.occupancy * 100)} % d'occupation`,
      bar: "bg-gradient-to-r from-[#003DA5] to-[#3B82F6]",
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0B1F4D] to-[#003DA5] p-5 md:p-7 text-white overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
      <div className="relative">
        {/* Period toggle */}
        <div className="inline-flex rounded-full bg-white/10 p-1 mb-5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-white text-[#003DA5]"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {rows.map((r, i) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-blue-200">
                  {r.label}
                </span>
                <span className="font-display text-2xl md:text-3xl font-semibold whitespace-nowrap">
                  {formatMoney(r.value)}{" "}
                  <span className="text-sm text-blue-200 font-sans font-normal">
                    {suffix}
                  </span>
                </span>
              </div>
              <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={period + r.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.value / max) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }}
                  className={`h-full rounded-full ${r.bar}`}
                />
              </div>
              <p className="text-[11px] md:text-xs text-blue-200 mt-1">
                {r.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Net to owner when delegating */}
        <div className="mt-6 rounded-xl bg-white text-[#0B1F4D] p-4 md:p-5">
          <span className="text-[11px] uppercase tracking-wider text-[#003DA5] font-semibold">
            Dans vos poches si vous déléguez la gestion
          </span>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="font-display text-4xl md:text-5xl font-semibold">
              {formatMoney(net)}
            </span>
            <span className="text-slate-500">{suffix}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1.5">
            {netGain > 0 ? (
              <>
                Soit{" "}
                <strong className="text-emerald-600">
                  +{formatMoney(netGain)}
                </strong>{" "}
                de plus qu&apos;aujourd&apos;hui, après nos frais de gestion
                (calculés à {Math.round(MANAGEMENT_FEE * 100)} %, le maximum), et
                sans lever le petit doigt.
              </>
            ) : (
              <>
                Des revenus nets comparables à aujourd&apos;hui, après nos frais
                de gestion (calculés à {Math.round(MANAGEMENT_FEE * 100)} %, le
                maximum), sans aucune gestion de votre part.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GainAndProcess({ estimate }: { estimate: RevenueEstimate }) {
  const gross = estimate.potential.yearly - estimate.current.yearly;
  const parts = [
    {
      label: "Prix par nuit optimisé",
      value: estimate.breakdown.fromRate,
      detail: `${formatMoney(estimate.current.nightly)} → ${formatMoney(estimate.potential.nightly)} / nuit`,
    },
    {
      label: "Plus de nuits réservées",
      value: estimate.breakdown.fromOccupancy,
      detail: `${Math.round(estimate.current.occupancy * 100)} % → ${Math.round(estimate.potential.occupancy * 100)} % d'occupation`,
    },
  ].filter((p) => p.value > 0);

  return (
    <div className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9 mb-5">
      <span className="text-xs uppercase tracking-wider text-[#003DA5] font-semibold">
        Ce que Conciergîte peut vous rajouter
      </span>
      <div className="flex items-baseline gap-2 mt-1 flex-wrap">
        <span className="font-display text-4xl md:text-5xl font-semibold text-[#0B1F4D]">
          +{formatMoney(gross)}
        </span>
        <span className="text-slate-500">de revenus bruts / an</span>
      </div>

      {parts.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          {parts.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3"
            >
              <span className="text-xs uppercase tracking-wider text-slate-500">
                {p.label}
              </span>
              <p className="font-display text-2xl text-[#003DA5] mt-0.5">
                +{formatMoney(p.value)}
                <span className="text-sm text-slate-500 font-sans"> / an</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{p.detail}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-display text-xl md:text-2xl text-[#0B1F4D] mt-8 mb-1">
        Comment on y arrive : notre processus
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        On s&apos;occupe de tout. Vous recevez vos revenus.
      </p>
      <ol className="grid sm:grid-cols-2 gap-3">
        {services.map((svc, i) => (
          <motion.li
            key={svc.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex gap-3 p-4 rounded-xl border border-blue-100 bg-white/70"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-[#003DA5] text-white font-display flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <h4 className="font-semibold text-[#0B1F4D] text-sm md:text-base leading-snug">
                {svc.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {svc.description}
              </p>
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#003DA5]">
                {LEVER_LABEL[svc.lever]}
              </span>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export default function ResultScreen({ estimate, report, answers }: Props) {
  const [lead, setLead] = useState<LeadDraft>({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    Boolean(lead.name) &&
    Boolean(lead.email) &&
    Boolean(lead.phone) &&
    lead.consent &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, answers }),
      });
      if (!res.ok && res.status !== 202) throw new Error("Lead failed");
      trackFbEvent("Lead", {
        value: estimate.potential.yearly,
        currency: "CAD",
      });
      setSubmitted(true);
      // The full report renders above where the form was — bring them to it.
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Un problème est survenu. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = lead.name ? lead.name.trim().split(" ")[0] : "";

  const leadBlock = !submitted ? (
    <motion.form
      key="lead-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9"
    >
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Analyse terminée
        </span>
        {estimate.gainPercent > 0 ? (
          <>
            <p className="text-slate-500 text-sm md:text-base">
              Votre propriété pourrait générer jusqu&apos;à
            </p>
            <p className="font-display text-6xl md:text-7xl font-semibold text-[#003DA5] leading-none my-2">
              +{estimate.gainPercent}&nbsp;%
            </p>
            <p className="text-slate-500 text-sm md:text-base">
              de revenus en plus.
            </p>
          </>
        ) : (
          <p className="font-display text-2xl md:text-3xl text-[#0B1F4D] leading-tight">
            Votre propriété performe déjà bien.
          </p>
        )}
        <h2 className="font-display text-2xl md:text-3xl text-[#0B1F4D] leading-tight mt-5">
          Découvrez exactement comment on le fait
        </h2>
        <p className="text-slate-500 text-sm md:text-base mt-2 leading-relaxed">
          Entrez vos coordonnées pour voir vos revenus par mois et par saison,
          ce qui resterait dans vos poches, et notre processus complet.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
            Prénom et nom
          </span>
          <input
            type="text"
            value={lead.name}
            onBlur={() => setTouched({ ...touched, name: true })}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
            placeholder="Marie Tremblay"
            className={inputClass}
          />
          {touched.name && !lead.name && (
            <span className="text-xs text-rose-500 mt-1 block">
              Votre nom est requis
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
            Courriel
          </span>
          <input
            type="email"
            value={lead.email}
            onBlur={() => setTouched({ ...touched, email: true })}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
            placeholder="marie@exemple.com"
            className={inputClass}
          />
          {touched.email && !lead.email && (
            <span className="text-xs text-rose-500 mt-1 block">
              Votre courriel est requis
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
            Numéro de téléphone
          </span>
          <input
            type="tel"
            value={lead.phone}
            onBlur={() => setTouched({ ...touched, phone: true })}
            onChange={(e) => setLead({ ...lead, phone: e.target.value })}
            placeholder="(514) 555-0123"
            className={inputClass}
          />
          {touched.phone && !lead.phone && (
            <span className="text-xs text-rose-500 mt-1 block">
              Pour pouvoir vous rappeler
            </span>
          )}
        </label>
      </div>

      <label className="flex items-start gap-3 cursor-pointer mt-4">
        <input
          type="checkbox"
          checked={lead.consent}
          onChange={(e) => setLead({ ...lead, consent: e.target.checked })}
          className="mt-1 w-5 h-5 rounded border-blue-200 text-[#003DA5] focus:ring-blue-200"
        />
        <span className="text-xs md:text-sm text-slate-600 leading-relaxed">
          J&apos;accepte d&apos;être contacté·e au sujet de la gestion de ma
          propriété.
        </span>
      </label>

      {error && <p className="text-rose-500 text-sm mt-3">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#003DA5] text-white text-base font-medium shadow-lg shadow-blue-200 hover:bg-[#1E3A8A] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
      >
        {submitting ? "Envoi…" : "Voir mon analyse complète"}
      </button>
    </motion.form>
  ) : (
    <motion.div
      key="lead-success"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl md:rounded-3xl bg-emerald-50 border border-emerald-200 p-5 md:p-6 text-emerald-800 text-sm md:text-base mb-5"
    >
      ✓ Merci{firstName ? `, ${firstName}` : ""}&nbsp;! Voici votre analyse
      complète. L&apos;équipe Conciergîte vous contactera aussi dans les
      prochains jours ouvrables.
    </motion.div>
  );

  // Gate: only the % teaser + contact form until the lead is submitted.
  if (!submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        {leadBlock}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      {leadBlock}

      {/* 1. Headline + revenue comparison */}
      <div className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          {estimate.gainPercent > 0 && (
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              Jusqu&apos;à +{estimate.gainPercent} % de revenus bruts
            </span>
          )}
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
            Estimation préliminaire
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-4xl text-[#0B1F4D] leading-tight mb-2 md:mb-3">
          {report.headline}
        </h1>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-5 md:mb-7">
          {report.summary}
        </p>

        <RevenueComparison estimate={estimate} />
      </div>

      {/* 2. How much Conciergîte adds, and how */}
      <GainAndProcess estimate={estimate} />

      {/* 3. Levers + market insight */}
      <div className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9">
        {estimate.levers.length > 0 && (
          <div className="mb-7">
            <h3 className="font-display text-xl md:text-2xl text-[#0B1F4D] mb-3">
              Où se cache votre potentiel
            </h3>
            <div className="grid gap-2">
              {estimate.levers.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl border border-blue-50 bg-white/60"
                >
                  <span
                    className={`mt-0.5 shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                      l.impact === "fort"
                        ? "bg-[#003DA5] text-white"
                        : "bg-blue-100 text-[#003DA5]"
                    }`}
                  >
                    {l.impact}
                  </span>
                  <div>
                    <span className="font-medium text-[#0B1F4D] text-sm">
                      {l.label}
                    </span>
                    <p className="text-sm text-slate-600 mt-0.5">{l.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-5">
          <span className="text-xs uppercase tracking-wider text-[#003DA5] font-semibold">
            Le saviez-vous ?
          </span>
          <p className="text-[#0B1F4D] mt-1 leading-relaxed text-sm md:text-base">
            {report.marketInsight}
          </p>
        </div>

        <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
          Estimation à titre indicatif, basée sur vos réponses et des
          hypothèses d&apos;optimisation moyennes. Les résultats réels varient
          selon la propriété, la saison et le marché.
        </p>
      </div>
    </motion.div>
  );
}
