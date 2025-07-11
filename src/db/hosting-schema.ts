import { mysqlTable, varchar, int, text, timestamp, tinyint, bigint, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Hosting management tables
export const gdpsInstances = mysqlTable('gdps_instances', {
  id: varchar('id', { length: 50 }).primaryKey(), // unique GDPS ID
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  status: varchar('status', { length: 20 }).default('active'), // active, suspended, deleted
  ownerId: int('owner_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  settings: json('settings'), // basic GDPS settings
});

export const hostingUsers = mysqlTable('hosting_users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('user'), // user, admin
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const hostingPlans = mysqlTable('hosting_plans', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  maxGdps: int('max_gdps').default(1),
  maxUsers: int('max_users').default(1000),
  maxLevels: int('max_levels').default(10000),
  maxStorage: bigint('max_storage', { mode: 'number' }).default(1000000000), // bytes
  price: int('price').default(0), // cents
  features: json('features'), // array of feature flags
  isActive: tinyint('is_active').default(1),
});

export const hostingSubscriptions = mysqlTable('hosting_subscriptions', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  planId: int('plan_id').notNull(),
  gdpsId: varchar('gdps_id', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'), // active, cancelled, expired
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const gdpsInstancesRelations = relations(gdpsInstances, ({ one }) => ({
  owner: one(hostingUsers, {
    fields: [gdpsInstances.ownerId],
    references: [hostingUsers.id],
  }),
}));

export const hostingUsersRelations = relations(hostingUsers, ({ many }) => ({
  gdpsInstances: many(gdpsInstances),
  subscriptions: many(hostingSubscriptions),
}));

export const hostingSubscriptionsRelations = relations(hostingSubscriptions, ({ one }) => ({
  user: one(hostingUsers, {
    fields: [hostingSubscriptions.userId],
    references: [hostingUsers.id],
  }),
  plan: one(hostingPlans, {
    fields: [hostingSubscriptions.planId],
    references: [hostingPlans.id],
  }),
  gdps: one(gdpsInstances, {
    fields: [hostingSubscriptions.gdpsId],
    references: [gdpsInstances.id],
  }),
}));