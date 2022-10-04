const {Permissions, MessageEmbed} = require('discord.js');
const Plugin = require('../database/Plugin');

module.exports = {
    name: 'list',
    executor: async (client,command) => {
        if (!client.config.public) {
            command.reply("This command is only available in public bots.");
            return;
        }

        await command.deferReply();

        if (!command.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("<:severe:926091008645664848> You do not have the permission to manage webhooks.")
                    .setColor('#ff9900')]
            });
            return;
        }

        const plugins = await Plugin.find({
            server: command.guild.id
        }).exec();

        const fields = [];
        for (let i = 0; i < plugins.length; i++) {
            fields.push({
                name: "<:spigot:1024322235776892989>" + plugins[i].id,
                value: "[Plugin Link](https://www.spigotmc.org/resources/" + plugins[i].id + "/) - <#" + plugins[i].channel + "> - " + (plugins[i].ping != null ? "<@&" + plugins[i].ping + ">" : "None")
            });
        }

        command.editReply({
            embeds: [new MessageEmbed()
                .setTitle("Plugin list")
                .setFields(fields)
                .setColor('#ff9900')]
        });
    }
}
