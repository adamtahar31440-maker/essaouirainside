import { getDb } from "@/db";
import {
  establishments,
  categories,
  articles,
  contentPages,
  events,
  professionals,
  subscriptionPlans,
  subscriptions,
  invoices,
  realEstateListings,
  adCampaigns,
  reviews,
  favorites,
  serviceOrders,
  modules,
  siteSettings,
  newsletterSubscribers,
} from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";

// ---- Dashboard stats ----
export async function getDashboardStats() {
  const db = getDb();
  const [
    establishmentsCount,
    professionalsCount,
    articlesCount,
    reviewsPending,
    realEstateCount,
    subscriptionsActive,
    newsletterCount,
  ] = await Promise.all([
    db.select({ c: count() }).from(establishments),
    db.select({ c: count() }).from(professionals),
    db.select({ c: count() }).from(articles),
    db.select({ c: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ c: count() }).from(realEstateListings),
    db.select({ c: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ c: count() }).from(newsletterSubscribers),
  ]);

  return {
    establishments: establishmentsCount[0]?.c ?? 0,
    professionals: professionalsCount[0]?.c ?? 0,
    articles: articlesCount[0]?.c ?? 0,
    reviewsPending: reviewsPending[0]?.c ?? 0,
    realEstate: realEstateCount[0]?.c ?? 0,
    activeSubscriptions: subscriptionsActive[0]?.c ?? 0,
    newsletterSubscribers: newsletterCount[0]?.c ?? 0,
  };
}

// ---- Establishments (admin: all statuses) ----
export async function adminGetEstablishments() {
  const db = getDb();
  return db.select().from(establishments).orderBy(desc(establishments.createdAt));
}

export async function adminGetEstablishmentById(id: number) {
  const db = getDb();
  const rows = await db.select().from(establishments).where(eq(establishments.id, id));
  return rows[0] ?? null;
}

export { categories };

export async function getAllCategories() {
  const db = getDb();
  return db.select().from(categories);
}

// ---- Articles ----
export async function adminGetArticles() {
  const db = getDb();
  return db.select().from(articles).orderBy(desc(articles.publishedAt));
}

export async function adminGetArticleById(id: number) {
  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id));
  return rows[0] ?? null;
}

// ---- Content pages ----
export async function adminGetContentPages() {
  const db = getDb();
  return db.select().from(contentPages).orderBy(desc(contentPages.id));
}

export async function adminGetContentPageById(id: number) {
  const db = getDb();
  const rows = await db.select().from(contentPages).where(eq(contentPages.id, id));
  return rows[0] ?? null;
}

// ---- Events ----
export async function adminGetEvents() {
  const db = getDb();
  return db.select().from(events).orderBy(desc(events.startDate));
}

export async function adminGetEventById(id: number) {
  const db = getDb();
  const rows = await db.select().from(events).where(eq(events.id, id));
  return rows[0] ?? null;
}

// ---- Professionals ----
export async function adminGetProfessionals() {
  const db = getDb();
  return db.select().from(professionals).orderBy(desc(professionals.createdAt));
}

export async function adminGetProfessionalById(id: number) {
  const db = getDb();
  const rows = await db.select().from(professionals).where(eq(professionals.id, id));
  return rows[0] ?? null;
}

export async function getProfessionalByClerkId(clerkUserId: string) {
  const db = getDb();
  const rows = await db.select().from(professionals).where(eq(professionals.clerkUserId, clerkUserId));
  return rows[0] ?? null;
}

// ---- Subscriptions & plans ----
export async function getSubscriptionPlans() {
  const db = getDb();
  return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.order);
}

export async function adminGetSubscriptions() {
  const db = getDb();
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

export async function getSubscriptionByProfessionalId(professionalId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.professionalId, professionalId))
    .orderBy(desc(subscriptions.createdAt));
  return rows[0] ?? null;
}

// ---- Invoices ----
export async function adminGetInvoices() {
  const db = getDb();
  return db.select().from(invoices).orderBy(desc(invoices.issuedAt));
}

export async function getInvoicesByProfessionalId(professionalId: number) {
  const db = getDb();
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.professionalId, professionalId))
    .orderBy(desc(invoices.issuedAt));
}

// ---- Real estate ----
export async function adminGetRealEstateListings() {
  const db = getDb();
  return db.select().from(realEstateListings).orderBy(desc(realEstateListings.createdAt));
}

export async function adminGetRealEstateById(id: number) {
  const db = getDb();
  const rows = await db.select().from(realEstateListings).where(eq(realEstateListings.id, id));
  return rows[0] ?? null;
}

export async function getPublicRealEstateListings(listingType?: string) {
  const db = getDb();
  const rows = await db.select().from(realEstateListings).where(eq(realEstateListings.status, "validated"));
  return listingType ? rows.filter((r) => r.listingType === listingType) : rows;
}

export async function getRealEstateBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(realEstateListings).where(eq(realEstateListings.slug, slug));
  return rows[0] ?? null;
}

// ---- Ads ----
export async function adminGetAdCampaigns() {
  const db = getDb();
  return db.select().from(adCampaigns).orderBy(desc(adCampaigns.startDate));
}

// ---- Reviews ----
export async function adminGetReviews() {
  const db = getDb();
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function getApprovedReviewsForEstablishment(establishmentId: number) {
  const db = getDb();
  const rows = await db.select().from(reviews).where(eq(reviews.establishmentId, establishmentId));
  return rows.filter((r) => r.status === "approved");
}

// ---- Favorites ----
export async function getFavoritesByUser(clerkUserId: string) {
  const db = getDb();
  return db.select().from(favorites).where(eq(favorites.clerkUserId, clerkUserId));
}

// ---- Service orders (marketplace) ----
export async function adminGetServiceOrders() {
  const db = getDb();
  return db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
}

export async function getServiceOrdersByProfessionalId(professionalId: number) {
  const db = getDb();
  return db
    .select()
    .from(serviceOrders)
    .where(eq(serviceOrders.professionalId, professionalId))
    .orderBy(desc(serviceOrders.createdAt));
}

// ---- Modules ----
export async function getModules() {
  const db = getDb();
  return db.select().from(modules).orderBy(modules.key);
}

// ---- Newsletter ----
export async function adminGetNewsletterSubscribers() {
  const db = getDb();
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
}

// ---- Site settings ----
export async function getSiteSettings() {
  const db = getDb();
  const rows = await db.select().from(siteSettings).limit(1);
  return rows[0] ?? null;
}
