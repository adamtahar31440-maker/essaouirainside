import { getDb } from "../src/db";
import { contentPages, siteSections } from "../src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { translateFields } from "../src/lib/translate";
import { slugify } from "../src/lib/slug";
import { ALL_LOCALES } from "../src/lib/localized-form";

const SECTION_SLUG = "decouvrir";
const SECTION_NAME_FR = "Découvrir";

// Add one entry per page the owner sends. Slugs are derived from the title,
// so re-running is safe — already-inserted pages (same section+slug) are skipped.
const PAGES_TO_ADD: { title: string; body: string }[] = [
  {
    title: "Présentation d'Essaouira",
    body: `Bienvenue à Essaouira

Située sur la côte atlantique du Maroc, Essaouira est une destination qui séduit par son authenticité, son patrimoine historique et son atmosphère paisible. Anciennement connue sous le nom de Mogador, la ville est aujourd'hui l'une des destinations les plus appréciées du pays, aussi bien par les voyageurs marocains que par les visiteurs venus du monde entier.

Classée au patrimoine mondial de l'UNESCO, Essaouira est réputée pour sa médina fortifiée, son port de pêche animé, ses longues plages balayées par les alizés et son riche héritage culturel. Contrairement aux grandes villes touristiques, elle offre un rythme de vie plus calme où il fait bon flâner dans les ruelles, admirer l'architecture traditionnelle, déguster des spécialités locales ou simplement profiter de l'air marin.

La ville est également une destination incontournable pour les amateurs de sports nautiques. Grâce à ses vents réguliers tout au long de l'année, Essaouira est considérée comme l'un des meilleurs spots de surf, de kitesurf et de wingfoil au Maroc. Son ambiance bohème, son artisanat reconnu et ses nombreux festivals contribuent également à son charme unique.

Que vous voyagiez pour un week-end, des vacances en famille, un séjour sportif ou une escapade romantique, Essaouira propose une multitude d'expériences adaptées à tous les profils de voyageurs. Entre découvertes culturelles, gastronomie, plages, activités de plein air et rencontres avec les habitants, la ville offre un parfait équilibre entre détente et exploration.

Sur Essaouira Inside, vous trouverez tous les conseils, bonnes adresses et informations pratiques pour organiser votre séjour, découvrir les lieux incontournables et vivre une expérience authentique au cœur de l'une des plus belles villes du Maroc.`,
  },
];

const db = getDb();

// translateFields caps output at 8192 tokens per call. A short field (a name,
// a title) translates fine into all locales at once, but a long article body
// translated into 11 languages in one call can overrun that budget and come
// back truncated/empty. Batch long text across a few locales at a time instead.
const LOCALE_BATCH_SIZE = 3;

async function translateLongField(
  field: string,
  text: string,
  locales: string[],
  sourceLocale: string
): Promise<Record<string, string>> {
  const merged: Record<string, string> = {};
  for (let i = 0; i < locales.length; i += LOCALE_BATCH_SIZE) {
    const batch = locales.slice(i, i + LOCALE_BATCH_SIZE);
    let result = await translateFields({ [field]: text }, batch, sourceLocale);
    let translated = result[field] ?? {};
    const missing = batch.filter((l) => !translated[l]);
    if (missing.length > 0) {
      // Retry missing locales one at a time before giving up on them.
      for (const locale of missing) {
        const retry = await translateFields({ [field]: text }, [locale], sourceLocale);
        Object.assign(translated, retry[field] ?? {});
      }
    }
    Object.assign(merged, translated);
  }
  return merged;
}

async function ensureSection() {
  const existing = await db.select().from(siteSections).where(eq(siteSections.slug, SECTION_SLUG));
  if (existing[0]) return existing[0];

  const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");
  const translations = await translateFields({ name: SECTION_NAME_FR }, targetLocales, "fr");
  const rows = await db.select().from(siteSections);
  const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.order ?? 0)) + 1 : 0;

  const [inserted] = await db
    .insert(siteSections)
    .values({ slug: SECTION_SLUG, name: { fr: SECTION_NAME_FR, ...translations.name }, order: nextOrder })
    .returning();
  console.log(`Created site section "${SECTION_SLUG}"`);
  return inserted;
}

async function main() {
  await ensureSection();

  for (const page of PAGES_TO_ADD) {
    const slug = slugify(page.title);
    const existing = await db
      .select()
      .from(contentPages)
      .where(and(eq(contentPages.section, SECTION_SLUG), eq(contentPages.slug, slug)));

    const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");

    if (existing[0]) {
      const row = existing[0];
      const missingTitleLocales = targetLocales.filter((l) => !row.title[l]);
      const missingBodyLocales = targetLocales.filter((l) => !row.body[l]);
      if (missingTitleLocales.length === 0 && missingBodyLocales.length === 0) {
        console.log(`Skipping "${page.title}" (already fully translated)`);
        continue;
      }
      console.log(`Backfilling missing translations for "${page.title}"...`);
      const [titleFix, bodyFix] = await Promise.all([
        missingTitleLocales.length > 0
          ? translateLongField("title", page.title, missingTitleLocales, "fr")
          : Promise.resolve({}),
        missingBodyLocales.length > 0
          ? translateLongField("body", page.body, missingBodyLocales, "fr")
          : Promise.resolve({}),
      ]);
      await db
        .update(contentPages)
        .set({
          title: { ...row.title, ...titleFix },
          body: { ...row.body, ...bodyFix },
        })
        .where(eq(contentPages.id, row.id));
      console.log(`Backfilled "${page.title}"`);
      continue;
    }
    const [titleTranslations, bodyTranslations] = await Promise.all([
      translateLongField("title", page.title, targetLocales, "fr"),
      translateLongField("body", page.body, targetLocales, "fr"),
    ]);

    const orderRows = await db
      .select({ order: contentPages.order })
      .from(contentPages)
      .where(eq(contentPages.section, SECTION_SLUG))
      .orderBy(desc(contentPages.order))
      .limit(1);
    const nextOrder = (orderRows[0]?.order ?? -1) + 1;

    await db.insert(contentPages).values({
      section: SECTION_SLUG,
      slug,
      title: { fr: page.title, ...titleTranslations },
      body: { fr: page.body, ...bodyTranslations },
      order: nextOrder,
    });
    console.log(`Added "${page.title}" (/${SECTION_SLUG}/${slug})`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
