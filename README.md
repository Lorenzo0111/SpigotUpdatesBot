![Banner](/media/banner.png)

[![Discord](https://img.shields.io/discord/1088775598337433662?label=Discord)](https://discord.gg/HT47UQXBqG)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Lorenzo0111/SpigotUpdatesBot?label=Version)](https://github.com/Lorenzo0111/SpigotUpdatesBot/releases)
[![Spigot Thread](https://img.shields.io/badge/Spigot%20Thread-here-orange)](https://www.spigotmc.org/threads/544113/)
[![Spigot Thread](https://img.shields.io/badge/Add%20to%20your%20server-here-blue)](https://to.lorenzo0111.me/sub)

## Getting started

- Run `git clone https://github.com/Lorenzo0111/SpigotUpdatesBot`
- Create a file named config.json and fill with all the options of the example.config.json
- Create a file named .env and fill with the database connection string
- Run `bun install`
- Run `bun db:push`
- Run `bun start` to start the bot

## Keep the bot online

- Install pm2 with `npm i -g pm2`
- Run `pm2 start --interpreter ~/.bun/bin/bun index.ts`

## FAQ

### What does the public option mean?

If set to true, everyone will be able to add his plugin and his server and channel to the bot, so everyone will have the ability to use it.

### What is the api option?

If enabled, the program will start a webserver on the specified port, so you can get bot stats from there.
