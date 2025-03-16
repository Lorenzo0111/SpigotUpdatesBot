import prisma from "./lib/prisma";
import Logger from "./utils/logger";

async function main() {
  const logger = new Logger(console.log);

  const pings = await prisma.pluginPing.findMany({
    select: {
      id: true,
      pluginId: true,
      latest: true,
    },
  });
  logger.info(`Found ${pings.length} pings`);

  const unique = new Set(pings.map((ping) => ping.pluginId));
  logger.info(
    `Found ${unique.size} unique plugins: ${Array.from(unique).join(", ")}`
  );

  const queries: Promise<any>[] = [];
  for (const [index, plugin] of Array.from(unique).entries()) {
    const ping = pings.find((ping) => ping.pluginId === plugin && ping.latest);

    logger.info(`Migrating plugin ${plugin} (${index + 1}/${unique.size})`);
    queries.push(
      prisma.pluginInfo
        .upsert({
          where: {
            pluginId: plugin,
          },
          create: {
            pluginId: plugin,
            latest: ping?.latest,
          },
          update: {},
        })
        .then(() => {
          logger.info(
            `Migrated plugin ${plugin} (${index + 1}/${unique.size})`
          );
        })
    );
  }

  await Promise.all(queries);

  logger.info("Migration complete");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
