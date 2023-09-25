const axios = require('axios').default;
const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'plugin',
    executor: async (client,command) => {
        const plugin = command.options.getString('plugin');

        if (!plugin) {
            command.reply('You must specify a plugin to check the version of.');
            return;
        }

        await command.deferReply();

        const resource = await axios.get("https://api.spiget.org/v2/search/resources/" + plugin + "?limit=1&sort=downloads");

        if (!resource.data || resource.data.length === 0) {
            command.editReply('Could not find any plugins with that name.');
            return;
        }

        const resourceObj = resource.data[0];

        const latest = await axios.get("https://api.spiget.org/v2/resources/" + resourceObj.id + "/versions/latest");

        if (!latest.data) {
            command.editReply('Could not find any versions of that plugin.');
            return;
        }

        const latestVersion = latest.data;

        const embed = new EmbedBuilder()
        .setTitle(resourceObj.name)
        .setDescription(`${resourceObj.name} v${latestVersion.name}
        
        🛠️ Latest Version: ${latestVersion.name}
        📦 Downloads: ${resourceObj.downloads}
        ⭐ Ratings: ${resourceObj.rating.average}
        
        [📦 Download Now](https://www.spigotmc.org/resources/${resourceObj.id})`)
        .setColor('#ff9900');

        command.editReply({
            embeds: [embed]
        });
    }
}