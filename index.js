const BOOT = new Date().getTime(); 

const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes, ChannelType } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('./utils/Logger');
const Webserver = require('./utils/Webserver');
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
		Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS
	]
});

if (!fs.existsSync('data.json')) {
	fs.writeFileSync('data.json', JSON.stringify({}));
}

bot.version = "1.2.1";
bot.config = require('./config.json');
bot.data = require('./data.json');
bot.logger = new Logger(console.log);

bot.commands = [new SlashCommandBuilder()
	.setName('version')
	.setDescription('Retrieves the latest version of a plugin')
	.addStringOption(option =>
		option.setName('plugin')
			.setDescription('The plugin name')
			.setRequired(true)).toJSON()]

if (bot.config.public) {
	bot.commands.push(new SlashCommandBuilder()
	.setName('add')
	.setDescription('Adds a plugin to the list to check')
	.addIntegerOption(option => 
		option.setName('plugin')
		.setDescription('The plugin id')
		.setRequired(true))
	.addChannelOption(option =>
		option.setName('channel')
		.setDescription('The channel id')
		.setRequired(true)
		.addChannelType(ChannelType.GuildText)).toJSON());
}

const rest = new REST({ version: '9' }).setToken(bot.config.token);

bot.on('ready',() => {
	bot.logger.info(`Logged in as ${bot.user.tag}.`)
	bot.logger.info(`You can invite the bot with the following link: https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=117760&scope=bot%20applications.commands`)

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
						{ body: bot.commands },
					);
				} catch (error) {
					bot.logger.error("Error while trying to load commands. Are you missing the Commands permission?");
				}
		});
	})();

	if (bot.config.api.enabled) {
		bot.logger.info("[+] Starting API server");
		new Webserver(bot).start();
	}

	bot.logger.info("[+] Loaded all modules");
	bot.logger.info("[+] Ready in " + (new Date().getTime() - BOOT) / 1000 + " seconds!");
});
bot.login(bot.config.token);
