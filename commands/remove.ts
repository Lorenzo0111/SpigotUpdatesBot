import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import type { ExtendedClient } from "../types";
import prisma from "../lib/prisma";

export const name = "remove";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  if (!client.config.public) {
    command.reply("This command is only available in public bots.");
    return;
  }

  const plugin = command.options.getInteger("plugin") || 0;

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

  if (plugin === 0) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("You must specify a plugin id.")
          .setColor("#ff9900"),
      ],
    });
    return;
  }

  await prisma.pluginPing.deleteMany({
    where: {
      pluginId: plugin.toString(),
      server: command.guildId!,
    },
  });

  command.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Plugin removed successfully!")
        .setColor("#ff9900"),
    ],
  });

  client.pluginCount--;
}
