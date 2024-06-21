import {
  PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  APIEmbedField,
} from "discord.js";
import type { ExtendedClient } from "../types";
import prisma from "../lib/prisma";

export const name = "list";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  if (!client.config.public) {
    command.reply("This command is only available in public bots.");
    return;
  }

  await command.deferReply();

  if (
    !(command.member as GuildMember).permissions.has(
      PermissionFlagsBits.ManageWebhooks
    )
  ) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("You do not have the permission to manage webhooks.")
          .setColor("#ff9900"),
      ],
    });
    return;
  }

  const plugins = await prisma.plugin.findMany({
    where: {
      server: command.guildId!,
    },
  });

  const fields: APIEmbedField[] = [];
  for (let i = 0; i < plugins.length; i++) {
    fields.push({
      name: plugins[i].pluginId,
      value:
        "[Plugin Link](https://www.spigotmc.org/resources/" +
        plugins[i].pluginId +
        "/) - <#" +
        plugins[i].channel +
        "> - " +
        (plugins[i].ping != null ? "<@&" + plugins[i].ping + ">" : "None"),
    });
  }

  command.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Plugin list")
        .setFields(fields)
        .setColor("#ff9900"),
    ],
  });
}
