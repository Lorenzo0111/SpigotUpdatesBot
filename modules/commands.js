const fs = require('fs');
const commands = new Map();

fs.readdirSync('commands')
.map(mod => `../commands/${mod}`)
.map(mod => require(mod))
.forEach(mod => commands.set(mod.name, mod));

module.exports = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = interaction.commandName;
    
        if (!commands.has(command)) return;
    
        try {
            commands.get(command).executor(client,interaction);
        } catch (error) {
            console.error(error);
        }
    });
}