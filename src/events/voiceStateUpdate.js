const transliterate = require('transliteration');
        client.on("voiceStateUpdate", async (oldV, newV) => {
    let guild = newV.guild;

    if(oldV.channelID === newV.channelID) return;
    if (oldV.channelID != null && oldV.channelID != "853932441684803604" && oldV.channel.parentID === "853932245482733598") {
        if (client.pvc.get(oldV.channelID) != null && client.pvc.get(oldV.channelID).owner == oldV.member.id) {
            oldV.channel.delete();
            client.pvc.delete(oldV.channelID);
        }
    }

    if (newV.channelID === "853932441684803604") {
        let cleanName = transliterate.slugify(newV.member.user.username);
        if (guild.channels.cache.find(channel => channel.name === `${cleanName}'s Room`)) return
        if (cleanName == '') cleanName = 'unknown';
        let vc = await guild.channels.create(`${cleanName}'s Room`, {
            type: "voice",
        })
        vc.setParent("853932245482733598");
        vc.overwritePermissions([
                {
                   id: newV.member.id,
                   allow: ["SPEAK", "STREAM", "CONNECT", "VIEW_CHANNEL"],
                },
                {
                    id: guild.id,
                    deny: ["CONNECT", "VIEW_CHANNEL"],
                    allow: ["SPEAK", "STREAM"],
                 },
              ])
        newV.setChannel(vc.id);
        if(newV.id === newV.member.id && newV.serverMute) newV.setMute(false);
        client.pvc.set(vc.id, {
            channelID: vc.id,
            owner: newV.member.id
        })
    }
})