import { Client, IntentsBitField } from "discord.js";
import { readFileSync } from "fs";
import prisma from "../lib/prisma";
import type { Config } from "../types";
import Logger from "../utils/logger";

function parseArgs() {
  const dryRun =
    process.argv.includes("--dry-run") ||
    process.argv.includes("-n") ||
    process.env.DRY_RUN === "1";

  return { dryRun };
}

async function fetchBotGuildIds(token: string): Promise<Set<string>> {
  const client = new Client({
    intents: [IntentsBitField.Flags.Guilds],
  });

  const ids = new Set<string>();
  const limit = 200;

  try {
    await client.login(token);

    let after: string | undefined;
    for (;;) {
      const page = await client.guilds.fetch({
        limit,
        ...(after !== undefined ? { after } : {}),
      });
      if (page.size === 0) break;
      for (const g of page.values()) {
        ids.add(g.id);
      }
      if (page.size < limit) break;
      const lastId = page.lastKey();
      if (lastId === undefined) break;
      after = lastId;
    }

    return ids;
  } finally {
    await client.destroy();
  }
}

async function main() {
  const logger = new Logger(console.log);
  const { dryRun } = parseArgs();

  if (dryRun) {
    logger.warning("Dry run: no database changes will be made.");
  }

  const config = JSON.parse(readFileSync("config.json", "utf-8")) as Config;

  logger.info("Connecting to Discord to list current guilds…");
  const guildIds = await fetchBotGuildIds(config.token);
  logger.info(`Bot is in ${guildIds.size} guild(s).`);
  logger.info(Array.from(guildIds).join(", "));

  const stalePings = await prisma.pluginPing.findMany({
    where: {
      server: {
        notIn: Array.from(guildIds),
      },
    },
    select: {
      id: true,
      server: true,
    },
  });
  const staleIds = new Set(stalePings.map((p) => p.id));

  if (stalePings.length === 0) {
    logger.info("No plugin pings for guilds the bot has left.");
  } else {
    logger.info(
      `Found ${stalePings.length} plugin pings in guilds the bot is not in.`,
    );
    for (const p of stalePings) {
      logger.info(`  id=${p.id} server=${p.server}`);
    }
    if (!dryRun) {
      const result = await prisma.pluginPing.deleteMany({
        where: { id: { in: stalePings.map((x) => x.id) } },
      });
      logger.info(`Deleted ${result.count} plugin pings(s).`);
    }
  }

  const allInfos = await prisma.pluginInfo.findMany({
    include: { pings: true },
  });

  const infosToRemove = allInfos.filter((info) => {
    const remaining = info.pings.filter((p) => !staleIds.has(p.id));
    return remaining.length === 0;
  });

  if (infosToRemove.length === 0) {
    logger.info("No orphaned plugin info rows to remove.");
  } else {
    logger.info(
      `${dryRun ? "Would remove" : "Removing"} ${infosToRemove.length} plugin info row(s) with no remaining registrations.`,
    );
    for (const i of infosToRemove) {
      logger.info(`  pluginId=${i.pluginId}`);
    }
    if (!dryRun) {
      const result = await prisma.pluginInfo.deleteMany({
        where: { id: { in: infosToRemove.map((x) => x.id) } },
      });
      logger.info(`Deleted ${result.count} plugin info row(s).`);
    }
  }

  logger.info(dryRun ? "Dry run finished." : "Cleanup finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
