# SpigotUpdatesBot
[![Discord](https://img.shields.io/discord/737993529795674182?label=Discord)](https://discord.gg/ZXM2Az8)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Lorenzo0111/SpigotUpdatesBot?label=Version)](https://github.com/Lorenzo0111/SpigotUpdatesBot/releases)
[![Spigot Thread](https://img.shields.io/badge/Spigot%20Thread-here-orange)](https://www.spigotmc.org/threads/544113/)


## Getting started
  - Run `git clone https://github.com/Lorenzo0111/SpigotUpdatesBot`
  - Create a file named config.js and fill with all the options of the example.config.js
  - Run `yarn install`
  - Run `yarn loadConfig`
  - Run `yarn start` to start the bot

## Keep the bot online
  - Install pm2 with `npm i -g pm2`
  - Run `pm2 start index.js`

## Editing the configuration file
> Remember to not edit the config.json directly, use the config.js file instead.

  - Edit the config.js file
  - Run `yarn loadConfig` to load the configuration file

## FAQ
### When does the public option mean?
  If set to true, everyone will be able to add his plugin and his server and channel to the bot, so everyone will have the ability to use it.