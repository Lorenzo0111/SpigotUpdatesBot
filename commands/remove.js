const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Plugin = require("../database/Plugin");

module.exports = {
  name: "remove",
  executor: async (client, command) => {
    if (!client.config.public) {
      command.reply("This command is only available in public bots.");
      return;
    }

    const plugin = command.options.getInteger("plugin") || 0;

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

    await Plugin.deleteMany({
      id: plugin,
      server: command.guild.id,
    }).exec();

    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("<a:tick:983296047965151273> Plugin removed successfully!")
          .setColor("#ff9900"),
      ],
    });

    client.pluginCount--;
  },
};
