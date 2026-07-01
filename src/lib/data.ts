import { getDb } from "@/db";
import {
  categories,
  establishments,
  articles,
  contentPages,
  events,
} from "@/db/schema";
import { desc, eq, and, asc } from "drizzle-orm";

export async function getCategories() {
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.order));
}

export async function getCategoryByType(type: string) {
  const db = getDb();
  const rows = await db.select().from(categories).where(eq(categories.type, type));
  return rows[0] ?? null;
}

export async function getEstablishments(opts: {
  type?: string;
  subcategory?: string;
  featured?: boolean;
  limit?: number;
} = {}) {
  const db = getDb();
  const conditions = [];

  if (opts.type) {
    const cat = await getCategoryByType(opts.type);
    if (!cat) return [];
    conditions.push(eq(establishments.categoryId, cat.id));
  }
  if (opts.subcategory) {
    conditions.push(eq(establishments.subcategory, opts.subcategory));
  }
  if (opts.featured) {
    conditions.push(eq(establishments.featured, true));
  }

  const query = db
    .select()
    .from(establishments)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(establishments.featured), desc(establishments.createdAt));

  if (opts.limit) return query.limit(opts.limit);
  return query;
}

export async function getEstablishmentBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(establishments).where(eq(establishments.slug, slug));
  return rows[0] ?? null;
}

export async function getSimilarEstablishments(categoryId: number, excludeSlug: string, limit = 3) {
  const db = getDb();
  const rows = await db
    .select()
    .from(establishments)
    .where(eq(establishments.categoryId, categoryId))
    .limit(limit + 1);
  return rows.filter((r) => r.slug !== excludeSlug).slice(0, limit);
}

export async function getAllEstablishments() {
  const db = getDb();
  return db.select().from(establishments).orderBy(desc(establishments.createdAt));
}

export async function getArticles(opts: { category?: string; limit?: number } = {}) {
  const db = getDb();
  const query = db
    .select()
    .from(articles)
    .where(opts.category ? eq(articles.category, opts.category) : undefined)
    .orderBy(desc(articles.publishedAt));
  if (opts.limit) return query.limit(opts.limit);
  return query;
}

export async function getArticleBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.slug, slug));
  return rows[0] ?? null;
}

export async function getContentPages(section: string) {
  const db = getDb();
  return db
    .select()
    .from(contentPages)
    .where(eq(contentPages.section, section))
    .orderBy(asc(contentPages.order));
}

export async function getContentPageBySlug(section: string, slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(contentPages)
    .where(and(eq(contentPages.section, section), eq(contentPages.slug, slug)));
  return rows[0] ?? null;
}

export async function getEvents(opts: { category?: string; limit?: number } = {}) {
  const db = getDb();
  const query = db
    .select()
    .from(events)
    .where(opts.category ? eq(events.category, opts.category) : undefined)
    .orderBy(asc(events.startDate));
  if (opts.limit) return query.limit(opts.limit);
  return query;
}

export async function getEventBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(events).where(eq(events.slug, slug));
  return rows[0] ?? null;
}
