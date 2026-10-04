export type QuestionType =
  | "single"
  | "multi"
  | "number"
  | "currency"
  | "percent"
  | "text";

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  required?: boolean;
  // Conditional: only show this question if the predicate returns true
  showIf?: (answers: Record<string, unknown>) => boolean;
};

export const questions: Question[] = [
  {
    id: "region",
    type: "single",
    title: "Où se situe votre propriété ?",
    subtitle: "La région influence fortement la demande touristique.",
    required: true,
    options: [
      { value: "montreal", label: "Montréal" },
      { value: "quebec", label: "Québec" },
      { value: "laurentides", label: "Laurentides / Tremblant" },
      { value: "cantons", label: "Estrie / Cantons-de-l'Est" },
      { value: "charlevoix", label: "Charlevoix" },
      { value: "lanaudiere", label: "Lanaudière / Mauricie" },
      { value: "outaouais", label: "Gatineau / Outaouais" },
      { value: "gaspesie", label: "Gaspésie / Bas-Saint-Laurent" },
      { value: "autre", label: "Autre région" },
    ],
  },
  {
    id: "propertyType",
    type: "single",
    title: "Quel type de propriété louez-vous ?",
    required: true,
    options: [
      { value: "appartement", label: "Appartement / Condo" },
      { value: "maison", label: "Maison" },
      { value: "chalet", label: "Chalet" },
      { value: "villa", label: "Villa" },
    ],
  },
  {
    id: "guests",
    type: "number",
    title: "Combien de voyageurs maximum pouvez-vous accueillir ?",
    placeholder: "Ex. 6",
    suffix: "voyageurs",
    min: 1,
    max: 20,
    step: 1,
    required: true,
  },
  {
    id: "bedrooms",
    type: "number",
    title: "Combien de chambres ?",
    placeholder: "Ex. 3",
    suffix: "chambres",
    min: 0,
    max: 10,
    step: 1,
    required: true,
  },
  {
    id: "bathrooms",
    type: "number",
    title: "Combien de salles de bain ?",
    placeholder: "Ex. 2",
    suffix: "salles de bain",
    min: 1,
    max: 8,
    step: 1,
    required: true,
  },
  {
    id: "area",
    type: "number",
    title: "Quelle est la superficie habitable ?",
    subtitle: "Une estimation suffit.",
    placeholder: "Ex. 1200",
    suffix: "pi²",
    min: 200,
    max: 6000,
    step: 50,
    required: true,
  },
  {
    id: "platforms",
    type: "multi",
    title: "Sur quelles plateformes votre propriété est-elle affichée ?",
    subtitle:
      "Plusieurs voyageurs (surtout européens) réservent uniquement sur Booking ou VRBO. Cochez tout ce qui s'applique.",
    required: true,
    options: [
      { value: "airbnb", label: "Airbnb" },
      { value: "booking", label: "Booking.com" },
      { value: "vrbo", label: "VRBO" },
      { value: "expedia", label: "Expedia" },
      { value: "direct", label: "Mon propre site web" },
    ],
  },
  {
    id: "nightlyRate",
    type: "currency",
    title: "Quel est votre prix moyen par nuit ?",
    subtitle: "Votre moyenne sur l'année, avant les frais de ménage.",
    placeholder: "225",
    min: 0,
    step: 5,
    required: true,
  },
  {
    id: "occupancy",
    type: "percent",
    title: "Quel est votre taux d'occupation mensuel moyen ?",
    subtitle: "Ex. 18 nuits réservées sur 30 = 60 %. Une estimation suffit.",
    min: 0,
    max: 100,
    step: 5,
    required: true,
  },
  {
    id: "management",
    type: "single",
    title: "Qui gère votre Airbnb présentement ?",
    required: true,
    options: [
      { value: "self", label: "Moi-même" },
      { value: "family", label: "Un proche / co-hôte bénévole" },
      { value: "manager", label: "Un gestionnaire professionnel" },
    ],
  },
];
