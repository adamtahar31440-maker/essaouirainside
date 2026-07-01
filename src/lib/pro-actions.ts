"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { professionals, establishments, serviceOrders, labelApplications } from "@/db/schema";
import { getProfessionalByClerkId, getLabelApplicationByEstablishmentId } from "@/lib/admin-data";

const OPEN_APPLICATION_STATUSES = ["pending", "info_requested", "visit_scheduled", "on_hold"];

export async function applyAsProfessional(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const db = getDb();
  const existing = await getProfessionalByClerkId(user.id);
  if (existing) return;

  await db.insert(professionals).values({
    clerkUserId: user.id,
    companyName: String(formData.get("companyName") ?? ""),
    contactName: String(formData.get("contactName") ?? ""),
    activityType: String(formData.get("activityType") ?? "service"),
    phone: String(formData.get("phone") ?? ""),
    email: user.emailAddresses[0]?.emailAddress ?? String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
    status: "pending",
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

  const nameFr = String(formData.get("name_fr") ?? establishment.name.fr);

  await db
    .update(establishments)
    .set({
      name: {
        fr: nameFr,
        en: String(formData.get("name_en") ?? nameFr),
        ar: String(formData.get("name_ar") ?? nameFr),
      },
      description: {
        fr: String(formData.get("description_fr") ?? ""),
        en: String(formData.get("description_en") ?? ""),
        ar: String(formData.get("description_ar") ?? ""),
      },
      address: String(formData.get("address") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      website: String(formData.get("website") ?? ""),
      hours: {
        fr: String(formData.get("hours_fr") ?? ""),
        en: String(formData.get("hours_en") ?? ""),
        ar: String(formData.get("hours_ar") ?? ""),
      },
      images: String(formData.get("images") ?? "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    })
    .where(and(eq(establishments.id, id), eq(establishments.professionalId, professional.id)));

  revalidatePath("/", "layout");
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
