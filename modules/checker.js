const axios = require('axios').default;
const fs = require('fs');
const {MessageEmbed,WebhookClient} = require('discord.js');

module.exports = async (client) => {
    await checkNow(client);
    setInterval(() => checkNow(client), 30 * 60 * 1000);
}

async function checkNow(client) {
    let needsSave = false;

    for (let index in client.config.plugins) {
        let webhook = true;
        const plugin = client.config.plugins[index];
        let pluginData = client.data[plugin.id];

        if (pluginData == null) {
            pluginData = {latest: null};
            client.data[plugin.id] = pluginData;
            needsSave = true;
            webhook = false;
        }

        const {data} = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id + "/updates/latest?size=1");
        if (pluginData.latest != data.id) {
            pluginData.latest = data.id;
            needsSave = true;
            if (webhook) {
                sendWebhook(client,plugin,data);
            }
        }
    }

    if (needsSave) {
        fs.writeFileSync("data.json", JSON.stringify(client.data, null, '\t'));
    }
}

async function sendWebhook(client, plugin, response) {
    client.logger.info("[・] Sending " + (plugin.webhook != null ? "webhook" : "message" ) + " for " + plugin.id);

    const {data} = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id);
    const version = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id + "/versions/latest");

    const embed = new MessageEmbed()
	.setTitle('📰・' + data.name + ' Update')
    .setDescription(client.config.message.replace("{version}", version.data.name).replace("{title}",response.title).replace("{plugin}",plugin.id))
    .setTimestamp()
    .setFooter({
        text: "Spigot • Updates",
        iconURL: "https://i.imgur.com/FyUSy8J.png"
    })
	.setColor('#ff9900');

    if (plugin.webhook != null) {
        client.logger.warning("You are using a deprecated method: webhook. Please use the channel id instead.")

        const webhook = new WebhookClient({ url: plugin.webhook });
        await webhook.send({
            username: data.name + " | Updates",
            embeds: [embed]
        });
    } else if (plugin.channel != null && plugin.server != null) {
        const guild = client.guilds.cache.get(plugin.server);
        if (guild != null) {
            const channel = guild.channels.cache.get(plugin.channel);
            
            if (channel != null) {
                channel.send({
                    embeds: [embed]
                });
            } else {
                client.logger.error("Cannot find a channel with that id. Aborting..");
            }
        } else {
            client.logger.error("Cannot find a server with that id. Aborting..");
        }
    } else {
        client.logger.error("Cannot find a method to send the message to the server. Please set a channel id and a server id. Read the example.config.js for more information.");
    }
}