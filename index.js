const BOOT = new Date().getTime(); 

const { Client, Intents } = require('discord.js');
const Statcord = require("statcord.js");
const { REST } = require('@discordjs/rest');
const { Routes, ChannelType } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('./utils/Logger');
const Webserver = require('./utils/Webserver');
const fs = require('fs');
const { connect } = require("mongoose");
const Plugin = require("./database/Plugin");
const bot = new Client({
	presence: {
		status: 'online',
        activities: [{
            name: `SpigotMC`,
            type: 'WATCHING'
        }]
	},
	intents: [
		Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
	]
});

bot.version = "2.1";
bot.config = require('./config.json');
bot.logger = new Logger(console.log);

bot.commands = [
	new SlashCommandBuilder()
		.setName('plugin')
		.setDescription('Retrieves the information of a plugin')
		.addStringOption(option =>
			option.setName('plugin')
				.setDescription('The plugin name')
				.setRequired(true))
		.toJSON(),
	
	new SlashCommandBuilder()
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
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews))
			.addRoleOption(option =>
				option.setName("ping")
				.setDescription("The role to ping when a new update is released")
				.setRequired(false))
			.toJSON(),

	new SlashCommandBuilder()
			.setName('remove')
			.setDescription('Removes a plugin from the list to check')
			.addIntegerOption(option => 
				option.setName('plugin')
					.setDescription('The plugin id')
					.setRequired(true))
			.toJSON(),

	new SlashCommandBuilder()
			.setName('list')
			.setDescription('Retrieves the list that the bot checks')
			.toJSON(),


		new SlashCommandBuilder()
			.setName('addowner')
			.setDescription('Adds all the plugins of an user to the list to check')
			.addIntegerOption(option => 
				option.setName('user')
					.setDescription('The user id')
					.setRequired(true))
			.addChannelOption(option =>
				option.setName('channel')
					.setDescription('The channel id')
					.setRequired(true)
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews))
			.addRoleOption(option =>
				option.setName("ping")
				.setDescription("The role to ping when a new update is released")
				.setRequired(false))
			.toJSON(),
		
		new SlashCommandBuilder()
			.setName('checknow')
			.setDescription('Forces the check of updates')
			.toJSON(),
		
		new SlashCommandBuilder()
			.setName('status')
			.setDescription('Retrieves the stauts of the bot')
			.toJSON(),
	]

bot.restAPI = new REST({ version: '9' }).setToken(bot.config.token);

bot.on('ready',() => {
	if (bot.config.statcord !== "") {
		const statcord = new Statcord.Client({
			key: bot.config.statcord,
			client: bot,
			postCpuStatistics: false,
			postMemStatistics: false,
			postNetworkStatistics: false
		});

		statcord.autopost();
	}

	bot.logger.info(`Logged in as ${bot.user.tag}.`)
	bot.logger.info(`You can invite the bot with the following link: https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=537151488&scope=bot%20applications.commands`)

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
				bot.restAPI.put(
					Routes.applicationGuildCommands(bot.user.id, guild.id),
						{ body: bot.commands },
					).catch((err) => bot.logger.error("Error while trying to load commands. Are you missing the Commands permission?"));
				} catch (error) {
					bot.logger.error("Error while trying to load commands. Are you missing the Commands permission?");
				}
		});

		bot.logger.info("[+] Loaded commands");
	})();

	if (bot.config.api.enabled) {
		bot.logger.info("[+] Starting API server");
		bot.pluginCount = 0;
		Plugin.count().exec().then(count => {
			bot.pluginCount = count
		});
		new Webserver(bot).start();
	}

	bot.logger.info("[+] Loaded all modules");
	bot.logger.info("[+] Ready in " + (new Date().getTime() - BOOT) / 1000 + " seconds!");
});

connect(bot.config.database, () => {
	bot.login(bot.config.token);
});