import { NextResponse } from "next/server";
import { safeCurrentUser as currentUser } from "@/lib/auth";
import { getProfessionalByClerkId } from "@/lib/admin-data";
import { translateFields } from "@/lib/translate";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await getProfessionalByClerkId(user.id);
  if (!professional || professional.status !== "validated") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const fields = body.fields as Record<string, string>;
  const locale = body.locale as string;

  if (!fields || !locale) {
    return NextResponse.json({ error: "Missing fields or locale" }, { status: 400 });
  }

  try {
    const result = await translateFields(fields, [locale], "fr");
    const translations = Object.fromEntries(
      Object.entries(result).map(([field, byLocale]) => [field, byLocale[locale] ?? ""])
    );
    return NextResponse.json({ translations });
  } catch (err) {
    console.error("translate-locale error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
