const { Client, Intents } = require('discord.js');
const bot = new Client({
	presence: {
		status: 'online',
		activity: {
			name: `SpigotMC`,
			type: 'WATCHING'
		}
	},
	intents: [
		Intents.FLAGS.GUILDS
	]
});

bot.config = require('./config.json');
const noWebhook = process.argv.find(arg => arg === "--load-config") != null;

if (noWebhook) {
	console.log("Found load config command. Loading the config..")
}

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}.`)
	require('./modules/checker')(bot,noWebhook);
});
bot.login(bot.config.token);