global.Discord = require("discord.js");
global.discord = require('discord.js');
const Util = require("discord.js")
const config = require('./config.json')
//
const client = new Discord.Client()
const event_handler = require('./event');
const fs = require("fs");
require("dotenv").config();

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

//Command Handler
function getDirectories() {
    return fs.readdirSync("./commands").filter(function subFolders(file) {
        return fs.statSync("./commands/" + file).isDirectory();
    });
}
const commandFiles = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"));
for (const folder of getDirectories()) {
    const folderFiles = fs
        .readdirSync("./commands/" + folder)
        .filter((file) => file.endsWith(".js"));
    for (const file of folderFiles) {
        commandFiles.push([folder, file]);
    }
}
for (const file of commandFiles) {
    let command;
    if (Array.isArray(file)) {
        command = require(`./commands/${file[0]}/${file[1]}`);
    } else {
        command = require(`./commands/${file}`);
    }
    client.commands.set(command.name, command);
    console.log(`Command Loaded: ${command.name}`)
}

event_handler.performEvents(client);

client.login(process.env.token)
global.logs = new Discord.WebhookClient(config.logsID, config.logsToken)
client.on("channelCreate", function(channel){
    if (channel.name.includes("-ticket")) return
    const embed = new Discord.MessageEmbed()
    logs.send(`channelCreate: ${channel.name}`);
});

client.on("channelDelete", function(channel){
    if (channel.name.includes("-ticket")) return
    const embed = new Discord.MessageEmbed()
    logs.send(`channelDelete: ${channel.name}`);
});

client.on("channelUpdate", function(oldChannel, newChannel){
    if (oldChannel.name.includes("-ticket")) return
    if(oldChannel.topic != newChannel.topic){
        const oldtopic = oldChannel.topic;
        const newtopic = newChannel.topic;
        const topicchange = new Discord.MessageEmbed()
        .setTitle('A Channels topic has been changed')
        .addField('Old Channels topic', `${oldtopic || 'null'}`, true)
        .addField('New channels topic', `${newtopic || 'null'}`, true)
        .setColor('RANDOM') 
        return logs.send(topicchange);
    }  
    if(oldChannel.name != newChannel.name){
        const newname = new Discord.MessageEmbed()
        .setTitle('A Channels Name has been changed')
    .addField("Old channel Name", oldChannel.name, true)
    .addField("New Channel Name", newChannel.name, true)
    .setColor('RANDOM')
    return logs.send(newname);
    }
    const embed = new Discord.MessageEmbed()
    .setTitle('A channel has been Updated')
    .setDescription('I don\'t know what changed....')
    logs.send(embed);
});

client.on("guildBanAdd", function(guild, user){
    const embed = new Discord.MessageEmbed()
    logs.send(`a member is banned from a guild`);
});

client.on("guildBanRemove", function(guild, user){
    const embed = new Discord.MessageEmbed()
    logs.send(`a member is unbanned from a guild`);
});

client.on("guildMemberRemove", function(member){
    const embed = new Discord.MessageEmbed()
    logs.send(`a member leaves a guild, or is kicked: ${member}`);
});

client.on("messageDelete", function(message){
    if(message.author.bot) return
    if(message.author.id == '379781622704111626') return //Doing this only for now as it is pissing me off that It logs when I'm using the damn eval command
    const logd = new Discord.MessageEmbed()
		.setTitle(`Message deleted By, ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
        .addField("Channel", `<#${message.channel.id}>`)
		.setDescription(`> ${message.content}`) 
		.setFooter(`ID: ${message.author.id}`)
		.setTimestamp()
		.setColor("RED")
    logs.send(logd);
});

client.on("messageDeleteBulk", function(messages){
    const output = messages.reduce((out, msg) => {
        const attachment = msg.attachments.first();
			out += `${msg.author.tag}: ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''}${attachment ? `\r\n${attachment.url}` : ''}\r\n`;
			return out;
		}, '');
    const embed = new Discord.MessageEmbed()
      .setDescription(`${messages.size} messages bulk deleted in ${messages.first().channel}.`)
      .setColor('RANDOM')
      .setTimestamp();
      logs.send({
        embeds: [embed],
        files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
      });
  });

client.on("messageUpdate", function(oldMessage, newMessage){
    if(oldMessage.author.bot) return
    if (oldMessage.content === newMessage.content && newMessage.embeds.length<oldMessage.embeds.length) return
            if (oldMessage.content === newMessage.content && newMessage.embeds.length>oldMessage.embeds.length) return
    const log = new Discord.MessageEmbed()
        .setAuthor(`${oldMessage.author.tag}`, oldMessage.author.displayAvatarURL({ dynamic: true }))
        .setTitle(`Message Edited in #${oldMessage.channel.name}`)
        .setDescription(`**Before:** ${oldMessage.content}\n**After:** ${newMessage.content}`)
        .addField(`Message Link`, `[click here](${oldMessage.url})`)
        .setFooter(`ID: ${oldMessage.author.id}`)
        .setTimestamp()
        .setColor("YELLOW")
    logs.send(log);
});

client.on("roleCreate", function(role){
    console.log(role.permissions)
    logs.send(`New role was Made ${role.name}`);
});


client.on("roleDelete", function(role){
    const embed = new Discord.MessageEmbed()
    logs.send(`A role has been deleted ${role.name}`);
});

client.on("roleUpdate", function(oldRole, newRole){
    const embed = new Discord.MessageEmbed()
    console.log(oldRole.permissions)
    console.log('\n\n' + newRole.permissions)
    logs.send(`A role has been updated`);
});


client.on("guildMemberUpdate", (oldMember, newMember) => {
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
    const added = addedRoles.map(r => r).join(", "); 
    const removed = removedRoles.map(r => r).join(", "); 
    const embed = new Discord.MessageEmbed()
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        embed.setDescription(`${oldMember} Has goten a Role('s) Added`)
            .addField('Added', `${added}`)
            .setColor('RANDOM')
            return logs.send(embed)
    }
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        embed.setDescription(`${oldMember} Has goten a Role('s) Removed`)
            .addField('Removed', `${removed}`)
            .setColor('RANDOM')
            return logs.send(embed)
    }
    if(oldMember.displayName != newMember.displayName) {
        if(newMember.displayName.includes('darkisdumb'))
        return newMember.setNickname('why are you so mean :C')
        const newNick = new Discord.MessageEmbed()
        .setTitle('A user has a new Nickname.')
        .setDescription(`${oldMember} Has changed their NickName`)
        .addField("Old Nickname", oldMember.displayName, true)
        .addField("New Nickname", newMember.displayName, true)
        .setColor('RANDOM')
        return logs.send(newNick)
    }
})

client.on("messageReactionAdd", (reaction, user) => {
    if(user.bot) return
    let category = reaction.message.guild.channels.cache.find(c => c.id === "850558312952889374" && c.type === "category");
    if (!category) return reaction.message.reply('Please contact a Admin, The category **DarkerInk** Set doesn\'t exist and This is a problem')
    if(reaction.emoji.name == "✅" && reaction.message.id == '851713926903103499') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ptsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-dcsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-otsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)

        return reaction.message.guild.channels.create(`${user.tag}-dcsup-ticket`, {
            parent: category,
        }).then(c => {
            c.updateOverwrite(user, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true,
            });
            const embed = new Discord.MessageEmbed()
        .setTitle('Thank you for contacting support!')
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nYou reacted with ✅ meaning you need support releated to Discord support\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket\n\n<@&847600288926924831> New ticket!`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, You chose Discord Support Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
        })
    }
    if(reaction.emoji.name == "🌎" && reaction.message.id == '851713926903103499') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ptsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-dcsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-otsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)

        return reaction.message.guild.channels.create(`${user.tag}-ptsup-ticket`, {
            parent: category,
        }).then(c => {
            c.updateOverwrite(user, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true,
            });
            const embed = new Discord.MessageEmbed()
        .setTitle('Thank you for contacting support!')
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nYou reacted with 🌎 meaning you need support releated to Pterodactyl support\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket\n\n<@&847600288926924831> New ticket!`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, You chose Pterodactyl support Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
        })
    }
    if(reaction.emoji.name == "🛒" && reaction.message.id == '851713926903103499') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ptsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-dcsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-otsup-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        return reaction.message.guild.channels.create(`${user.tag}-otsup-ticket`, {
            parent: category,
        }).then(c => {
            c.updateOverwrite(user, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true,
            });
            const embed = new Discord.MessageEmbed()
        .setTitle('Thank you for contacting support!')
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nYou reacted with 🛒 meaning you need support releated to Other Support\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket\n\n<@&847600288926924831> New ticket!`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, You chose Other Support Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
        })
    }
});

// On Duty role
client.on("messageReactionAdd", async (reaction, user) => {
    if(user.bot) return
    if(reaction.emoji.name == "✅" && reaction.message.id == '851941760469041192') {
        const member = await reaction.message.guild.members.fetch(user)
        if (member.roles.cache.some(role => role.id === '847600288926924831')) {
            return reaction.message.channel.send('You are already on duty :/').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 5000))
            }
        reaction.message.channel.send(`${user}` + ' ' + 'Hey It seems like you are going On Duty, Now whenever a ticket gets opened you will be pinged.').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 5000))
        
        
            member.roles.add('847600288926924831')
    }
})

client.on("messageReactionRemove", async (reaction, user) => {
    if(user.bot) return
    if(reaction.emoji.name == "✅" && reaction.message.id == '851941760469041192') {
        const member = await reaction.message.guild.members.fetch(user)
        if (!member.roles.cache.some(role => role.id === '847600288926924831')) {
            return reaction.message.channel.send('You are already off duty :/').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 5000))
            }
        member.roles.remove('847600288926924831')
        reaction.message.channel.send(`${user}` + ' ' + 'Hey, It seems like you aren\'t on Duty anymore, Have a good rest of your day').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 5000))
    }
})

client.on("messageReactionAdd", async (reaction, user) => {
    if(user.bot) return
    if(!reaction.message.channel.name.includes('-ticket')) return
    if(reaction.emoji.name == "🔐") {
        reaction.message.channel.send("**Closing ticket.**", null).then(setTimeout(() => {
            reaction.message.channel.delete()
    }, 5000))
    }
})