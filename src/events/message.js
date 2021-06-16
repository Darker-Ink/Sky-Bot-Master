module.exports = {
    type: 'message',
    run: async (client, message) => {
        const prefix = '=';
        const config = require('../config.json')
        if (!message.content.startsWith(prefix)) return;

            //if (!message.member) message.member = await message.guild.fetchMember(message);
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            if (cmd.length === 0) return;
            global.command = client.commands.get(cmd);
                if (!command) command = client.commands.find((command) => command.aliases && command.aliases.includes(cmd));
                if (!command) return;
            if (command.ownerOnly && !config.owners.includes(message.author.id)) {
                return
            }
            if (command)
            try {
                let blacklisted = [
                    '853161259683282944'
                ]
                if ((blacklisted.includes(message.channel.id)) && (message.member.roles.cache.find(r => r.id === '853161224355053598') == null)) return
                command.run(client, message, args, config);
            } catch(err){
                message.channel.send(err.stack)
            }
        }}