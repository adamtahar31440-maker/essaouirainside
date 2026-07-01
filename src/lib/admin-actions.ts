"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  establishments,
  articles,
  contentPages,
  events,
  professionals,
  subscriptions,
  realEstateListings,
  reviews,
  modules,
  siteSettings,
  adCampaigns,
  newsletterSubscribers,
  emergencyContacts,
} from "@/db/schema";
import { can, type Role } from "@/lib/roles";

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

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ALL_LOCALES = ["fr", "en", "ar", "es", "de", "it", "pt", "ru", "zh", "ko", "tr", "he"];

function readLocalized(formData: FormData, field: string): Record<string, string> {
  const fr = String(formData.get(`${field}_fr`) ?? "");
  const result: Record<string, string> = { fr };
  for (const locale of ALL_LOCALES) {
    if (locale === "fr") continue;
    const value = formData.get(`${field}_${locale}`);
    result[locale] = value ? String(value) : fr;
  }
  return result;
}

export async function upsertEstablishment(formData: FormData) {
  await requireRole("establishments");
  const db = getDb();

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const nameFr = String(formData.get("name_fr") ?? "");

  const data = {
    categoryId: Number(formData.get("categoryId")),
    subcategory: String(formData.get("subcategory") ?? ""),
    slug: id ? String(formData.get("slug")) : slugify(nameFr),
    name: readLocalized(formData, "name"),
    description: readLocalized(formData, "description"),
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
    featured: formData.get("featured") === "on",
    badge: String(formData.get("badge") ?? "") || null,
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
  const titleFr = String(formData.get("title_fr") ?? "");

  const data = {
    section: String(formData.get("section") ?? "decouvrir"),
    slug: id ? String(formData.get("slug")) : slugify(titleFr),
    title: readLocalized(formData, "title"),
    body: readLocalized(formData, "body"),
    coverImage: String(formData.get("coverImage") ?? "") || null,
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

  revalidatePath("/", "layout");
}

export async function deleteProfessional(id: number) {
  await requireRole("professionals");
  const db = getDb();
  await db.delete(professionals).where(eq(professionals.id, id));
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

  const data = {
    category: String(formData.get("category") ?? "urgences"),
    name: readLocalized(formData, "name"),
    phone: String(formData.get("phone") ?? "") || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    hours: readLocalized(formData, "hours"),
    notes: readLocalized(formData, "notes"),
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
