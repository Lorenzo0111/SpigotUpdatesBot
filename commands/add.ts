import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import type { ExtendedClient } from "../types";
import axios from "../utils/fetcher";
import prisma from "../lib/prisma";

export const name = "add";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  if (!client.config.public) {
    command.reply("This command is only available in public bots.");
    return;
  }

  const plugin = command.options.getInteger("plugin") || 0;
  const channel = command.options.getChannel("channel") as TextChannel;
  const ping = command.options.getRole("ping") || null;

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

  if (!channel) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("You must specify a channel.")
          .setColor("#ff9900"),
      ],
    });
    return;
  }

  try {
    const { data } = await axios.get(
      "https://api.spiget.org/v2/resources/" +
        encodeURIComponent(plugin) +
        "/updates/latest?size=1"
    );

    await prisma.plugin.create({
      data: {
        pluginId: plugin.toString(),
        server: channel.guildId,
        channel: channel.id,
        latest: data.id,
        ping: ping != null ? ping.id : null,
      },
    });

    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Plugin added successfully!")
          .setColor("#ff9900"),
      ],
    });

    client.pluginCount++;
    return;
  } catch (e) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("This plugin does not exist.")
          .setColor("#ff9900"),
      ],
    });
  }
}
