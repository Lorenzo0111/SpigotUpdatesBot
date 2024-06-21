import axios from "axios";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import type { ExtendedClient } from "../types";
import prisma from "../lib/prisma";

export const name = "addowner";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  if (!client.config.public) {
    command.reply("This command is only available in private bots.");
    return;
  }
  const user = command.options.getInteger("user") || 0;
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

  if (user === 0) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("You must specify a user id.")
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
      "https://api.spiget.org/v2/authors/" +
        encodeURIComponent(user) +
        "/resources?size=100"
    );
    let added = 0;

    for (let index in data) {
      const plugin = data[index];
      const element = await prisma.plugin.findFirst({
        where: {
          server: command.guildId!.toString(),
          pluginId: plugin.id,
          channel: channel.id,
        },
      });

      if (!element) {
        let updateId = null;

        try {
          const { data: updateData } = await axios.get(
            "https://api.spiget.org/v2/resources/" +
              encodeURIComponent(plugin.id) +
              "/updates/latest?size=1"
          );

          updateId = updateData.id;
        } catch (ignored) {}

        await prisma.plugin.create({
          data: {
            pluginId: plugin.id,
            server: channel.guild.id,
            channel: channel.id,
            latest: updateId,
            ping: ping != null ? ping.id : null,
          },
        });

        added++;
      }
    }

    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `Successfully added ${added} plugin(s) from the author requested!`
          )
          .setColor("#ff9900"),
      ],
    });
    client.pluginCount += added;
    return;
  } catch (e) {
    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("This user does not exist.")
          .setColor("#ff9900"),
      ],
    });
  }
}
