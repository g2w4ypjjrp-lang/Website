import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  primaryKey,
  index,
  uniqueIndex,
  smallint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* ────────────────────────── Enums ────────────────────────── */

export const roleEnum = pgEnum("role", ["customer", "provider", "admin"]);
export const accountTypeEnum = pgEnum("account_type", ["individual", "agency", "company"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "deleted"]);
export const providerLevelEnum = pgEnum("provider_level", ["new", "rising", "pro", "top"]);
export const serviceStatusEnum = pgEnum("service_status", ["draft", "pending", "active", "rejected", "paused"]);
export const tierEnum = pgEnum("package_tier", ["basic", "standard", "premium"]);
export const orderStatusEnum = pgEnum("order_status", [
  "awaiting_payment",
  "payment_received",
  "created",
  "in_progress",
  "awaiting_delivery",
  "delivered",
  "revision_requested",
  "completed",
  "cancelled",
  "refund_in_progress",
  "disputed",
]);
export const projectStatusEnum = pgEnum("project_status", ["open", "in_progress", "closed", "cancelled"]);
export const offerStatusEnum = pgEnum("offer_status", ["pending", "accepted", "rejected", "withdrawn"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const payoutStatusEnum = pgEnum("payout_status", ["held", "available", "paid", "cancelled"]);
export const ticketTypeEnum = pgEnum("ticket_type", ["refund", "dispute", "complaint"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "approved", "rejected", "resolved"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "scheduled", "published"]);
export const messageKindEnum = pgEnum("message_kind", ["text", "delivery", "system"]);
export const tokenTypeEnum = pgEnum("token_type", ["verify_email", "reset_password"]);

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export type Attachment = { id: string; name: string; size: number; mime: string };
export type Faq = { q: string; a: string };
export type Extra = { id: string; title: string; priceKurus: number; days: number };

/* ────────────────────────── Kimlik ────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("customer"),
    accountType: accountTypeEnum("account_type").notNull().default("individual"),
    status: userStatusEnum("status").notNull().default("active"),
    avatarId: uuid("avatar_id"),
    phone: text("phone"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    // Yönetici iki adımlı doğrulama (TOTP). Sır, uygulamanın kendi anahtarıyla şifrelenmiş olarak saklanır.
    totpSecret: text("totp_secret"),
    totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
    billing: jsonb("billing").$type<{
      kind: "individual" | "corporate";
      fullName?: string;
      tckn?: string;
      company?: string;
      taxOffice?: string;
      taxNumber?: string;
      address?: string;
      city?: string;
    }>(),
    notificationPrefs: jsonb("notification_prefs")
      .$type<{ emailOrders: boolean; emailMessages: boolean; emailMarketing: boolean }>()
      .notNull()
      .default({ emailOrders: true, emailMessages: true, emailMarketing: false }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(sql`lower(${t.email})`), index("users_role_idx").on(t.role)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256(token)
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const authTokens = pgTable("auth_tokens", {
  id: text("id").primaryKey(), // sha256(token)
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: tokenTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/* ────────────────────────── Hizmet sağlayıcı ────────────────────────── */

export const providerProfiles = pgTable(
  "provider_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name").notNull(),
    headline: text("headline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    city: text("city"),
    skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
    languages: text("languages").array().notNull().default(sql`'{Türkçe}'::text[]`),
    website: text("website"),
    level: providerLevelEnum("level").notNull().default("new"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    avgResponseMinutes: integer("avg_response_minutes"),
    completedOrders: integer("completed_orders").notNull().default(0),
    cancelledOrders: integer("cancelled_orders").notNull().default(0),
    ratingAvg: integer("rating_avg").notNull().default(0), // x100 (ör. 487 = 4,87)
    ratingCount: integer("rating_count").notNull().default(0),
    profileViews: integer("profile_views").notNull().default(0),
    customCommissionBps: integer("custom_commission_bps"),
    premiumUntil: timestamp("premium_until", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    noindex: boolean("noindex").notNull().default(false),
    // iyzico alt üye işyeri anahtarı (split ödeme için)
    subMerchantKey: text("sub_merchant_key"),
    iban: text("iban"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("provider_city_idx").on(t.city)],
);

export const portfolioItems = pgTable("portfolio_items", {
  id: id(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageId: uuid("image_id"),
  link: text("link"),
  createdAt: createdAt(),
});

/* ────────────────────────── Katalog ────────────────────────── */

export const categories = pgTable(
  "categories",
  {
    id: id(),
    parentId: uuid("parent_id"),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull().default(""),
    intro: text("intro").notNull().default(""), // SEO içerik (markdown)
    icon: text("icon"),
    imageId: uuid("image_id"),
    canonicalUrl: text("canonical_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    commissionBps: integer("commission_bps"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    h1: text("h1"),
    noindex: boolean("noindex").notNull().default(false),
    filters: jsonb("filters").$type<{ key: string; label: string; options: string[] }[]>().notNull().default([]),
    faqs: jsonb("faqs").$type<Faq[]>().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("categories_parent_idx").on(t.parentId)],
);

export const services = pgTable(
  "services",
  {
    id: id(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    coverId: uuid("cover_id"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    faqs: jsonb("faqs").$type<Faq[]>().notNull().default([]),
    extras: jsonb("extras").$type<Extra[]>().notNull().default([]),
    requirements: text("requirements").notNull().default(""),
    status: serviceStatusEnum("status").notNull().default("draft"),
    rejectionReason: text("rejection_reason"),
    featuredUntil: timestamp("featured_until", { withTimezone: true }),
    sponsored: boolean("sponsored").notNull().default(false),
    startingPriceKurus: integer("starting_price_kurus").notNull().default(0),
    minDeliveryDays: integer("min_delivery_days").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    orderCount: integer("order_count").notNull().default(0),
    ratingAvg: integer("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    noindex: boolean("noindex").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("services_category_idx").on(t.categoryId),
    index("services_provider_idx").on(t.providerId),
    index("services_status_idx").on(t.status),
  ],
);

export const servicePackages = pgTable(
  "service_packages",
  {
    id: id(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    tier: tierEnum("tier").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceKurus: integer("price_kurus").notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    revisions: integer("revisions").notNull().default(1),
    features: text("features").array().notNull().default(sql`'{}'::text[]`),
  },
  (t) => [uniqueIndex("service_packages_tier_uq").on(t.serviceId, t.tier)],
);

/* ────────────────────────── Proje & Teklif ────────────────────────── */

export const projects = pgTable(
  "projects",
  {
    id: id(),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budgetMinKurus: integer("budget_min_kurus"),
    budgetMaxKurus: integer("budget_max_kurus"),
    deadline: timestamp("deadline", { withTimezone: true }),
    attachments: jsonb("attachments").$type<Attachment[]>().notNull().default([]),
    extraInfo: text("extra_info"),
    city: text("city"), // il kodu (slug), ör. "istanbul"
    status: projectStatusEnum("status").notNull().default("open"),
    offerCount: integer("offer_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("projects_status_idx").on(t.status), index("projects_buyer_idx").on(t.buyerId)],
);

export const offers = pgTable(
  "offers",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    priceKurus: integer("price_kurus").notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    message: text("message").notNull(),
    status: offerStatusEnum("status").notNull().default("pending"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("offers_project_provider_uq").on(t.projectId, t.providerId)],
);

/* ────────────────────────── Sipariş ────────────────────────── */

export const orders = pgTable(
  "orders",
  {
    id: id(),
    code: text("code").notNull().unique(),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    packageId: uuid("package_id").references(() => servicePackages.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    offerId: uuid("offer_id").references(() => offers.id, { onDelete: "set null" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    tier: tierEnum("tier"),
    selectedExtras: jsonb("selected_extras").$type<Extra[]>().notNull().default([]),
    subtotalKurus: integer("subtotal_kurus").notNull(),
    extrasKurus: integer("extras_kurus").notNull().default(0),
    totalKurus: integer("total_kurus").notNull(),
    commissionBps: integer("commission_bps").notNull(),
    commissionKurus: integer("commission_kurus").notNull(),
    providerEarningKurus: integer("provider_earning_kurus").notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    revisionsAllowed: integer("revisions_allowed").notNull().default(0),
    revisionsUsed: integer("revisions_used").notNull().default(0),
    requirements: text("requirements"),
    status: orderStatusEnum("status").notNull().default("awaiting_payment"),
    statusBeforeIssue: orderStatusEnum("status_before_issue"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_buyer_idx").on(t.buyerId),
    index("orders_provider_idx").on(t.providerId),
    index("orders_status_idx").on(t.status),
  ],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id"),
    type: text("type").notNull(),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status"),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

/* ────────────────────────── Ödeme ────────────────────────── */

export const payments = pgTable(
  "payments",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    provider: text("provider").notNull(),
    providerRef: text("provider_ref"),
    conversationId: text("conversation_id").notNull(),
    amountKurus: integer("amount_kurus").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    // Kart verisi ASLA saklanmaz. Yalnızca sağlayıcı yanıtının maskeli özeti.
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("payments_order_idx").on(t.orderId)],
);

export const payouts = pgTable(
  "payouts",
  {
    id: id(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id)
      .unique(),
    amountKurus: integer("amount_kurus").notNull(),
    status: payoutStatusEnum("status").notNull().default("held"),
    availableAt: timestamp("available_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    reference: text("reference"),
    createdAt: createdAt(),
  },
  (t) => [index("payouts_provider_idx").on(t.providerId)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    type: ticketTypeEnum("type").notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    orderId: uuid("order_id").references(() => orders.id),
    openedById: uuid("opened_by_id")
      .notNull()
      .references(() => users.id),
    targetType: text("target_type"), // user | service | message | order
    targetId: text("target_id"),
    reason: text("reason").notNull(),
    details: text("details").notNull().default(""),
    refundKurus: integer("refund_kurus"),
    resolution: text("resolution"),
    resolvedById: uuid("resolved_by_id"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("tickets_status_idx").on(t.status)],
);

/* ────────────────────────── Mesajlaşma ────────────────────────── */

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    userAId: uuid("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: uuid("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    lastMessagePreview: text("last_message_preview"),
    createdAt: createdAt(),
  },
  (t) => [
    index("conv_a_idx").on(t.userAId),
    index("conv_b_idx").on(t.userBId),
    uniqueIndex("conv_order_uq").on(t.orderId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
    kind: messageKindEnum("kind").notNull().default("text"),
    body: text("body").notNull().default(""),
    attachments: jsonb("attachments").$type<Attachment[]>().notNull().default([]),
    readAt: timestamp("read_at", { withTimezone: true }),
    flagged: boolean("flagged").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.createdAt)],
);

export const blocks = pgTable(
  "blocks",
  {
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

/* ────────────────────────── Güven ────────────────────────── */

export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id)
      .unique(),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id),
    rating: smallint("rating").notNull(),
    communication: smallint("communication").notNull(),
    quality: smallint("quality").notNull(),
    delivery: smallint("delivery").notNull(),
    comment: text("comment").notNull(),
    providerReply: text("provider_reply"),
    isHidden: boolean("is_hidden").notNull().default(false),
    // Yönetici tarafından "başarı hikâyesi" olarak seçilen gerçek değerlendirmeler
    isFeatured: boolean("is_featured").notNull().default(false),
    storyTitle: text("story_title"),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_provider_idx").on(t.providerId), index("reviews_service_idx").on(t.serviceId)],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(), // service | provider
    targetId: uuid("target_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.targetType, t.targetId] })],
);

/* ────────────────────────── Bildirim & e-posta ────────────────────────── */

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const emailOutbox = pgTable("email_outbox", {
  id: id(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  text: text("text").notNull(),
  status: text("status").notNull().default("queued"), // queued | sent | failed | logged
  error: text("error"),
  createdAt: createdAt(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

/* ────────────────────────── Dosyalar ────────────────────────── */

export const uploads = pgTable("uploads", {
  id: id(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  storageKey: text("storage_key").notNull(),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  // Özel dosyalar için erişim kapsamı: conversation:<id> | project:<id>
  scope: text("scope"),
  createdAt: createdAt(),
});

/* ────────────────────────── İçerik & SEO ────────────────────────── */

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    coverId: uuid("cover_id"),
    category: text("category").notNull().default("Rehber"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull().default("Eksen Editör"),
    status: postStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    relatedCategoryId: uuid("related_category_id"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    noindex: boolean("noindex").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("blog_status_idx").on(t.status, t.publishedAt)],
);

/** Programatik SEO açılış sayfaları: /web-sitesi-yaptirma gibi. Yalnızca editör onaylı, içeriği dolu sayfalar yayınlanır. */
export const landingPages = pgTable("landing_pages", {
  id: id(),
  slug: text("slug").notNull().unique(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  h1: text("h1").notNull(),
  intro: text("intro").notNull(),
  body: text("body").notNull().default(""),
  faqs: jsonb("faqs").$type<Faq[]>().notNull().default([]),
  priceNote: text("price_note"),
  seoTitle: text("seo_title").notNull(),
  seoDescription: text("seo_description").notNull(),
  ogImageId: uuid("og_image_id"),
  canonicalUrl: text("canonical_url"),
  isPublished: boolean("is_published").notNull().default(false),
  noindex: boolean("noindex").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const staticPages = pgTable("static_pages", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  seoDescription: text("seo_description"),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: updatedAt(),
});

export const redirects = pgTable("redirects", {
  id: id(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  permanent: boolean("permanent").notNull().default(true),
  hits: integer("hits").notNull().default(0),
  createdAt: createdAt(),
});

export const banners = pgTable("banners", {
  id: id(),
  placement: text("placement").notNull(), // home_top | category_top | search_inline
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  ctaLabel: text("cta_label"),
  isSponsored: boolean("is_sponsored").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorId: uuid("actor_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_entity_idx").on(t.entityType, t.entityId), index("audit_created_idx").on(t.createdAt)],
);

/** Günlük sayfa görüntüleme sayacı (gizlilik dostu, çerezsiz). */
export const dailyStats = pgTable(
  "daily_stats",
  {
    day: text("day").notNull(), // YYYY-MM-DD
    metric: text("metric").notNull(), // pageview | visitor | search
    dimension: text("dimension").notNull().default(""),
    value: integer("value").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.metric, t.dimension] })],
);

/** Uzmanın satın aldığı tanıtım ürünleri: öne çıkarma (hizmet bazlı) ve premium üyelik. */
export const promotionTypeEnum = pgEnum("promotion_type", ["featured", "premium"]);
export const promotions = pgTable(
  "promotions",
  {
    id: id(),
    code: text("code").notNull().unique(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    type: promotionTypeEnum("type").notNull(),
    days: integer("days").notNull(),
    amountKurus: integer("amount_kurus").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    provider: text("provider"),
    providerRef: text("provider_ref"),
    conversationId: text("conversation_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("promotions_provider_idx").on(t.providerId)],
);

/** Sunucular ve Cloudflare izolatları arasında ortak hız sınırı sayaçları. Süresi dolanlar zamanlanmış görevle silinir. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

/** Kurumsal üyelik başvuruları (satış ekibi takip eder). */
export const leads = pgTable(
  "leads",
  {
    id: id(),
    kind: text("kind").notNull().default("kurumsal"),
    company: text("company").notNull(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    city: text("city"),
    teamSize: text("team_size"),
    monthlyBudget: text("monthly_budget"),
    needs: text("needs").notNull().default(""),
    status: text("status").notNull().default("new"), // new | contacted | won | lost
    note: text("note"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("leads_status_idx").on(t.status)],
);

/** Oturum öncesi ikinci adım: şifresi doğrulanmış yöneticinin TOTP kodu beklenirken tutulan kısa ömürlü bilet. */
export const pendingLogins = pgTable("pending_logins", {
  id: text("id").primaryKey(), // sha256(token)
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  next: text("next"),
  createdAt: createdAt(),
});
