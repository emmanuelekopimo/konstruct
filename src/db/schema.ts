import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

// numeric comes back from pg as a string; map it to number for the app.
const num = customType<{ data: number; driverData: string }>({
  dataType: () => "numeric(14, 2)",
  fromDriver: (v) => Number(v),
  toDriver: (v) => String(v),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    city: text("city").notNull().default("Lagos"),
    state: text("state").notNull().default("Lagos"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const vendors = pgTable(
  "vendors",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    whatsapp: boolean("whatsapp").notNull().default(true),
    area: text("area").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    rating: numeric("rating", { precision: 2, scale: 1, mode: "number" }).notNull(),
    reviews: integer("reviews").notNull().default(0),
    verified: boolean("verified").notNull().default(false),
    delivers: boolean("delivers").notNull().default(true),
    categories: text("categories").array().notNull(),
    brands: text("brands").notNull().default(""),
  },
  (t) => [index("vendors_state_idx").on(t.state)],
);

export const vendorPrices = pgTable(
  "vendor_prices",
  {
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    unitPrice: integer("unit_price").notNull(),
    updatedOn: date("updated_on").notNull(),
  },
  (t) => [primaryKey({ columns: [t.vendorId, t.code] }), index("vendor_prices_code_idx").on(t.code)],
);

export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    buildingType: text("building_type").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    floors: integer("floors").notNull().default(1),
    bedrooms: integer("bedrooms").notNull().default(0),
    floorAreaM2: integer("floor_area_m2").notNull().default(0),
    summary: text("summary").notNull().default(""),
    assumptions: jsonb("assumptions").$type<string[]>().notNull().default([]),
    fileName: text("file_name").notNull(),
    fileHash: text("file_hash").notNull(),
    aiModel: text("ai_model").notNull(),
    sampleKey: text("sample_key"),
    pricedOn: date("priced_on").notNull(),
    createdOn: date("created_on").notNull(),
  },
  (t) => [index("plans_user_idx").on(t.userId)],
);

export const planItems = pgTable(
  "plan_items",
  {
    id: serial("id").primaryKey(),
    planId: integer("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    code: text("code").notNull(),
    description: text("description").notNull(),
    quantity: num("quantity").notNull(),
    unit: text("unit").notNull(),
    confidence: text("confidence").$type<"high" | "medium" | "low">().notNull(),
    basis: text("basis").notNull().default(""),
    unitPrice: integer("unit_price"),
    vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  },
  (t) => [index("plan_items_plan_idx").on(t.planId)],
);

export const planFiles = pgTable("plan_files", {
  planId: integer("plan_id")
    .primaryKey()
    .references(() => plans.id, { onDelete: "cascade" }),
  mime: text("mime").notNull(),
  bytes: bytea("bytes").notNull(),
});

/** One AI answer per file hash, so the same drawing is never sent twice. */
export const extractionCache = pgTable("extraction_cache", {
  fileHash: text("file_hash").primaryKey(),
  model: text("model").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
