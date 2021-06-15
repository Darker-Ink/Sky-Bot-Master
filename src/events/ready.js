
module.exports = {
    type: 'ready',
    run: async (client) => {
        await client.channels.cache.get("853162581527363628").messages.fetch('853817786195509249');
        await client.channels.cache.get("853182275876814858").messages.fetch('853182789918785556');
            setInterval(async () => {
                const msg = await client.channels.cache.get("853161255514669076").messages.fetch('853562179827662889');
                const channel = client.channels.cache.get('853161255514669076')
        let blue = nodeStatus.get('bluesky'.toLowerCase()).status
        if(blue === true) blue = `<:green:849844528680796200> Running`
        if(blue === false) blue = `<:red:849844404235927613> Offline`
    let red = nodeStatus.get('redsky'.toLowerCase()).status
    if(red === true) red = `<:green:849844528680796200> Running`
    if(red === false) red = `<:red:849844404235927613> Offline`
    if(red === null) red = `<:orange:849844491342839868> ERROR`
    if(blue === null) blue = `<:orange:849844491342839868> ERROR`
    let wood = nodeStatus.get('woodbot'.toLowerCase()).status
    //let wood = 'installing'
    if(wood === true) wood = `<:green:849844528680796200> Running`
    if(wood === false) wood = `<:red:849844404235927613> Offline`
    if(wood === null) wood = `<:orange:849844491342839868> ERROR`
    if(wood == 'installing') wood = `<:orange:849844491342839868> Installing`
    let antihoist = nodeStatus.get('antihoist'.toLowerCase()).status
    //let antihoist = 'installing'
    if(antihoist === true) antihoist = `<:green:849844528680796200> Running`
    if(antihoist === false) antihoist = `<:red:849844404235927613> Offline`
    if(antihoist === null) antihoist = `<:orange:849844491342839868> ERROR`
    if(antihoist == 'installing') antihoist = `<:orange:849844491342839868> Installing`
    let yellow = nodeStatus.get('yellowsky'.toLowerCase()).status
    //let yellow = 'installing'
    if(yellow === true) yellow = `<:green:849844528680796200> Running`
    if(yellow === false) yellow = `<:red:849844404235927613> Offline`
    if(yellow === null) yellow = `<:orange:849844491342839868> ERROR`
    if(yellow == 'installing') yellow = `<:orange:849844491342839868> Installing`
    //Blue Sky's ID
    let bluestatus = client.users.cache.get('682090006151561233').presence.status
    //Red Sky's ID
    let redstats = client.users.cache.get('745156348844441610').presence.status
    //Friends Bot idk if I even spelt that right I need to go to sleep
    let darknetstats = client.users.cache.get('234448407408803841').presence.status
    //Yellow Sky's ID
    let yellowstats = client.users.cache.get('745906240886013982').presence.status
    //Woodbot's ID
    let woodstatus = client.users.cache.get('829519175290322975').presence.status
    //antihoisters ID
    let antihoiststatus = client.users.cache.get('829519175290322975').presence.status
    //If they are online or offline it will show a emoji you pick
    if(bluestatus == 'online') bluestatus = `<:green:849844528680796200>Online`
    if(bluestatus == 'offline') bluestatus = `<:red:849844404235927613> Offline`
    if(redstats == 'online') redstats = `<:green:849844528680796200> Online`
    if(redstats == 'offline') redstats = `<:red:849844404235927613> Offline`
    if(darknetstats == 'online') darknetstats = `<:green:849844528680796200> Online`
    if(darknetstats == 'offline') darknetstats = `<:red:849844404235927613> Offline`
    if(yellowstats == 'online') yellowstats = `<:green:849844528680796200>Online`
    if(yellowstats == 'offline') yellowstats = `<:red:849844404235927613> Offline`
    if(woodstatus == 'online') woodstatus = `<:green:849844528680796200>Online`
    if(woodstatus == 'offline') woodstatus = `<:red:849844404235927613> Offline`
    if(antihoiststatus == 'online') antihoiststatus = `<:green:849844528680796200>Online`
    if(antihoiststatus == 'offline') antihoiststatus = `<:red:849844404235927613> Offline`
    //The message for the custom live status
    const embed = new Discord.MessageEmbed()
    .setTitle('Discord Bot statuses')
    .addField('Bots Servers', `Blue Server: ${blue}\nRed Server: ${red}\nYellow Server: ${yellow}\nWIP: ${antihoist}\nWIP: ${wood}`)
    .addField('Bots Stats', `Blue Sky: ${bluestatus}\nRed Sky: ${redstats}\nYellow Sky: ${yellowstats}\nWoodBot: ${woodstatus}\nDarkNet: ${darknetstats}\nWIP: ${antihoiststatus}`)
    .setColor('GREEN')
    let messages = await channel.messages.fetch({
        limit: 10
    })
    messages = messages.filter(x => x.author.id === client.user.id).last();
            if (messages == null) channel.send(embed)
            else messages.edit(embed)
    
            }, 6000)
            //The messages for the bots status
        let statuses = [
            `Users Talk`,
            `People get Banned`
	]
    client.pvc = new Discord.Collection();
        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)]
            client.user.setActivity(status, {
                type: `WATCHING`,
            });
        }, 15000)
    },
};