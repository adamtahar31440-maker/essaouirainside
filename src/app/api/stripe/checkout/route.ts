import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getStripe, STRIPE_CURRENCY } from "@/lib/stripe";
import { getProfessionalByClerkId, getSubscriptionPlans } from "@/lib/admin-data";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const professional = await getProfessionalByClerkId(user.id);
  if (!professional || professional.status !== "validated") {
    return NextResponse.json({ error: "not_a_validated_professional" }, { status: 403 });
  }

  const { planKey, billingCycle, locale } = await req.json();
  const loc = typeof locale === "string" ? locale : "fr";
  const plans = await getSubscriptionPlans();
  const plan = plans.find((p) => p.key === planKey);
  if (!plan || plan.priceMonthlyMad === 0) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const amountMad = billingCycle === "yearly" ? plan.priceYearlyMad : plan.priceMonthlyMad;

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "stripe_not_configured", message: "STRIPE_SECRET_KEY manquante." },
      { status: 503 }
    );
  }

  const origin = req.headers.get("origin") ?? "https://essaouirainside.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: professional.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: { name: `Essaouira Inside — Plan ${plan.key}` },
          unit_amount: amountMad * 100,
          recurring: { interval: billingCycle === "yearly" ? "year" : "month" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      professionalId: String(professional.id),
      planKey: plan.key,
      billingCycle,
    },
    success_url: `${origin}/${loc}/pro?checkout=success`,
    cancel_url: `${origin}/${loc}/pro?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
