import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  jsonb,
  timestamp,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";

// Localized text is stored as JSONB: { fr: "...", en: "...", ar: "..." }
export type Localized = Record<string, string>;
export type LocalizedList = Record<string, string[]>;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 32 }).notNull(), // hebergement | restaurant | activite | shopping
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: jsonb("name").$type<Localized>().notNull(),
  icon: varchar("icon", { length: 64 }),
  order: integer("order").default(0),
});

export const establishments = pgTable("establishments", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  subcategory: varchar("subcategory", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: jsonb("name").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>().notNull(),
  address: varchar("address", { length: 255 }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  phone: varchar("phone", { length: 64 }),
  whatsapp: varchar("whatsapp", { length: 64 }),
  website: varchar("website", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  hours: jsonb("hours").$type<Localized>(),
  priceLevel: varchar("price_level", { length: 8 }), // €, €€, €€€
  services: jsonb("services").$type<LocalizedList>(),
  parking: boolean("parking").default(false),
  wifi: boolean("wifi").default(false),
  accessibility: boolean("accessibility").default(false),
  ourReview: jsonb("our_review").$type<Localized>(),
  faq: jsonb("faq").$type<{ q: Localized; a: Localized }[]>(),
  images: jsonb("images").$type<string[]>().default([]),
  featured: boolean("featured").default(false),
  badge: varchar("badge", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 32 }).notNull(), // guides | actualites | conseils | interviews | reportages
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: jsonb("title").$type<Localized>().notNull(),
  excerpt: jsonb("excerpt").$type<Localized>().notNull(),
  body: jsonb("body").$type<Localized>().notNull(),
  coverImage: varchar("cover_image", { length: 255 }),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 32 }).notNull(), // decouvrir | vivre
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: jsonb("title").$type<Localized>().notNull(),
  body: jsonb("body").$type<Localized>().notNull(),
  coverImage: varchar("cover_image", { length: 255 }),
  order: integer("order").default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 32 }).notNull(), // festivals | concerts | marches | expositions
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: jsonb("title").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  image: varchar("image", { length: 255 }),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  locale: varchar("locale", { length: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});
