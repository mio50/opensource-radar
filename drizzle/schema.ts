import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable(
  "user_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    skills: text("skills").notNull(),
    interests: text("interests").notNull(),
    experience: mysqlEnum("experience", ["مبتدئ", "متوسط", "متقدم"]).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("user_profiles_user_id_idx").on(table.userId)],
);

export const favoriteProjects = mysqlTable(
  "favorite_projects",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    repoFullName: varchar("repoFullName", { length: 255 }).notNull(),
    repoName: varchar("repoName", { length: 255 }).notNull(),
    repoUrl: varchar("repoUrl", { length: 512 }).notNull(),
    repoDescription: text("repoDescription"),
    language: varchar("language", { length: 80 }),
    matchScore: int("matchScore").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("favorite_projects_user_repo_idx").on(table.userId, table.repoFullName)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type FavoriteProject = typeof favoriteProjects.$inferSelect;
export type InsertFavoriteProject = typeof favoriteProjects.$inferInsert;
