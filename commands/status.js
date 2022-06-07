const axios = require('axios').default;
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'status',
    executor: async (client,command) => {
        await command.deferReply();

		const {data} = await axios.get('https://api.spiget.org/v2/status');

		const embed = new MessageEmbed()
			.setTitle('Spigot Updates • Status')
			.setDescription('Status of the bot')
			.setColor('#ff9900')
			.addField('🏓 • Spiget Server', data.status.server.name, true)
			.addField('📑 • Discord Ping', Math.round(client.ws.ping) + 'ms');

		command.editReply({embeds: [embed]});
    }
}
