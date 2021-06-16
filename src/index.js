global.Discord = require("discord.js");
global.discord = require('discord.js');
const Util = require("discord.js")
const config = require('./config.json')
//
global.client = new Discord.Client()
const event_handler = require('./event');
const fs = require("fs");
require("dotenv").config();

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const db = require('quick.db')
global.nodeStatus = new db.table("nodeStatus");
require('./botchecker')
//Command Handler
function getDirectories() {
    return fs.readdirSync("./commands").filter(function subFolders(file) {
        return fs.statSync("./commands/" + file).isDirectory();
    });
}
const commandFiles = fs
    .readdirSync("./commands")
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
    const embed = new Discord.MessageEmbed()
    logs.send(`channelCreate: ${channel.name}`);
});

client.on("channelDelete", function(channel){
    logs.send(`channelDelete: ${channel.name}`);
});

client.on("channelUpdate", function(oldChannel, newChannel){
    if(oldChannel.id == '849427878914424852') return
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

client.on('roleUpdate', async (oldRole, newRole) => {
    try {
    let oldperms = oldRole.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");

    let newperms = newRole.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");
    if(oldRole.hexColor != newRole.hexColor) return logs.send('The hex has changed')
    if(oldRole.name != newRole.name) return logs.send('The name has changed')
    if(oldperms != newperms){
        if(oldperms.includes('Administrator')) oldperms = 'Administrator'
        if(newperms.includes('Administrator')) newperms = 'Administrator'
    let embed = new Discord.MessageEmbed()
        .setTitle(`${newRole.name} Has Been Updated`)
        .setDescription(`Old Permissions: ${oldperms || null}\n\nNew Permissions: ${newperms || null}`)
        .setColor('RANDOM')
       return logs.send(embed)
    }
} catch(err) {
    console.log('There was a error ' + err.stack)
}})
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
    const chalk = require('chalk')
    if(user.bot) return
    let category = reaction.message.guild.channels.cache.find(c => c.id === "853819788857573416" && c.type === "category");
    if (!category) return reaction.message.reply('Please contact a Admin, The category **DarkerInk** Set doesn\'t exist and This is a problem')
    if(reaction.emoji.name == "✅" && reaction.message.id == '853817786195509249') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)

        return reaction.message.guild.channels.create(`${user.tag}-ticket`, {
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
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nIt seems like you have to report someone, A staff member will be here shortly\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, Seems Like you need to report someone, Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
        })
    }
    //red sky maybe.....
    if(reaction.emoji.id == "849844404235927613" && reaction.message.id == '853817786195509249') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)

        return reaction.message.guild.channels.create(`${user.tag}-ticket`, {
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
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nSeems Like you need help with Red sky.. Or maybe just got to report something, anyway a staff member will be here shortly\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, Seems like you need help with Red Sky, Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
        })
    }
    if(reaction.emoji.id == "853817178687143956" && reaction.message.id == '853817786195509249') {
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        if (reaction.message.guild.channels.cache.find(channel => channel.name === `${user.username.toLowerCase()}${user.discriminator}-ticket`)) return reaction.message.channel.send('You already have a ticket open').then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000)) && reaction.users.remove(user)
        return reaction.message.guild.channels.create(`${user.tag}-ticket`, {
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
        .setDescription(`Hello, ${user} and thanks for contacting support!\n\nnSeems Like you need help with Blue sky.. Or maybe just got to report something, anyway a staff member will be here shortly\n\nPress 🔐 To close the ticket`)
        .setTimestamp()
        .setFooter(`${user.id}`)
        .setColor('GREEN')
        c.send(`${user}, This Is your ticket`, embed)
        .then(m => m.react('🔐'))
            reaction.users.remove(user);
            reaction.message.channel.send(`<@${user.id}>, Seems like you need help with Blue Sky Please check <#${c.id}> for your ticket`).then(m => client.setTimeout(() => { if(!m.deleted) m.delete() }, 10000))
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

client.on("messageReactionAdd", async (reaction, user) => {
    if(user.bot) return
    if(!reaction.message.channel.name.includes('-ticket')) return
    if(reaction.emoji.name == "🔐") {
        reaction.message.channel.send("**Closing ticket.**", null).then(setTimeout(() => {
            reaction.message.channel.delete()
    }, 5000))
    }
})

//🤖 📜 📢 🔔
client.on("messageReactionAdd", async (reaction, user) => {
    if(user.bot) return
    const member = await reaction.message.guild.members.fetch(user)
    if(reaction.message.id == '853182789918785556') {
    reaction.users.remove(user)
    }
    //Start Of Ping reaction
    if (member.roles.cache.some(role => role.id === '853182789918785556')) {
        member.roles.remove('853178948639916042')
        return user.send('You have removed `Ping`')
        }
        if(reaction.emoji.name == "🔔" && reaction.message.id == '853182789918785556') {
            member.roles.add('853178948639916042')
            return user.send('You have been given `Ping`')
        }
        //End Of ping reaction && Start of Bot update reaction
        if(reaction.emoji.name == "🤖" && reaction.message.id == '853182789918785556') {
            if (member.roles.cache.some(role => role.id === '853178823615709194')) {
                member.roles.remove('853178823615709194')
                return user.send('You have removed `Bot Updates`')
                }
            member.roles.add('853178823615709194')
            return user.send('You have been given `Bot Updates`')
        }
        //End Of Bot update reaction && Start of change logs reaction
        if(reaction.emoji.name == "📢" && reaction.message.id == '853182789918785556') {
            if (member.roles.cache.some(role => role.id === '853178919057752094')) {
                member.roles.remove('853178919057752094')
                return user.send('You have removed `Beta Updates`')
                }
            member.roles.add('853178919057752094')
            return user.send('You have been given `Beta Updates`')
        }
        //End Of change logs reaction && Start of Beta Updates reaction
        if(reaction.emoji.name == "📜" && reaction.message.id == '853182789918785556') {
            if (member.roles.cache.some(role => role.id === '853178846157602837')) {
                member.roles.remove('853178846157602837')
                return user.send('You have removed `Change Logs`')
                }
            member.roles.add('853178846157602837')
            return user.send('You have been given `Change Logs`')
        }
})