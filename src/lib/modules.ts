import { getDb } from "@/db";
import { modules } from "@/db/schema";

const ACTIVE = "active";

export async function getActiveModuleKeys(): Promise<Set<string>> {
  const db = getDb();
  const rows = await db.select().from(modules);
  return new Set(rows.filter((m) => m.status === ACTIVE).map((m) => m.key));
}

export async function isModuleActive(key: string): Promise<boolean> {
  const active = await getActiveModuleKeys();
  return active.has(key);
}

// Maps our route-level categories to their module key in the modules table.
export const CATEGORY_MODULE_KEY: Record<string, string> = {
  restaurant: "restaurants",
  activite: "activites",
  shopping: "shopping",
};
