import {
  PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import Plugin from "../database/Plugin";
import type { ExtendedClient } from "../types";

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

  const plugins = await Plugin.find({
    server: command.guildId,
  }).exec();

  const fields = [];
  for (let i = 0; i < plugins.length; i++) {
    fields.push({
      name: plugins[i].id,
      value:
        "[Plugin Link](https://www.spigotmc.org/resources/" +
        plugins[i].id +
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
