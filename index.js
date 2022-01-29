const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('./utils/Logger');
const fs = require('fs');
const bot = new Client({
	presence: {
		status: 'online',
        activities: [{
            name: `SpigotMC`,
            type: 'WATCHING'
        }]
	},
	intents: [
		Intents.FLAGS.GUILDS
	]
});

bot.noWebhook = process.argv.find(arg => arg === "--load-config") != null;
bot.config = bot.noWebhook ? require('./config.js') : require('./config.json');
bot.logger = new Logger(console.log);

if (bot.noWebhook) {
	bot.logger.info("Found load config command. Loading the config..")
	bot.logger.info("Remember that if you need to edit the config you'll have to run this command again")
}

const commands = [new SlashCommandBuilder()
	.setName('version')
	.setDescription('Retrieves the latest version of a plugin')
	.addStringOption(option =>
		option.setName('plugin')
			.setDescription('The plugin name')
			.setRequired(true)).toJSON()]

const rest = new REST({ version: '9' }).setToken(bot.config.token);

bot.on('ready',() => {
	bot.logger.info(`Logged in as ${bot.user.tag}.`)
	bot.logger.info(`You can invite the bot with the following link: https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=117760&scope=bot%20applications.commands`)

	if (bot.noWebhook) {
		require('./modules/checker')(bot);
		return;
	}

	fs.readdirSync('modules')
    .map(mod => {
      bot.logger.info("[+] Loaded " + mod)
      return `./modules/${mod}`;
    })
    .map(mod => require(mod))
    .forEach(mod => mod(bot));

	(async () => {
		bot.guilds.cache.forEach(guild => {
			try {				
				rest.put(
					Routes.applicationGuildCommands(bot.user.id, guild.id),
						{ body: commands },
					);
				} catch (error) {
					bot.logger.error("Error while trying to load commands. Are you missing the Commands permission?");
				}
		});
	})();
});
bot.login(bot.config.token);
