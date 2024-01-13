const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { checkGuild } = require("../modules/checker");

module.exports = {
  name: "checknow",
  executor: async (client, command) => {
    if (!client.config.public) {
      command.reply("This command is only available in private bots.");
      return;
    }

    await command.deferReply({
      ephemeral: true,
    });

    if (!command.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
      command.editReply("You do not have the permission to manage webhooks.");
      return;
    }

    checkGuild(command.guild, client);

    command.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            "<a:tick:983296047965151273>  Check scheduled successfully!"
          )
          .setColor("#ff9900"),
      ],
    });
  },
};
