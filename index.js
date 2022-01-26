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

const noWebhook = process.argv.find(arg => arg === "--load-config") != null;
bot.config = noWebhook ? require('./config.js') : require('./config.json');

if (noWebhook) {
	console.log("Found load config command. Loading the config..")
	console.log("Remember that if you need to edit the config you'll have to run this command again")
}

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}.`)
	require('./modules/checker')(bot,noWebhook);
});
bot.login(bot.config.token);
