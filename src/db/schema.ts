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
  // Links out to the merchant's existing profiles on trusted review
  // platforms — shown alongside our own on-site reviews, not fetched
  // via API (no scraping/ToS issues, no extra cost).
  googleReviewsUrl: varchar("google_reviews_url", { length: 255 }),
  tripadvisorUrl: varchar("tripadvisor_url", { length: 255 }),
  hours: jsonb("hours").$type<Localized>(),
  priceLevel: varchar("price_level", { length: 8 }), // €, €€, €€€
  services: jsonb("services").$type<LocalizedList>(),
  // Merchant-editable product/service list — name is translated like other
  // content, price is optional (MAD, whole units) since not every listing
  // (e.g. a boutique with variable pricing) wants to publish fixed prices.
  products: jsonb("products").$type<{ name: Localized; price: number | null }[]>().default([]),
  parking: boolean("parking").default(false),
  wifi: boolean("wifi").default(false),
  accessibility: boolean("accessibility").default(false),
  ourReview: jsonb("our_review").$type<Localized>(),
  faq: jsonb("faq").$type<{ q: Localized; a: Localized }[]>(),
  images: jsonb("images").$type<string[]>().default([]),
  featured: boolean("featured").default(false),
  badge: varchar("badge", { length: 64 }),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active | disabled
  professionalId: integer("professional_id"),
  labelStatus: varchar("label_status", { length: 16 }).notNull().default("none"), // none | approved | suspended | revoked
  labelScore: integer("label_score"), // latest evaluation score, /100
  labelAwardedAt: timestamp("label_awarded_at"),
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

// ---- Accounts, subscriptions & marketplace (Phase 2/3) ----

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 64 }).notNull().unique(),
  companyName: varchar("company_name", { length: 160 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }),
  activityType: varchar("activity_type", { length: 32 }).notNull(), // restaurant|hotel|riad|activite|immobilier|boutique|artisan|service
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending|validated|refused|suspended
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 32 }).notNull().unique(), // starter|premium|business|enterprise
  name: jsonb("name").$type<Localized>().notNull(),
  priceMonthlyMad: integer("price_monthly_mad").notNull(),
  priceYearlyMad: integer("price_yearly_mad").notNull(), // discounted annual price (2 months free)
  maxPhotos: integer("max_photos"),
  features: jsonb("features").$type<LocalizedList>(),
  order: integer("order").default(0),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  planKey: varchar("plan_key", { length: 32 }).notNull(),
  billingCycle: varchar("billing_cycle", { length: 16 }).notNull().default("monthly"), // monthly|yearly
  status: varchar("status", { length: 16 }).notNull().default("active"), // active|trialing|past_due|canceled|manual
  paymentMethod: varchar("payment_method", { length: 24 }), // stripe|paypal|bank_transfer|manual
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 128 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id"),
  professionalId: integer("professional_id").notNull(),
  amountMad: integer("amount_mad").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("pending"), // paid|pending|failed|refunded
  paymentMethod: varchar("payment_method", { length: 24 }),
  issuedAt: timestamp("issued_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const realEstateListings = pgTable("real_estate_listings", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id"),
  listingType: varchar("listing_type", { length: 16 }).notNull(), // vente|location
  category: varchar("category", { length: 32 }).notNull(), // villa|riad|appartement|terrain
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: jsonb("title").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>().notNull(),
  priceMad: integer("price_mad"),
  surfaceM2: integer("surface_m2"),
  rooms: integer("rooms"),
  address: varchar("address", { length: 255 }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  images: jsonb("images").$type<string[]>().default([]),
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending|validated|refused
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id"),
  title: varchar("title", { length: 160 }).notNull(),
  placement: varchar("placement", { length: 32 }).notNull(), // home|search|category|newsletter
  campaignType: varchar("campaign_type", { length: 32 }).notNull(), // banniere|article_sponsorise|mise_en_avant|badge
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active|paused|ended
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").notNull(),
  clerkUserId: varchar("clerk_user_id", { length: 64 }),
  authorName: varchar("author_name", { length: 160 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending|approved|rejected
  ownerReply: text("owner_reply"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 64 }).notNull(),
  establishmentId: integer("establishment_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceOrders = pgTable("service_orders", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  serviceKey: varchar("service_key", { length: 32 }).notNull(), // shooting_photo|video|article_seo|social_media|ad_campaign|newsletter_feature|content_creation|marketing
  status: varchar("status", { length: 16 }).notNull().default("requested"), // requested|in_progress|done|cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 32 }).notNull().unique(),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active|inactive|maintenance
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 160 }).notNull().default("Essaouira Inside"),
  logoUrl: varchar("logo_url", { length: 255 }),
  primaryColor: varchar("primary_color", { length: 16 }).default("#17495e"),
  secondaryColor: varchar("secondary_color", { length: 16 }).default("#bf6a45"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
  contactEmail: varchar("contact_email", { length: 255 }),
});

// ---- Assistance & Urgences ----
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 24 }).notNull(), // urgences|sante|securite|ambassade|depannage|argent|transport|telephone|info_utile
  name: jsonb("name").$type<Localized>().notNull(),
  phone: varchar("phone", { length: 64 }),
  whatsapp: varchar("whatsapp", { length: 64 }),
  address: varchar("address", { length: 255 }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  hours: jsonb("hours").$type<Localized>(),
  notes: jsonb("notes").$type<Localized>(),
  website: varchar("website", { length: 255 }),
  country: varchar("country", { length: 100 }), // ambassades only
  featured: boolean("featured").default(false), // shown in the SOS quick panel
  order: integer("order").default(0),
});

// ---- "Essaouira Inside Approved" label ----
export const labelEvaluations = pgTable("label_evaluations", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").notNull(),
  evaluatorClerkUserId: varchar("evaluator_clerk_user_id", { length: 64 }).notNull(),
  evaluatorName: varchar("evaluator_name", { length: 160 }),
  accueil: integer("accueil").notNull(),
  qualite: integer("qualite").notNull(),
  proprete: integer("proprete").notNull(),
  experience: integer("experience").notNull(),
  rapportQualitePrix: integer("rapport_qualite_prix").notNull(),
  authenticite: integer("authenticite").notNull(),
  reputation: integer("reputation").notNull(),
  presentation: integer("presentation").notNull(),
  services: integer("services").notNull(),
  impressionGenerale: integer("impression_generale").notNull(),
  totalScore: integer("total_score").notNull(), // sum of the 10 criteria, /100
  comments: text("comments"),
  decision: varchar("decision", { length: 16 }), // approved | refused | suspended | revoked
  createdAt: timestamp("created_at").defaultNow(),
});

// One row per calendar year the label was held — powers the public multi-year
// badge history (e.g. "Approved 2026 ✓, Approved 2027 ✓").
export const labelBadges = pgTable("label_badges", {
  id: serial("id").primaryKey(),
  establishmentId: integer("establishment_id").notNull(),
  year: integer("year").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active | revoked
  evaluationId: integer("evaluation_id"),
  certificateNumber: varchar("certificate_number", { length: 32 }),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Professional-submitted candidacy for the label — intake queue ahead of the
// editorial evaluation (label_evaluations).
export const labelApplications = pgTable("label_applications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  establishmentId: integer("establishment_id").notNull(),
  contactName: varchar("contact_name", { length: 160 }),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 255 }),
  website: varchar("website", { length: 255 }),
  socialLinks: varchar("social_links", { length: 255 }),
  activityDescription: text("activity_description"),
  images: jsonb("images").$type<string[]>().default([]),
  motivation: text("motivation"),
  charterAccepted: boolean("charter_accepted").notNull().default(false),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  // pending | info_requested | visit_scheduled | on_hold | approved | refused
  createdAt: timestamp("created_at").defaultNow(),
});
