const axios = require('axios').default;
const {Permissions, MessageEmbed} = require('discord.js');
const Plugin = require('../database/Plugin');

module.exports = {
    name: 'addowner',
    executor: async (client,command) => {
        if (!client.config.public) {
            command.reply("This command is only available in private bots.");
            return;
        }
        const user = command.options.getInteger('user') || 0;
        const channel = command.options.getChannel('channel');
        const ping = command.options.getRole('ping') || null;

        await command.deferReply();

        if (!command.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("<:severe:926091008645664848> You do not have the permission to manage webhooks.")
                    .setColor('#ff9900')]
            });
            return;
        }

        if (user === 0) {
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("<:severe:926091008645664848> You must specify a user id.")
                    .setColor('#ff9900')]
            });
            return;
        }

        if (!channel) {
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("<:severe:926091008645664848> You must specify a channel.")
                    .setColor('#ff9900')]
            });
            return;
        }

        try {
            const {data} = await axios.get("https://api.spiget.org/v2/authors/" + encodeURIComponent(user) + "/resources?size=100");            
            let added = 0;

            for (let index in data) {
                const plugin = data[index];
                const element = await Plugin.findOne({server:command.guild.id,id: plugin.id,channel:channel.id}).exec();

                if (!element) {
                    const {data: updateData} = await axios.get("https://api.spiget.org/v2/resources/" + encodeURIComponent(plugin.id) + "/updates/latest?size=1");            

                    new Plugin({
                        id: plugin.id,
                        server: channel.guild.id,
                        channel: channel.id,
                        latest: updateData.id,
                        ping: ping != null ? ping.id : null
                    }).save();

                    added++;
                }
            }
            
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle(`<a:tick:983296047965151273> Successfully added ${added} plugin(s) from the author requested!`)
                    .setColor('#ff9900')]
            });
            client.pluginCount += added;
            return;
        } catch (e) {
            command.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("<:severe:926091008645664848> This user does not exist.")
                    .setColor('#ff9900')]
            });
        }
        
    }
}
