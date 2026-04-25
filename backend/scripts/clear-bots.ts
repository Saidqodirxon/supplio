/**
 * clear-bots.ts
 *
 * Barcha botlarni Telegram serveridan tozalaydi:
 *   - Webhook o'chiradi (drop_pending_updates=true)
 *   - Pending update larni clear qiladi
 *   - DB dan soft-deleted (deletedAt != null) yozuvlarni hard-delete qiladi
 *
 * Ishlatish:
 *   npx ts-node scripts/clear-bots.ts           # hammasi
 *   npx ts-node scripts/clear-bots.ts --token TOKEN  # bitta token
 *   npx ts-node scripts/clear-bots.ts --dry-run      # faqat ko'rsatadi
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SINGLE_TOKEN = (() => {
  const idx = args.indexOf("--token");
  return idx !== -1 ? args[idx + 1] : null;
})();

const TG_API = "https://api.telegram.org";

async function tgCall(
  token: string,
  method: string,
  params: Record<string, unknown> = {}
) {
  const url = `${TG_API}/bot${token}/${method}`;
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const res = await fetch(`${url}?${qs}`);
  return res.json() as Promise<{
    ok: boolean;
    result?: unknown;
    description?: string;
  }>;
}

async function clearBot(token: string, label: string) {
  console.log(`\n🤖 ${label}`);

  if (DRY_RUN) {
    console.log("   [dry-run] skip");
    return;
  }

  // 1. Delete webhook + drop pending updates
  const del = await tgCall(token, "deleteWebhook", {
    drop_pending_updates: "true",
  });
  console.log(`   deleteWebhook → ${del.ok ? "✅" : "❌ " + del.description}`);

  // 2. Drain remaining getUpdates (offset = -1 acks all)
  const upd = await tgCall(token, "getUpdates", { offset: "-1", limit: "1" });
  console.log(
    `   getUpdates(drain) → ${upd.ok ? "✅" : "❌ " + upd.description}`
  );

  // 3. Remove default menu button (reset to commands list)
  const mb = await tgCall(token, "setChatMenuButton", {
    menu_button: JSON.stringify({ type: "default" }),
  });
  console.log(`   resetMenuButton → ${mb.ok ? "✅" : "⚠️  " + mb.description}`);
}

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║      SUPPLIO — Bot Cleaner Tool      ║");
  console.log(`╚══════════════════════════════════════╝`);
  if (DRY_RUN) console.log("⚠️  DRY-RUN mode — hech narsa o'zgarmaydi\n");

  if (SINGLE_TOKEN) {
    await clearBot(
      SINGLE_TOKEN,
      `manual token: ${SINGLE_TOKEN.slice(0, 8)}...`
    );
  } else {
    const bots = await prisma.customBot.findMany({
      include: { company: { select: { name: true } } },
    });

    if (bots.length === 0) {
      console.log("\n✅ DB da hech qanday bot yo'q.");
    } else {
      console.log(`\n📋 Jami ${bots.length} ta bot topildi.`);
      for (const bot of bots) {
        await clearBot(
          bot.token,
          `${bot.company.name} — @${bot.username || bot.id.slice(-6)} [${bot.isActive ? "active" : "inactive"}${bot.deletedAt ? ", deleted" : ""}]`
        );
      }
    }

    // Hard-delete soft-deleted records
    if (!DRY_RUN) {
      const stale = await prisma.customBot.deleteMany({
        where: { deletedAt: { not: null } },
      });
      if (stale.count > 0) {
        console.log(
          `\n🗑  ${stale.count} ta soft-deleted yozuv bazadan tozalandi.`
        );
      }
    }
  }

  console.log("\n✅ Tayyor.\n");
}

main()
  .catch((e) => {
    console.error("❌ Xato:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
