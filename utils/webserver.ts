import { Hono } from "hono/tiny";
import type { ExtendedClient } from "../types";

export default class WebServer {
  bot: ExtendedClient;
  app: Hono;

  constructor(bot: ExtendedClient) {
    this.bot = bot;
    const app = new Hono()
      .get("/", (ctx) => {
        return ctx.json({
          status: "online",
          version: this.bot.version,
        });
      })
      .get("/stats", async (ctx) => {
        let members = 0;

        for (const guild of this.bot.guilds.cache.values()) {
          members += guild.memberCount;
        }

        return ctx.json({
          servers: bot.guilds.cache.size,
          totalMembers: members,
          plugins: bot.pluginCount || 0,
          lastCheck: bot.lastCheck,
        });
      });

    this.app = app;
  }

  start() {
    Bun.serve({
      fetch: this.app.fetch.bind(this.app),
      port: this.bot.config.api.port,
    });
  }
}
