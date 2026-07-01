export const CATEGORY_TYPE_TO_PATH: Record<string, string> = {
  hebergement: "hebergements",
  restaurant: "restaurants",
  activite: "activites",
  shopping: "shopping",
};

export const CATEGORY_PATH_TO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TYPE_TO_PATH).map(([type, path]) => [path, type])
);

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  hebergement: ["hotel", "riad", "maison-hote", "villa", "appartement", "camping"],
  restaurant: [
    "marocain",
    "poisson",
    "gastronomique",
    "italien",
    "francais",
    "cafe",
    "bar",
    "brunch",
    "petit-dejeuner",
    "patisserie",
  ],
  activite: [
    "surf",
    "kitesurf",
    "quad",
    "cheval",
    "chameau",
    "spa",
    "hammam",
    "excursion",
    "golf",
    "yoga",
  ],
  shopping: ["souks", "bois-thuya", "bijoux", "decoration", "mode", "art"],
};
