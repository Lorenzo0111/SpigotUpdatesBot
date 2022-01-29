const fs = require('fs');
const axios = require('axios').default;
const {Permissions} = require('discord.js');

module.exports = {
    name: 'add',
    executor: async (client,command) => {
        if (!client.config.public) {
            command.reply("This command is only available in private bots.");
            return;
        }
        const plugin = command.options.getInteger('plugin') || 0;
        const channel = command.options.getChannel('channel');

        await command.deferReply();

        if (!command.member.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
            command.editReply("You do not have the permission to manage webhooks.");
            return;
        }

        if (plugin === 0) {
            command.editReply("You must specify a plugin id.");
            return;
        }

        if (!channel) {
            command.editReply("You must specify a channel id.");
            return;
        }

        if (client.data[plugin]) {
            command.editReply("This plugin is already added.");
            return;
        }

        try {
            const {data} = await axios.get("https://api.spiget.org/v2/resources/" + plugin + "/updates/latest?size=1");
            client.config.plugins[client.config.plugins.length] = {
                "id": plugin,
                "server": channel.guild.id,
                "channel": channel.id
            };
            client.data[plugin] = {
                "latest": data.id
            }

            fs.writeFileSync('config.json', JSON.stringify(client.config, null, '\t'));
            fs.writeFileSync('data.json', JSON.stringify(client.data, null, '\t'));
            
            command.editReply("Plugin added.");
            return;
        } catch (e) {
            command.editReply("This plugin does not exists.");
        }
        

        
    }
}