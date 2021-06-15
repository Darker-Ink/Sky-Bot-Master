const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'ping',
    description: null,
    usage: null,
    category: null,
    aliases: null,
    run: async (client, message, args, config) => {
        let embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Ping")
        .setDescription(`API Latency: ${Math.round(client.ws.ping)}ms`)
        .setTimestamp()
    message.channel.send(embed)
    }}