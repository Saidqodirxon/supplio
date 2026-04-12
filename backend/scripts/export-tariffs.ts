import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const outputArg = process.argv[2] || "./tariffs-export.json";
  const outputPath = path.resolve(process.cwd(), outputArg);

  const tariffs = await prisma.tariffPlan.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  await writeFile(outputPath, `${JSON.stringify(tariffs, null, 2)}\n`, "utf8");

  console.log(`Exported ${tariffs.length} tariffs to: ${outputPath}`);
}

main()
  .catch((err) => {
    console.error("Failed to export tariffs:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
