import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the built-in auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  label: varchar("label", { length: 64 }).notNull(),
  dateLabel: varchar("dateLabel", { length: 64 }).notNull(),
  capacity: int("capacity").notNull().default(10),
  booked: int("booked").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  people: int("people").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
