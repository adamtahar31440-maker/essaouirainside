"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { professionals, establishments, categories, serviceOrders, labelApplications } from "@/db/schema";
import {
  getProfessionalByClerkId,
  getLabelApplicationByEstablishmentId,
  getSubscriptionByProfessionalId,
  getSubscriptionPlans,
} from "@/lib/admin-data";
import { ALL_LOCALES } from "@/lib/localized-form";
import { translateFields } from "@/lib/translate";
import { slugify } from "@/lib/slug";

const OPEN_APPLICATION_STATUSES = ["pending", "info_requested", "visit_scheduled", "on_hold"];

// The professional submits their full establishment fiche as part of the
// application itself, so the Super Admin reviews real content (not just a
// company name) before deciding to validate or refuse.
export async function applyAsProfessional(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const db = getDb();
  const existing = await getProfessionalByClerkId(user.id);
  if (existing) return;

  const categoryId = Number(formData.get("categoryId"));
  const [category] = await db.select().from(categories).where(eq(categories.id, categoryId));
  const contactName = String(formData.get("contactName") ?? "");

  const requestedLocale = String(formData.get("sourceLocale") ?? "fr");
  const sourceLocale = ALL_LOCALES.includes(requestedLocale) ? requestedLocale : "fr";
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const targetLocales = ALL_LOCALES.filter((l) => l !== sourceLocale);
  const translations = await translateFields({ name, description }, targetLocales, sourceLocale);

  const localizedName = { [sourceLocale]: name, ...translations.name };
  const localizedDescription = { [sourceLocale]: description, ...translations.description };

  const [professional] = await db
    .insert(professionals)
    .values({
      clerkUserId: user.id,
      companyName: name,
      contactName,
      activityType: category?.type ?? "service",
      phone: String(formData.get("phone") ?? ""),
      email: user.emailAddresses[0]?.emailAddress ?? String(formData.get("email") ?? ""),
      website: String(formData.get("website") ?? ""),
      status: "pending",
    })
    .returning();

  await db.insert(establishments).values({
    categoryId,
    subcategory: String(formData.get("subcategory") ?? ""),
    slug: `${slugify(localizedName.fr || name)}-${professional.id}`,
    name: localizedName,
    description: localizedDescription,
    address: String(formData.get("address") ?? ""),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    website: String(formData.get("website") ?? ""),
    priceLevel: String(formData.get("priceLevel") ?? "€€"),
    images: String(formData.get("images") ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    status: "pending",
    professionalId: professional.id,
  });

  revalidatePath("/", "layout");
}

export async function updateOwnEstablishment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const db = getDb();
  const professional = await getProfessionalByClerkId(user.id);
  if (!professional || professional.status !== "validated") throw new Error("Forbidden");

  const id = Number(formData.get("id"));
  const [establishment] = await db.select().from(establishments).where(eq(establishments.id, id));
  if (!establishment || establishment.professionalId !== professional.id) throw new Error("Forbidden");

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const hours = String(formData.get("hours") ?? "");

  let productsInput: { name: string; price: number | null }[] = [];
  try {
    productsInput = JSON.parse(String(formData.get("products") ?? "[]"));
  } catch {
    productsInput = [];
  }

  const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");
  const translationFields: Record<string, string> = { name, description, hours };
  productsInput.forEach((p, i) => {
    translationFields[`product_${i}`] = p.name;
  });
  const translations = await translateFields(translationFields, targetLocales, "fr");

  const products = productsInput.map((p, i) => ({
    name: { fr: p.name, ...translations[`product_${i}`] },
    price: p.price,
  }));

  const [subscription, plans] = await Promise.all([
    getSubscriptionByProfessionalId(professional.id),
    getSubscriptionPlans(),
  ]);
  const currentPlanKey = subscription?.status === "active" ? subscription.planKey : "starter";
  const maxPhotos = plans.find((p) => p.key === currentPlanKey)?.maxPhotos ?? null;

  let images = String(formData.get("images") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (typeof maxPhotos === "number") images = images.slice(0, maxPhotos);

  await db
    .update(establishments)
    .set({
      name: { fr: name, ...translations.name },
      description: { fr: description, ...translations.description },
      address: String(formData.get("address") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      website: String(formData.get("website") ?? ""),
      hours: { fr: hours, ...translations.hours },
      priceLevel: String(formData.get("priceLevel") ?? establishment.priceLevel ?? "€€"),
      images,
      products,
    })
    .where(and(eq(establishments.id, id), eq(establishments.professionalId, professional.id)));

  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/pro`);
}

export async function applyForLabel(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const db = getDb();
  const professional = await getProfessionalByClerkId(user.id);
  if (!professional || professional.status !== "validated") throw new Error("Forbidden");

  const establishmentId = Number(formData.get("establishmentId"));
  const [establishment] = await db.select().from(establishments).where(eq(establishments.id, establishmentId));
  if (!establishment || establishment.professionalId !== professional.id) throw new Error("Forbidden");

  const existing = await getLabelApplicationByEstablishmentId(establishmentId);
  if (existing && OPEN_APPLICATION_STATUSES.includes(existing.status)) return;

  if (formData.get("charterAccepted") !== "on") {
    throw new Error("La charte du label doit être acceptée.");
  }

  await db.insert(labelApplications).values({
    professionalId: professional.id,
    establishmentId,
    contactName: String(formData.get("contactName") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    website: String(formData.get("website") ?? "") || null,
    socialLinks: String(formData.get("socialLinks") ?? "") || null,
    activityDescription: String(formData.get("activityDescription") ?? "") || null,
    images: String(formData.get("images") ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    motivation: String(formData.get("motivation") ?? "") || null,
    charterAccepted: true,
    status: "pending",
  });

  revalidatePath("/", "layout");
}

export async function requestMarketplaceService(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const db = getDb();
  const professional = await getProfessionalByClerkId(user.id);
  if (!professional || professional.status !== "validated") throw new Error("Forbidden");

  await db.insert(serviceOrders).values({
    professionalId: professional.id,
    serviceKey: String(formData.get("serviceKey") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: "requested",
  });

  revalidatePath("/", "layout");
}
