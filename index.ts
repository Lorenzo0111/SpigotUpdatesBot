const BOOT = new Date().getTime();

import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { ChannelType, Routes } from "discord-api-types/v10";
import { ActivityType, Client, IntentsBitField } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import type { Config, ExtendedClient } from "./types";
import Logger from "./utils/Logger";
import Webserver from "./utils/Webserver";
import prisma from "./lib/prisma";

const bot: ExtendedClient = new Client({
  presence: {
    status: "online",
    activities: [
      {
        name: `SpigotMC`,
        type: ActivityType.Watching,
      },
    ],
  },
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildEmojisAndStickers,
  ],
}) as ExtendedClient;

bot.version = "1.3";
bot.config = JSON.parse(readFileSync("config.json", "utf-8")) as Config;
bot.logger = new Logger(console.log);

bot.commands = [
  new SlashCommandBuilder()
    .setName("plugin")
    .setDescription("Retrieves the information of a plugin")
    .addStringOption((option) =>
      option
        .setName("plugin")
        .setDescription("The plugin name")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("add")
    .setDescription("Adds a plugin to the list to check")
    .addIntegerOption((option) =>
      option.setName("plugin").setDescription("The plugin id").setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel id")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
    )
    .addRoleOption((option) =>
      option
        .setName("ping")
        .setDescription("The role to ping when a new update is released")
        .setRequired(false)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a plugin from the list to check")
    .addIntegerOption((option) =>
      option.setName("plugin").setDescription("The plugin id").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("list")
    .setDescription("Retrieves the list that the bot checks")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("addowner")
    .setDescription("Adds all the plugins of an user to the list to check")
    .addIntegerOption((option) =>
      option.setName("user").setDescription("The user id").setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel id")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
    )
    .addRoleOption((option) =>
      option
        .setName("ping")
        .setDescription("The role to ping when a new update is released")
        .setRequired(false)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("checknow")
    .setDescription("Forces the check of updates")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Retrieves the stauts of the bot")
    .toJSON(),
];

bot.restAPI = new REST({ version: "9" }).setToken(bot.config.token);

bot.on("ready", () => {
  bot.logger.info(`Logged in as ${bot.user?.tag}.`);
  bot.logger.info(
    `You can invite the bot with the following link: https://discord.com/api/oauth2/authorize?client_id=${
      bot.user!.id
    }&permissions=537151488&scope=bot%20applications.commands`
  );

  readdirSync("modules")
    .map((mod) => {
      bot.logger.info("[+] Loaded " + mod);
      return `./modules/${mod}`;
    })
    .map((mod) => require(mod))
    .forEach((mod) => mod.default(bot));

  (async () => {
    bot.guilds.cache.forEach((guild) => {
      try {
        bot.restAPI
          .put(Routes.applicationGuildCommands(bot.user!.id, guild.id), {
            body: bot.commands,
          })
          .catch((err) =>
            bot.logger.error(
              "Error while trying to load commands. Are you missing the Commands permission?"
            )
          );
      } catch (error) {
        bot.logger.error(
          "Error while trying to load commands. Are you missing the Commands permission?"
        );
      }
    });

    bot.logger.info("[+] Loaded commands");
  })();

  if (bot.config.api.enabled) {
    bot.logger.info("[+] Starting API server");
    bot.pluginCount = 0;
    prisma.plugin.count().then((count) => {
      bot.pluginCount = count;
    });
    new Webserver(bot).start();
  }

  bot.logger.info("[+] Loaded all modules");
  bot.logger.info(
    "[+] Ready in " + (new Date().getTime() - BOOT) / 1000 + " seconds!"
  );
});

prisma.$connect().then(() => {
  bot.login(bot.config.token);
});
