import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  favoriteProjects,
  type InsertFavoriteProject,
  type InsertUser,
  type InsertUserProfile,
  type UserProfile,
  userProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  updateSet.lastSignedIn = values.lastSignedIn;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function saveUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا.");
  await db.insert(userProfiles).values(profile).onDuplicateKeyUpdate({
    set: { skills: profile.skills, interests: profile.interests, experience: profile.experience },
  });
}

export async function listFavoriteProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favoriteProjects).where(eq(favoriteProjects.userId, userId)).orderBy(desc(favoriteProjects.createdAt));
}

export async function toggleFavoriteProject(project: InsertFavoriteProject) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا.");
  const existing = await db
    .select({ id: favoriteProjects.id })
    .from(favoriteProjects)
    .where(and(eq(favoriteProjects.userId, project.userId), eq(favoriteProjects.repoFullName, project.repoFullName)))
    .limit(1);

  if (existing[0]) {
    await db.delete(favoriteProjects).where(eq(favoriteProjects.id, existing[0].id));
    return { isFavorite: false };
  }

  await db.insert(favoriteProjects).values(project);
  return { isFavorite: true };
}
