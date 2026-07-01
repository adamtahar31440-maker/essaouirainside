export const subcategoryLabels: Record<string, Record<string, string>> = {
  // hébergement
  hotel: { fr: "Hôtel", en: "Hotel", ar: "فندق" },
  riad: { fr: "Riad", en: "Riad", ar: "رياض" },
  "maison-hote": { fr: "Maison d'hôtes", en: "Guesthouse", ar: "دار ضيافة" },
  villa: { fr: "Villa", en: "Villa", ar: "فيلا" },
  appartement: { fr: "Appartement", en: "Apartment", ar: "شقة" },
  camping: { fr: "Camping", en: "Camping", ar: "تخييم" },
  // restaurant
  marocain: { fr: "Marocain", en: "Moroccan", ar: "مغربي" },
  poisson: { fr: "Poisson", en: "Seafood", ar: "أسماك" },
  gastronomique: { fr: "Gastronomique", en: "Fine dining", ar: "فاخر" },
  italien: { fr: "Italien", en: "Italian", ar: "إيطالي" },
  francais: { fr: "Français", en: "French", ar: "فرنسي" },
  cafe: { fr: "Café", en: "Café", ar: "مقهى" },
  bar: { fr: "Bar", en: "Bar", ar: "بار" },
  brunch: { fr: "Brunch", en: "Brunch", ar: "برانش" },
  "petit-dejeuner": { fr: "Petit-déjeuner", en: "Breakfast", ar: "فطور" },
  patisserie: { fr: "Pâtisserie", en: "Pastry", ar: "حلويات" },
  // activité
  surf: { fr: "Surf", en: "Surf", ar: "ركوب الأمواج" },
  kitesurf: { fr: "Kitesurf", en: "Kitesurf", ar: "كايت سيرف" },
  quad: { fr: "Quad", en: "Quad biking", ar: "دراجة رباعية" },
  cheval: { fr: "Cheval", en: "Horse riding", ar: "ركوب الخيل" },
  chameau: { fr: "Chameau", en: "Camel riding", ar: "ركوب الجمال" },
  spa: { fr: "Spa", en: "Spa", ar: "سبا" },
  hammam: { fr: "Hammam", en: "Hammam", ar: "حمام" },
  excursion: { fr: "Excursion", en: "Excursion", ar: "رحلة" },
  golf: { fr: "Golf", en: "Golf", ar: "غولف" },
  yoga: { fr: "Yoga", en: "Yoga", ar: "يوغا" },
  // shopping
  souks: { fr: "Souks", en: "Souks", ar: "أسواق" },
  "bois-thuya": { fr: "Bois de thuya", en: "Thuya wood", ar: "خشب العرعار" },
  bijoux: { fr: "Bijoux", en: "Jewellery", ar: "مجوهرات" },
  decoration: { fr: "Décoration", en: "Decoration", ar: "ديكور" },
  mode: { fr: "Mode", en: "Fashion", ar: "أزياء" },
  art: { fr: "Art", en: "Art", ar: "فن" },
};

export function subcategoryLabel(slug: string, locale: string) {
  return subcategoryLabels[slug]?.[locale] ?? slug;
}
