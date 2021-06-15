let stats = {
    bluesky: {
        serverID: '365c7cec'
    },
    redsky: {
        serverID: '8a1f412a'
    },
    woodbot: {
        serverID: '92cf5ac8'
    },
    antihoist: {
        serverID: '58aef5b2'
    },
    yellowsky: {
        serverID: '1c26eb22'
    }
}
const axios = require('axios');
const chalk = require('chalk')
console.log(chalk.magenta('[Nodes Checker] ') + chalk.green("Enabled and Online"));
setInterval(() => {
    
    //Public nodes
    for (let [node, data] of Object.entries(stats)) {
        setTimeout(() => {
            axios({
                url: 'https://panel.danbot.host' + "/api/client/servers/" + data.serverID + "/resources",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + process.env.apikey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(response => {
                let statusss = response.data.attributes.current_state
                if(statusss == 'running'){
               return nodeStatus.set(node, {
                    timestamp: Date.now(),
                    status: true,
                    is_vm_online: true
                })
                } else if(statusss == 'offline') {
                    return nodeStatus.set(node, {
                        timestamp: Date.now(),
                        status: false,
                        is_vm_online: true
                    })
                }
            }).catch((e) => nodeStatus.set(node, {
                timestamp: Date.now(),
                status: null,
                is_vm_online: false
            }));
                }, 800)
            }
        }, 10000)