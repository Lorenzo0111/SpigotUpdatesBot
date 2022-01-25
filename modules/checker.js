const axios = require('axios').default;
const fs = require('fs');
const {MessageEmbed,WebhookClient, SystemChannelFlags} = require('discord.js');

module.exports = async (client,noWebhook) => {
    if (noWebhook) {
        await checkNow(client, noWebhook);
        process.exit(0);
    }

    setInterval(() => checkNow(client), 30 * 60 * 1000);
}

async function checkNow(client,noWebhook = false) {
    let needsSave = false;

    for (let index in client.config.plugins) {
        const plugin = client.config.plugins[index];
        const {data} = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id + "/updates/latest?size=1");
        if (plugin.latestVersion != data.id) {
            plugin.latestVersion = data.id;
            needsSave = true;
            if (!noWebhook) {
                sendWebhook(plugin,data);
            }
        }
    }

    if (needsSave) {
        fs.writeFileSync("config.json", JSON.stringify(client.config));
    }
}

async function sendWebhook(plugin, response) {
    console.log("[・] Sending webhook for " + response.id);

    const {data} = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id);
    const version = await axios.get("https://api.spiget.org/v2/resources/" + plugin.id + "/versions/latest");

    const embed = new MessageEmbed()
	.setTitle('📰・' + data.name + ' Update')
    .setDescription(`**📋・About**
    > Version: ${version.data.name}
    > Title: ${response.title}
    
    **📦・Download**
    > https://www.spigotmc.org/resources/${plugin.id}
    
    **📌・Pings**
    > <@&743466440899821771>`)
    .setTimestamp()
    .setFooter({
        text: "Spigot • Updates",
        iconURL: "https://i.imgur.com/FyUSy8J.png"
    })
	.setColor('#ff9900');

    const webhook = new WebhookClient({ url: plugin.webhook });
    await webhook.send({
        username: data.name + " | Updates",
        embeds: [embed]
    });
}