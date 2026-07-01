"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { professionals, establishments, categories, serviceOrders, labelApplications } from "@/db/schema";
import { getProfessionalByClerkId, getLabelApplicationByEstablishmentId } from "@/lib/admin-data";
import { readLocalized } from "@/lib/localized-form";
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
  const nameFr = String(formData.get("name_fr") ?? "");
  const contactName = String(formData.get("contactName") ?? "");

  const [professional] = await db
    .insert(professionals)
    .values({
      clerkUserId: user.id,
      companyName: nameFr,
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
    slug: `${slugify(nameFr)}-${professional.id}`,
    name: readLocalized(formData, "name"),
    description: readLocalized(formData, "description"),
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

  await db
    .update(establishments)
    .set({
      name: readLocalized(formData, "name"),
      description: readLocalized(formData, "description"),
      address: String(formData.get("address") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      website: String(formData.get("website") ?? ""),
      hours: readLocalized(formData, "hours"),
      priceLevel: String(formData.get("priceLevel") ?? establishment.priceLevel ?? "€€"),
      images: String(formData.get("images") ?? "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
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
