const rateLimit = require('express-rate-limit')

module.exports = class WebServer {
    constructor(bot) {
        this.bot = bot;
        const app = require('express')();
        app.use(require('helmet')());
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
                totalMembers: members
            });
        });
        
        this.app = app;
    }

    start() {
        this.app.listen(this.bot.config.api.port);
    }
}