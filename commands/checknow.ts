import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { checkGuild } from "../modules/checker";
import type { ExtendedClient } from "../types";

export const name = "checknow";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  if (!client.config.public) {
    command.reply("This command is only available in private bots.");
    return;
  }

  await command.deferReply({
    ephemeral: true,
  });

  if (
    !(command.member as GuildMember).permissions.has(
      PermissionFlagsBits.ManageWebhooks
    )
  ) {
    command.editReply("You do not have the permission to manage webhooks.");
    return;
  }

  checkGuild(command.guild, client);

  command.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Check scheduled successfully!")
        .setColor("#ff9900"),
    ],
  });
}
