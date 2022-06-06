const {Permissions,MessageEmbed} = require('discord.js');
const {checkGuild} = require('../modules/checker');

module.exports = {
    name: 'checknow',
    executor: async (client,command) => {
        if (!client.config.public) {
            command.reply("This command is only available in private bots.");
            return;
        }

        await command.deferReply();
        
        if (!command.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
            command.editReply("You do not have the permission to manage webhooks.");
            return;
        }

        checkGuild(command.guild,client);

        command.editReply({
            embeds: [new MessageEmbed()
                .setTitle("<a:tick:983296047965151273>  Check scheduled successfully!")
                .setColor('#ff9900')]
        });
    }
}