/**
 * Conciergite's service process, shown on the result page.
 * `lever` ties each service to where the extra revenue comes from.
 */
export type Service = {
  title: string;
  description: string;
  lever: "prix" | "reservations" | "avis";
};

export const services: Service[] = [
  {
    title: "Photographie professionnelle",
    description:
      "Des photos qui font cliquer : plus de visites sur votre annonce et un prix par nuit plus élevé.",
    lever: "prix",
  },
  {
    title: "Optimisation de l'annonce",
    description:
      "Titre, description, prix ajustés chaque jour et diffusion sur Airbnb, Booking et VRBO pour remplir les nuits creuses.",
    lever: "reservations",
  },
  {
    title: "Ménage haut de gamme",
    description:
      "Une propriété impeccable à chaque arrivée, la base des avis 5 étoiles.",
    lever: "avis",
  },
  {
    title: "Inspection à chaque check-in/out",
    description:
      "On vérifie tout avant et après chaque séjour : bris détectés et réglés tout de suite.",
    lever: "avis",
  },
  {
    title: "Réapprovisionnement des essentiels",
    description:
      "Papier, savon, café, literie : vos voyageurs ne manquent jamais de rien.",
    lever: "avis",
  },
  {
    title: "Assistance 24h/24 et 7j/7",
    description:
      "Réponses en quelques minutes, jour et nuit. Les plateformes le récompensent par plus de visibilité.",
    lever: "reservations",
  },
  {
    title: "Intervention rapide en cas de problème",
    description:
      "Une panne ou un imprévu ? On s'en occupe sur place, sans vous déranger.",
    lever: "avis",
  },
  {
    title: "Déneigement et entretien des extérieurs",
    description:
      "Accès dégagé et terrain soigné en toute saison, pour un accueil sans faille.",
    lever: "avis",
  },
];

export const LEVER_LABEL: Record<Service["lever"], string> = {
  prix: "+ prix / nuit",
  reservations: "+ réservations",
  avis: "+ avis 5★",
};
