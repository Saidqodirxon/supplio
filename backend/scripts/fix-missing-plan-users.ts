import { PrismaClient, SubscriptionPlan } from "@prisma/client";

const prisma = new PrismaClient();

const ENUM_PLANS: SubscriptionPlan[] = [
  SubscriptionPlan.FREE,
  SubscriptionPlan.START,
  SubscriptionPlan.PRO,
  SubscriptionPlan.PREMIUM,
];

function isEnumPlan(value: string): value is SubscriptionPlan {
  return ENUM_PLANS.includes(value as SubscriptionPlan);
}

async function main() {
  let tariffs = await prisma.tariffPlan.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, planKey: true, order: true },
  });

  let validPlans = Array.from(
    new Set(
      tariffs
        .map((t) => String(t.planKey).trim().toUpperCase())
        .filter((k): k is SubscriptionPlan => isEnumPlan(k))
    )
  );

  // If all tariff keys are custom strings (e.g. STARTER/PROFESSIONAL/BUSINESS),
  // normalize them to enum-compatible keys by order so plan checks can work.
  if (!validPlans.length && tariffs.length > 0) {
    const sorted = [...tariffs].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );

    let targets: SubscriptionPlan[] = [];
    if (sorted.length === 1) targets = [SubscriptionPlan.START];
    else if (sorted.length === 2)
      targets = [SubscriptionPlan.START, SubscriptionPlan.PRO];
    else if (sorted.length === 3)
      targets = [
        SubscriptionPlan.START,
        SubscriptionPlan.PRO,
        SubscriptionPlan.PREMIUM,
      ];
    else
      targets = [
        SubscriptionPlan.FREE,
        SubscriptionPlan.START,
        SubscriptionPlan.PRO,
        SubscriptionPlan.PREMIUM,
      ];

    const toNormalize = sorted.slice(0, targets.length);
    for (let i = 0; i < toNormalize.length; i += 1) {
      await prisma.tariffPlan.update({
        where: { id: toNormalize[i].id },
        data: { planKey: targets[i] },
      });
    }

    tariffs = await prisma.tariffPlan.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, planKey: true, order: true },
    });

    validPlans = Array.from(
      new Set(
        tariffs
          .map((t) => String(t.planKey).trim().toUpperCase())
          .filter((k): k is SubscriptionPlan => isEnumPlan(k))
      )
    );
  }

  if (!validPlans.length) {
    throw new Error(
      "TariffPlan table has no valid enum planKey (FREE/START/PRO/PREMIUM). First import/seed tariffs, then run this fixer."
    );
  }

  const fallbackPlan: SubscriptionPlan = validPlans[0];

  const [companiesResult, subscriptionsResult, featureFlagsResult] =
    await prisma.$transaction([
      prisma.company.updateMany({
        where: { subscriptionPlan: { notIn: validPlans } },
        data: { subscriptionPlan: fallbackPlan },
      }),
      prisma.subscription.updateMany({
        where: { plan: { notIn: validPlans } },
        data: { plan: fallbackPlan },
      }),
      prisma.featureFlag.updateMany({
        where: { planLevel: { not: null, notIn: validPlans } },
        data: { planLevel: fallbackPlan },
      }),
    ]);

  console.log("Tariff consistency fix completed.");
  console.log("Valid plans:", validPlans.join(", "));
  console.log("Fallback plan:", fallbackPlan);
  console.log("Updated companies:", companiesResult.count);
  console.log("Updated subscriptions:", subscriptionsResult.count);
  console.log("Updated feature flags:", featureFlagsResult.count);
}

main()
  .catch((err) => {
    console.error("Failed to fix missing plans:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
