"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { safeCurrentUser as currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "@/db";
import {
  establishments,
  articles,
  contentPages,
  events,
  professionals,
  subscriptions,
  invoices,
  serviceOrders,
  realEstateListings,
  reviews,
  favorites,
  modules,
  siteSettings,
  adCampaigns,
  newsletterSubscribers,
  emergencyContacts,
  labelEvaluations,
  labelBadges,
  labelApplications,
} from "@/db/schema";
import { can, type Role } from "@/lib/roles";
import { LABEL_CRITERIA } from "@/lib/label-criteria";
import { slugify } from "@/lib/slug";
import { readLocalized, ALL_LOCALES } from "@/lib/localized-form";
import { translateFields } from "@/lib/translate";

async function requireRole(section: Parameters<typeof can>[1]) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as Role | undefined;
  if (!can(role, section)) {
    throw new Error("Forbidden");
  }
  return { user, role };
}

// ---- Establishments ----
export async function toggleEstablishmentFeatured(id: number, featured: boolean) {
  await requireRole("establishments");
  const db = getDb();
  await db.update(establishments).set({ featured }).where(eq(establishments.id, id));
  revalidatePath("/", "layout");
}

export async function setEstablishmentStatus(id: number, status: "active" | "disabled") {
  await requireRole("establishments");
  const db = getDb();
  await db.update(establishments).set({ status }).where(eq(establishments.id, id));
  revalidatePath("/", "layout");
}

export async function setEstablishmentBadge(id: number, badge: string | null) {
  await requireRole("establishments");
  const db = getDb();
  await db.update(establishments).set({ badge }).where(eq(establishments.id, id));
  revalidatePath("/", "layout");
}

export async function deleteEstablishment(id: number) {
  await requireRole("establishments");
  const db = getDb();
  await db.delete(establishments).where(eq(establishments.id, id));
  revalidatePath("/", "layout");
}


export async function upsertEstablishment(formData: FormData) {
  await requireRole("establishments");
  const db = getDb();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");
  const translations = await translateFields({ name, description }, targetLocales, "fr");
  const localizedName = { fr: name, ...translations.name };
  const localizedDescription = { fr: description, ...translations.description };

  const data = {
    categoryId: Number(formData.get("categoryId")),
    subcategory: String(formData.get("subcategory") ?? ""),
    slug: id ? String(formData.get("slug")) : slugify(name),
    name: localizedName,
    description: localizedDescription,
    address: String(formData.get("address") ?? ""),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    website: String(formData.get("website") ?? ""),
    priceLevel: String(formData.get("priceLevel") ?? ""),
    parking: formData.get("parking") === "on",
    wifi: formData.get("wifi") === "on",
    accessibility: formData.get("accessibility") === "on",
    pool: formData.get("pool") === "on",
    airConditioning: formData.get("airConditioning") === "on",
    petsAllowed: formData.get("petsAllowed") === "on",
    featured: formData.get("featured") === "on",
    badge: String(formData.get("badge") ?? "") || null,
    professionalId: formData.get("professionalId") ? Number(formData.get("professionalId")) : null,
    status: (formData.get("status") as "active" | "disabled") ?? "active",
    images: String(formData.get("images") ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  };

  if (id) {
    await db.update(establishments).set(data).where(eq(establishments.id, id));
  } else {
    await db.insert(establishments).values(data);
  }

  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/establissements`);
}

// ---- Articles ----
export async function deleteArticle(id: number) {
  await requireRole("articles");
  const db = getDb();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/", "layout");
}

export async function upsertArticle(formData: FormData) {
  await requireRole("articles");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const titleFr = String(formData.get("title_fr") ?? "");

  const data = {
    category: String(formData.get("category") ?? "guides"),
    slug: id ? String(formData.get("slug")) : slugify(titleFr),
    title: readLocalized(formData, "title"),
    excerpt: readLocalized(formData, "excerpt"),
    body: readLocalized(formData, "body"),
    coverImage: String(formData.get("coverImage") ?? "") || null,
  };

  if (id) {
    await db.update(articles).set(data).where(eq(articles.id, id));
  } else {
    await db.insert(articles).values(data);
  }
  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/articles`);
}

// ---- Content pages ----
export async function deleteContentPage(id: number) {
  await requireRole("articles");
  const db = getDb();
  await db.delete(contentPages).where(eq(contentPages.id, id));
  revalidatePath("/", "layout");
}

export async function upsertContentPage(formData: FormData) {
  await requireRole("articles");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");

  let pricesInput: { name: string; price: number | null; category: string | null }[] = [];
  try {
    pricesInput = JSON.parse(String(formData.get("prices") ?? "[]"));
  } catch {
    pricesInput = [];
  }

  const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");
  const translationFields: Record<string, string> = { title, body };
  pricesInput.forEach((p, i) => {
    translationFields[`price_${i}`] = p.name;
    if (p.category) translationFields[`priceCategory_${i}`] = p.category;
  });
  const translations = await translateFields(translationFields, targetLocales, "fr");

  const prices = pricesInput.map((p, i) => ({
    name: { fr: p.name, ...translations[`price_${i}`] },
    price: p.price,
    category: p.category ? { fr: p.category, ...translations[`priceCategory_${i}`] } : null,
  }));

  let mapPoints: { label: string; lat: number; lng: number }[] = [];
  try {
    mapPoints = JSON.parse(String(formData.get("mapPoints") ?? "[]"));
  } catch {
    mapPoints = [];
  }

  const data = {
    section: String(formData.get("section") ?? "decouvrir"),
    slug: id ? String(formData.get("slug")) : slugify(title),
    title: { fr: title, ...translations.title },
    body: { fr: body, ...translations.body },
    coverImage: String(formData.get("coverImage") ?? "") || null,
    prices,
    mapEnabled: formData.get("mapEnabled") === "on",
    mapPoints,
  };

  if (id) {
    await db.update(contentPages).set(data).where(eq(contentPages.id, id));
  } else {
    await db.insert(contentPages).values(data);
  }
  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/pages`);
}

// ---- Events ----
export async function deleteEvent(id: number) {
  await requireRole("events");
  const db = getDb();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/", "layout");
}

export async function upsertEvent(formData: FormData) {
  await requireRole("events");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const titleFr = String(formData.get("title_fr") ?? "");

  const data = {
    category: String(formData.get("category") ?? "festivals"),
    slug: id ? String(formData.get("slug")) : slugify(titleFr),
    title: readLocalized(formData, "title"),
    description: readLocalized(formData, "description"),
    startDate: new Date(String(formData.get("startDate"))),
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
    location: String(formData.get("location") ?? ""),
    image: String(formData.get("image") ?? "") || null,
  };

  if (id) {
    await db.update(events).set(data).where(eq(events.id, id));
  } else {
    await db.insert(events).values(data);
  }
  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/evenements`);
}

// ---- Professionals ----
export async function setProfessionalStatus(
  id: number,
  status: "pending" | "validated" | "refused" | "suspended"
) {
  await requireRole("professionals");
  const db = getDb();
  await db.update(professionals).set({ status }).where(eq(professionals.id, id));

  if (status === "validated") {
    const rows = await db.select().from(professionals).where(eq(professionals.id, id));
    const pro = rows[0];
    if (pro) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(pro.clerkUserId, {
        publicMetadata: { role: "professional" satisfies Role },
      });
    }
  }

  // The establishment fiche submitted alongside the application goes live
  // only once the professional is validated; it's hidden again if refused
  // or suspended.
  if (status === "validated") {
    await db.update(establishments).set({ status: "active" }).where(eq(establishments.professionalId, id));
  } else if (status === "refused" || status === "suspended") {
    await db.update(establishments).set({ status: "disabled" }).where(eq(establishments.professionalId, id));
  }

  revalidatePath("/", "layout");
}

export async function deleteProfessional(id: number) {
  await requireRole("professionals");
  const db = getDb();

  const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
  if (!professional) return;

  const linkedEstablishments = await db.select().from(establishments).where(eq(establishments.professionalId, id));
  for (const est of linkedEstablishments) {
    await db.delete(reviews).where(eq(reviews.establishmentId, est.id));
    await db.delete(favorites).where(eq(favorites.establishmentId, est.id));
    await db.delete(labelEvaluations).where(eq(labelEvaluations.establishmentId, est.id));
    await db.delete(labelBadges).where(eq(labelBadges.establishmentId, est.id));
  }

  await db.delete(labelApplications).where(eq(labelApplications.professionalId, id));
  await db.delete(establishments).where(eq(establishments.professionalId, id));
  await db.delete(subscriptions).where(eq(subscriptions.professionalId, id));
  await db.delete(invoices).where(eq(invoices.professionalId, id));
  await db.delete(serviceOrders).where(eq(serviceOrders.professionalId, id));
  await db.delete(professionals).where(eq(professionals.id, id));

  try {
    const client = await clerkClient();
    await client.users.deleteUser(professional.clerkUserId);
  } catch {
    // DB cleanup already succeeded; the Clerk account may already be gone.
  }

  revalidatePath("/", "layout");
}

export async function changeSubscriptionPlan(
  professionalId: number,
  planKey: string,
  billingCycle: "monthly" | "yearly"
) {
  await requireRole("subscriptions");
  const db = getDb();
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.professionalId, professionalId));

  if (existing[0]) {
    await db
      .update(subscriptions)
      .set({ planKey, billingCycle })
      .where(eq(subscriptions.id, existing[0].id));
  } else {
    await db.insert(subscriptions).values({
      professionalId,
      planKey,
      billingCycle,
      status: "manual",
      paymentMethod: "manual",
    });
  }
  revalidatePath("/", "layout");
}

// ---- Real estate ----
export async function setRealEstateStatus(id: number, status: "pending" | "validated" | "refused") {
  await requireRole("realEstate");
  const db = getDb();
  await db.update(realEstateListings).set({ status }).where(eq(realEstateListings.id, id));
  revalidatePath("/", "layout");
}

export async function toggleRealEstateFeatured(id: number, featured: boolean) {
  await requireRole("realEstate");
  const db = getDb();
  await db.update(realEstateListings).set({ featured }).where(eq(realEstateListings.id, id));
  revalidatePath("/", "layout");
}

export async function deleteRealEstate(id: number) {
  await requireRole("realEstate");
  const db = getDb();
  await db.delete(realEstateListings).where(eq(realEstateListings.id, id));
  revalidatePath("/", "layout");
}

export async function upsertRealEstate(formData: FormData) {
  await requireRole("realEstate");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const titleFr = String(formData.get("title_fr") ?? "");

  const data = {
    listingType: String(formData.get("listingType") ?? "vente"),
    category: String(formData.get("category") ?? "villa"),
    slug: id ? String(formData.get("slug")) : slugify(titleFr),
    title: readLocalized(formData, "title"),
    description: readLocalized(formData, "description"),
    priceMad: formData.get("priceMad") ? Number(formData.get("priceMad")) : null,
    surfaceM2: formData.get("surfaceM2") ? Number(formData.get("surfaceM2")) : null,
    rooms: formData.get("rooms") ? Number(formData.get("rooms")) : null,
    address: String(formData.get("address") ?? ""),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    status: (formData.get("status") as "pending" | "validated" | "refused") ?? "pending",
    featured: formData.get("featured") === "on",
    images: String(formData.get("images") ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  };

  if (id) {
    await db.update(realEstateListings).set(data).where(eq(realEstateListings.id, id));
  } else {
    await db.insert(realEstateListings).values(data);
  }
  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/immobilier`);
}

// ---- Reviews ----
export async function setReviewStatus(id: number, status: "pending" | "approved" | "rejected") {
  await requireRole("reviews");
  const db = getDb();
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  revalidatePath("/", "layout");
}

export async function deleteReview(id: number) {
  await requireRole("reviews");
  const db = getDb();
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/", "layout");
}

// ---- Ad campaigns ----
export async function createAdCampaign(formData: FormData) {
  await requireRole("ads");
  const db = getDb();
  await db.insert(adCampaigns).values({
    title: String(formData.get("title") ?? ""),
    placement: String(formData.get("placement") ?? "home"),
    campaignType: String(formData.get("campaignType") ?? "banniere"),
    startDate: new Date(String(formData.get("startDate"))),
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
    status: "active",
  });
  revalidatePath("/", "layout");
}

export async function setAdCampaignStatus(id: number, status: "active" | "paused" | "ended") {
  await requireRole("ads");
  const db = getDb();
  await db.update(adCampaigns).set({ status }).where(eq(adCampaigns.id, id));
  revalidatePath("/", "layout");
}

export async function deleteAdCampaign(id: number) {
  await requireRole("ads");
  const db = getDb();
  await db.delete(adCampaigns).where(eq(adCampaigns.id, id));
  revalidatePath("/", "layout");
}

// ---- Newsletter ----
export async function deleteNewsletterSubscriber(id: number) {
  await requireRole("newsletter");
  const db = getDb();
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  revalidatePath("/", "layout");
}

// ---- Modules ----
export async function setModuleStatus(key: string, status: "active" | "inactive" | "maintenance") {
  await requireRole("modules");
  const db = getDb();
  await db.update(modules).set({ status }).where(eq(modules.key, key));
  revalidatePath("/", "layout");
}

// ---- Site settings ----
export async function updateSiteSettings(data: {
  siteName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
}) {
  await requireRole("settings");
  const db = getDb();
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing[0]) {
    await db.update(siteSettings).set(data).where(eq(siteSettings.id, existing[0].id));
  } else {
    await db.insert(siteSettings).values(data);
  }
  revalidatePath("/", "layout");
}

// ---- Users (Clerk-backed) ----
export async function setUserRole(clerkUserId: string, role: Role) {
  await requireRole("users");
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, { publicMetadata: { role } });
  revalidatePath("/", "layout");
}

export async function setUserBanned(clerkUserId: string, banned: boolean) {
  await requireRole("users");
  const client = await clerkClient();
  if (banned) {
    await client.users.banUser(clerkUserId);
  } else {
    await client.users.unbanUser(clerkUserId);
  }
  revalidatePath("/", "layout");
}

export async function deleteUser(clerkUserId: string) {
  await requireRole("users");
  const client = await clerkClient();
  await client.users.deleteUser(clerkUserId);
  revalidatePath("/", "layout");
}

// ---- Emergency contacts (Assistance) ----
export async function upsertEmergencyContact(formData: FormData) {
  await requireRole("assistance");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const name = String(formData.get("name") ?? "");
  const hours = String(formData.get("hours") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const targetLocales = ALL_LOCALES.filter((l) => l !== "fr");
  const translations = await translateFields({ name, hours, notes }, targetLocales, "fr");

  const data = {
    category: String(formData.get("category") ?? "urgences"),
    name: { fr: name, ...translations.name },
    phone: String(formData.get("phone") ?? "") || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    hours: hours ? { fr: hours, ...translations.hours } : null,
    notes: notes ? { fr: notes, ...translations.notes } : null,
    website: String(formData.get("website") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    featured: formData.get("featured") === "on",
  };

  if (id) {
    await db.update(emergencyContacts).set(data).where(eq(emergencyContacts.id, id));
  } else {
    await db.insert(emergencyContacts).values(data);
  }
  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/assistance`);
}

export async function deleteEmergencyContact(id: number) {
  await requireRole("assistance");
  const db = getDb();
  await db.delete(emergencyContacts).where(eq(emergencyContacts.id, id));
  revalidatePath("/", "layout");
}

export async function toggleEmergencyContactFeatured(id: number, featured: boolean) {
  await requireRole("assistance");
  const db = getDb();
  await db.update(emergencyContacts).set({ featured }).where(eq(emergencyContacts.id, id));
  revalidatePath("/", "layout");
}

// ---- Label "Essaouira Inside Approved" ----
export async function createLabelEvaluation(formData: FormData) {
  const { user } = await requireRole("label");
  const db = getDb();

  const establishmentId = Number(formData.get("establishmentId"));
  const scores = Object.fromEntries(
    LABEL_CRITERIA.map(({ key }) => [key, Math.max(0, Math.min(10, Number(formData.get(key)) || 0))])
  ) as Record<(typeof LABEL_CRITERIA)[number]["key"], number>;
  const totalScore = Object.values(scores).reduce((sum, v) => sum + v, 0);

  await db.insert(labelEvaluations).values({
    establishmentId,
    evaluatorClerkUserId: user?.id ?? "unknown",
    evaluatorName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || undefined : undefined,
    ...scores,
    totalScore,
    comments: String(formData.get("comments") ?? "") || null,
  });

  await db.update(establishments).set({ labelScore: totalScore }).where(eq(establishments.id, establishmentId));

  revalidatePath("/", "layout");
  redirect(`/${formData.get("locale")}/admin/establissements/${establishmentId}`);
}

export async function setLabelStatus(
  establishmentId: number,
  status: "approved" | "refused" | "suspended" | "revoked"
) {
  await requireRole("label");
  const db = getDb();

  await db
    .update(establishments)
    .set({
      labelStatus: status === "refused" ? "none" : status,
      labelAwardedAt: status === "approved" ? new Date() : undefined,
    })
    .where(eq(establishments.id, establishmentId));

  const lastEvaluation = await db
    .select()
    .from(labelEvaluations)
    .where(eq(labelEvaluations.establishmentId, establishmentId))
    .orderBy(desc(labelEvaluations.createdAt))
    .limit(1);
  if (lastEvaluation[0]) {
    await db.update(labelEvaluations).set({ decision: status }).where(eq(labelEvaluations.id, lastEvaluation[0].id));
  }

  // Mirror the decision onto the open application for this establishment, if any.
  if (status === "approved" || status === "refused") {
    const openApplications = await db
      .select()
      .from(labelApplications)
      .where(eq(labelApplications.establishmentId, establishmentId))
      .orderBy(desc(labelApplications.createdAt))
      .limit(1);
    if (openApplications[0] && !["approved", "refused"].includes(openApplications[0].status)) {
      await db
        .update(labelApplications)
        .set({ status })
        .where(eq(labelApplications.id, openApplications[0].id));
    }
  }

  // The label is awarded per calendar year — maintain the annual badge history.
  const year = new Date().getFullYear();
  const existingBadge = await db
    .select()
    .from(labelBadges)
    .where(and(eq(labelBadges.establishmentId, establishmentId), eq(labelBadges.year, year)));

  if (status === "approved") {
    if (existingBadge[0]) {
      await db.update(labelBadges).set({ status: "active" }).where(eq(labelBadges.id, existingBadge[0].id));
    } else {
      await db.insert(labelBadges).values({
        establishmentId,
        year,
        status: "active",
        evaluationId: lastEvaluation[0]?.id,
        certificateNumber: `EIA-${year}-${String(establishmentId).padStart(4, "0")}`,
      });
    }
  } else if ((status === "suspended" || status === "revoked") && existingBadge[0]) {
    await db.update(labelBadges).set({ status: "revoked" }).where(eq(labelBadges.id, existingBadge[0].id));
  }

  revalidatePath("/", "layout");
}

export async function setLabelApplicationStatus(
  id: number,
  status: "info_requested" | "visit_scheduled" | "on_hold" | "refused"
) {
  await requireRole("label");
  const db = getDb();
  await db.update(labelApplications).set({ status }).where(eq(labelApplications.id, id));
  revalidatePath("/", "layout");
}
