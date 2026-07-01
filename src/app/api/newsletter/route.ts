import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const db = getDb();
  await db
    .insert(newsletterSubscribers)
    .values({ email: parsed.data.email, locale: parsed.data.locale })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
