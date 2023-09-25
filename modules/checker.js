const {create} = require('axios');
const {EmbedBuilder} = require('discord.js');
const Plugin = require("../database/Plugin");

const axios = create({
    headers: {
        common: {
            'User-Agent': 'SpigotUpdatesBot',
        }
    }
});

module.exports = async (client) => {
    await checkNow(client);
    setInterval(() => checkNow(client), 30 * 60 * 1000);
}

module.exports.checkGuild = async function (guild,client) {
    const plugins = await Plugin.find({server: guild.id}).exec();
    check(plugins,client);
}

async function checkNow(client) {
    const plugins = await Plugin.find().exec();
    check(plugins,client);
}

async function check(plugins,client) {
    for (let index in plugins) {
        let webhook = true;
        let plugin = plugins[index];

        if (plugin.latest == null) {
            webhook = false;
        }

        try {
            const {data} = await axios.get("https://api.spiget.org/v2/resources/" + encodeURIComponent(plugin.id) + "/updates/latest?size=1");
            if (plugin.latest != data.id) {
                plugin.latest = data.id;
                if (webhook) {
                    sendWebhook(client,plugin,data);
                }

                plugin.save()
            }
        } catch (e) {}
    }
    
    client.lastCheck = new Date().getTime();
}

async function sendWebhook(client, plugin, response) {
    try {
        client.logger.info("[・] Sending message for " + plugin.id);

        const {data} = await axios.get("https://api.spiget.org/v2/resources/" + encodeURIComponent(plugin.id));
        const version = await axios.get("https://api.spiget.org/v2/resources/" + encodeURIComponent(plugin.id) + "/versions/latest");

        const embed = new EmbedBuilder()
        .setTitle('📰・' + data.name + ' Update')
        .setDescription(client.config.message.replace("{version}", version.data.name).replace("{title}",response.title).replace("{plugin}",plugin.id).replace("\\n","\n"))
        .setTimestamp()
        .setFooter({
            text: "Spigot • Updates",
            iconURL: client.user.avatarURL()
        })
        .setColor('#ff9900');

        const guild = client.guilds.cache.get(plugin.server);
        if (guild != null) {
            const channel = guild.channels.cache.get(plugin.channel);
            
            if (channel != null) {
                channel.send({
                    content: plugin.ping != null ? "<@&" + plugin.ping + ">" : null,
                    embeds: [embed]
                });
            } else {
                client.logger.error("Cannot find a channel with that id. Aborting..");
            }
        } else {
            client.logger.error("Cannot find a server with that id. Aborting..");
        }
    } catch (e) {}
}