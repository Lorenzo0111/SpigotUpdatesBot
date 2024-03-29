const axios = require("axios").default;
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Plugin = require("../database/Plugin");

module.exports = {
  name: "add",
  executor: async (client, command) => {
    if (!client.config.public) {
      command.reply("This command is only available in public bots.");
      return;
    }
    const plugin = command.options.getInteger("plugin") || 0;
    const channel = command.options.getChannel("channel");
    const ping = command.options.getRole("ping") || null;

    await command.deferReply();

    if (!command.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
      command.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:severe:926091008645664848> You do not have the permission to manage webhooks."
            )
            .setColor("#ff9900"),
        ],
      });
      return;
    }

    if (plugin === 0) {
      command.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:severe:926091008645664848> You must specify a plugin id."
            )
            .setColor("#ff9900"),
        ],
      });
      return;
    }

    if (!channel) {
      command.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:severe:926091008645664848> You must specify a channel."
            )
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
      new Plugin({
        id: plugin,
        server: channel.guild.id,
        channel: channel.id,
        latest: data.id,
        ping: ping != null ? ping.id : null,
      }).save();

      command.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("<a:tick:983296047965151273> Plugin added successfully!")
            .setColor("#ff9900"),
        ],
      });

      client.pluginCount++;
      return;
    } catch (e) {
      command.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "<:severe:926091008645664848> This plugin does not exist."
            )
            .setColor("#ff9900"),
        ],
      });
    }
  },
};
