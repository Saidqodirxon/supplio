import { PrismaClient, SubscriptionPlan } from "@prisma/client";
import { readFile } from "fs/promises";
import * as path from "path";

type TariffInput = {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const prisma = new PrismaClient();

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  SubscriptionPlan.FREE,
  SubscriptionPlan.START,
  SubscriptionPlan.PRO,
  SubscriptionPlan.PREMIUM,
];

function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return SUBSCRIPTION_PLANS.includes(value as SubscriptionPlan);
}

function targetsByCount(count: number): SubscriptionPlan[] {
  if (count <= 0) return [];
  if (count === 1) return [SubscriptionPlan.START];
  if (count === 2) return [SubscriptionPlan.START, SubscriptionPlan.PRO];
  if (count === 3)
    return [
      SubscriptionPlan.START,
      SubscriptionPlan.PRO,
      SubscriptionPlan.PREMIUM,
    ];
  return [
    SubscriptionPlan.FREE,
    SubscriptionPlan.START,
    SubscriptionPlan.PRO,
    SubscriptionPlan.PREMIUM,
  ];
}

async function main() {
  const inputArg = process.argv[2] || "./tariffs-export.json";
  const inputPath = path.resolve(process.cwd(), inputArg);

  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw) as TariffInput[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Tariff import file is empty or invalid array");
  }

  const prepared = parsed.map((item, idx) => {
    const { id, createdAt, updatedAt, ...rest } = item;
    const planKeyRaw = String(rest.planKey ?? "")
      .trim()
      .toUpperCase();
    return {
      ...rest,
      planKey: planKeyRaw,
      order: Number(rest.order ?? idx),
      isActive: Boolean(rest.isActive ?? true),
      isPopular: Boolean(rest.isPopular ?? false),
    };
  });

  const validEnumPlansInImport = Array.from(
    new Set(
      prepared
        .map((t) => String(t.planKey))
        .filter((k): k is SubscriptionPlan => isSubscriptionPlan(k))
    )
  );

  if (!validEnumPlansInImport.length) {
    const sorted = [...prepared].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );
    const targets = targetsByCount(sorted.length);
    const mapCount = Math.min(sorted.length, targets.length);

    for (let i = 0; i < mapCount; i += 1) {
      sorted[i].planKey = targets[i];
    }
  }

  const validPlansAfterNormalization = Array.from(
    new Set(
      prepared
        .map((t) => String(t.planKey))
        .filter((k): k is SubscriptionPlan => isSubscriptionPlan(k))
    )
  );

  const fallbackPlan: SubscriptionPlan = (() => {
    const sorted = [...prepared].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );
    for (const t of sorted) {
      const plan = String(t.planKey);
      if (isSubscriptionPlan(plan)) return plan;
    }
    throw new Error(
      "Import file has no valid enum planKey (FREE/START/PRO/PREMIUM)."
    );
  })();

  await prisma.$transaction(async (tx) => {
    if (validPlansAfterNormalization.length > 0) {
      await tx.company.updateMany({
        where: { subscriptionPlan: { notIn: validPlansAfterNormalization } },
        data: { subscriptionPlan: fallbackPlan },
      });

      await tx.subscription.updateMany({
        where: { plan: { notIn: validPlansAfterNormalization } },
        data: { plan: fallbackPlan },
      });

      await tx.featureFlag.updateMany({
        where: {
          planLevel: { not: null, notIn: validPlansAfterNormalization },
        },
        data: { planLevel: fallbackPlan },
      });
    }

    await tx.tariffPlan.deleteMany({});
    await tx.tariffPlan.createMany({ data: prepared as any[] });
  });

  console.log(`Imported ${prepared.length} tariffs from: ${inputPath}`);
  console.log(
    `Fallback plan used for missing companies/subscriptions: ${fallbackPlan}`
  );
}

main()
  .catch((err) => {
    console.error("Failed to import tariffs:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
