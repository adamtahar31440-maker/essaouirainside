import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

const ALLOWED_EMAIL = "adamboutiquewp@gmail.com";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
  if (email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: "Email mismatch", email }, { status: 403 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, { publicMetadata: { role: "super_admin" } });

  return NextResponse.json({ ok: true, message: "Role set to super_admin", userId: user.id, email });
}
