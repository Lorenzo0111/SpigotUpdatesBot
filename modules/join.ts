import { Routes } from "discord-api-types/v9";
import { Events } from "discord.js";
import type { ExtendedClient } from "../types";

export default async (client: ExtendedClient) => {
  client.on(Events.GuildCreate, async (guild) => {
    try {
      client.restAPI.put(
        Routes.applicationGuildCommands(client.user!.id, guild.id),
        { body: client.commands }
      );
    } catch (error) {
      client.logger.error(
        "Error while trying to load commands. Are you missing the Commands permission?"
      );
    }
  });
};
