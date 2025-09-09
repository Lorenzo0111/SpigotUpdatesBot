import type { PluginInfo, PluginPing } from "@prisma/client";
import {
  AttachmentBuilder,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import { renderHTML } from "../lib/browserless";
import prisma from "../lib/prisma";
import type { ExtendedClient, LatestUpdateResponse } from "../types";
import axios from "../utils/fetcher";

export type Plugin = PluginInfo & {
  pings: PluginPing[];
};

export default async (client: ExtendedClient) => {
  await checkNow(client);
  setInterval(() => checkNow(client), 30 * 60 * 1000);
};

export async function checkGuild(guild: Guild, client: ExtendedClient) {
  const plugins = await prisma.pluginInfo.findMany({
    where: { pings: { some: { server: guild.id } } },
    include: { pings: true },
  });
  check(plugins, client);
}

async function checkNow(client: ExtendedClient) {
  const plugins = await prisma.pluginInfo.findMany({
    include: {
      pings: true,
    },
  });
  check(plugins, client);
}

async function check(plugins: Plugin[], client: ExtendedClient) {
  for (let index in plugins) {
    let webhook = true;
    let plugin = plugins[index];

    if (plugin.latest == null) webhook = false;

    try {
      const { data } = await axios.get(
        "https://api.spiget.org/v2/resources/" +
          encodeURIComponent(plugin.pluginId) +
          "/updates/latest?size=1"
      );
      if (plugin.latest != data.id) {
        plugin.latest = data.id;

        if (webhook) sendWebhook(client, plugin, data);

        await prisma.pluginInfo.update({
          where: { id: plugin.id },
          data: { latest: data.id },
        });
      }
    } catch (e) {}
  }

  client.lastCheck = new Date().getTime();
}

async function sendWebhook(
  client: ExtendedClient,
  plugin: Plugin,
  response: LatestUpdateResponse
) {
  try {
    client.logger.info("[・] Sending message for " + plugin.pluginId);

    const { data } = await axios.get(
      "https://api.spiget.org/v2/resources/" +
        encodeURIComponent(plugin.pluginId)
    );
    const version = await axios.get(
      "https://api.spiget.org/v2/resources/" +
        encodeURIComponent(plugin.pluginId) +
        "/versions/latest"
    );

    const decoded = Buffer.from(response.description, "base64").toString(
      "utf-8"
    );
    const render = await renderHTML(client, decoded);
    const file = render
      ? new AttachmentBuilder(Buffer.from(render), {
          name: "image.png",
        })
      : null;

    const embed = new EmbedBuilder()
      .setTitle("📰・" + data.name + " Update")
      .setDescription(
        client.config.message
          .replace("{version}", version.data.name)
          .replace("{title}", response.title)
          .replace("{plugin}", plugin.pluginId)
          .replace("\\n", "\n")
      )
      .setTimestamp()
      .setImage(file ? "attachment://image.png" : null)
      .setFooter({
        text: "Spigot • Updates",
        iconURL: client.user?.avatarURL() || undefined,
      })
      .setColor("#ff9900");

    for (const ping of plugin.pings) {
      const guild = client.guilds.cache.get(ping.server);
      if (guild != null) {
        const channel = guild.channels.cache.get(ping.channel) as TextChannel;

        if (channel != null) {
          channel
            .send({
              content: ping.ping != null ? "<@&" + ping.ping + ">" : undefined,
              embeds: [embed],
              files: file ? [file] : undefined,
            })
            .catch((e) => {
              client.logger.error(
                `Cannot send message for ${data.name}. Aborting..`
              );
            });
        } else {
          client.logger.error("Cannot find a channel with that id. Aborting..");
        }
      } else {
        client.logger.error("Cannot find a server with that id. Aborting..");
        await prisma.pluginPing.delete({
          where: {
            id: ping.id,
          },
        });
      }
    }
  } catch (e) {}
}
