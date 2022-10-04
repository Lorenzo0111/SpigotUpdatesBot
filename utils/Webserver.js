const rateLimit = require('express-rate-limit')
const express = require('express')

module.exports = class WebServer {
    constructor(bot) {
        this.bot = bot;
        const app = express();
        app.use(require('helmet')());
        app.use(require('cors')());
        app.use(express.json());
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10,
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res, next, options) => {
                res.status(429).json({
                    error:'Too Many Requests',
                    requests: options.store.hits[req.ip],
                    resetTime: options.windowMs
                });
            }
        });
        app.use(limiter);        
        
        app.get('/', (req, res) => {
            res.json({
                status: 'online',
                version: this.bot.version
            });
        });

        app.get('/stats', async (req, res) => {
            let members = 0;

            for (const guild of this.bot.guilds.cache.values()) {
                members += guild.memberCount;
            }

            res.json({
                servers: bot.guilds.cache.size,
                totalMembers: members,
                plugins: bot.pluginCount || 0,
                lastCheck: bot.lastCheck
            });
        });

        app.post('/topgg', async (req, res) => {
            if (!req.headers.authorization || req.headers.authorization !== bot.config.api.topgg) {
                res.status(401).json({
                    error: 'Unauthorized'
                });
                return;
            }

            const { bot: botId, user } = req.body;
            if (bot.user.id !== botId) {
                res.status(400).json({
                    error: 'Invalid bot ID'
                });
                return;
            }

            const guild = bot.guilds.cache.get(bot.config.api.guild);
            if (!guild) {
                res.status(500).json({
                    error: 'Guild not found'
                });
                return;
            }

            const member = await guild.members.fetch(user);
            
        });
        
        this.app = app;
    }

    start() {
        this.app.listen(this.bot.config.api.port);
    }
}