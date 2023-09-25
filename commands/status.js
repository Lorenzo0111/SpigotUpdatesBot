const axios = require('axios').default;
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'status',
    executor: async (client,command) => {
        await command.deferReply();

		const {data} = await axios.get('https://api.spiget.org/v2/status');

		const embed = new EmbedBuilder()
			.setTitle('Spigot Updates • Status')
			.setDescription('Status of the bot')
			.setColor('#ff9900')
			.setFields([
				{
					name: '🏓 • Spiget Server',
					value: data.status.server.name,
					inline: true
				},
				{
					name: '📑 • Discord Ping',
					value: Math.round(client.ws.ping) + 'ms'
				}
			]);

		command.editReply({embeds: [embed]});
    }
}
