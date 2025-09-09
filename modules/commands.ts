import { Events } from "discord.js";
import { readdirSync } from "fs";
import type { ExtendedClient } from "../types";

const commands = new Map();

readdirSync("commands")
  .map((mod) => `../commands/${mod}`)
  .map((mod) => require(mod))
  .forEach((mod) => commands.set(mod.name, mod));

export default async (client: ExtendedClient) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.commandName;

    if (!commands.has(command)) return;

    try {
      commands.get(command).executor(client, interaction);
    } catch (error) {
      if (error instanceof Error) client.logger.error(error.message);
      else client.logger.error(error as string);
    }
  });
};
