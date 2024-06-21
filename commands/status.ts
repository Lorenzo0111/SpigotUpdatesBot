import axios from "axios";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { ExtendedClient } from "../types";

export const name = "status";
export async function executor(
  client: ExtendedClient,
  command: ChatInputCommandInteraction
) {
  await command.deferReply();

  const { data } = await axios.get("https://api.spiget.org/v2/status");

  const embed = new EmbedBuilder()
    .setTitle("Spigot Updates • Status")
    .setDescription("Status of the bot")
    .setColor("#ff9900")
    .setFields([
      {
        name: "🏓 • Spiget Server",
        value: data.status.server.name,
        inline: true,
      },
      {
        name: "📑 • Discord Ping",
        value: Math.round(client.ws.ping) + "ms",
      },
    ]);

  command.editReply({ embeds: [embed] });
}
