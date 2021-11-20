const d2gsi = require('dota2-gsi');
const exec = require('child_process').exec;
const rpc = require("discord-rpc");

const discord = new rpc.Client({ transport: 'ipc' });
const server = new d2gsi({ "port": 5505 });

let status = {
    "game": true,
    "start": Date.now(),
}

//src - https://stackoverflow.com/questions/38033127
const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32': cmd = `tasklist`; break;
        case 'darwin': cmd = `ps -ax | grep ${query}`; break;
        case 'linux': cmd = `ps -A`; break;
        default: break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

//src - https://stackoverflow.com/questions/14249506
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

function toName(name){
    name = name.replace("npc_dota_hero_", "").replace("_", " ");
    name = name[0].toUpperCase() + name.substring(1);

    return name;
};

function updatePresence(client) {
    if (status.game) {
        if (client.gamestate.player.kills >= 0) {
            if (client.gamestate.hero.name) {
                let data = {
                    "kills": client.gamestate.player.kills,
                    "deaths": client.gamestate.player.deaths,
                    "assists": client.gamestate.player.assists,
                    "level": client.gamestate.hero.level,
                    "hero": client.gamestate.hero.name
                };

                discord.request('SET_ACTIVITY', {
                    pid: process.pid,
                    activity: {
                        details: `Playing on ${toName(client.gamestate.hero.name)}`,
                        state: `${data.kills} / ${data.deaths} / ${data.assists}`,
                        timestamps: {
                            start: Date.now() - parseInt(client.gamestate.map.game_time+"000", 10)
                        },
                        assets: {
                            large_image: client.gamestate.hero.name,
                            large_text: "Hero - " + toName(client.gamestate.hero.name),
                            small_image: `gamestate_hero_level_${client.gamestate.hero.level}`,
                            small_text: `Level - ${client.gamestate.hero.level}`,
                        },
                        buttons: [
                            {
                                label: "About DotaTracker", url: "https://github.com/fxckfxtxre/DotaTracker"
                            }
                        ]
                    }
                });
            } else {
                discord.request('SET_ACTIVITY', {
                    pid: process.pid,
                    activity: {
                        details: "Drafting",
                        timestamps: {
                            start: Date.now() - parseInt(client.gamestate.map.game_time+"000", 10)
                        },
                        assets: {
                            large_image: "gamestate_action_draft",
                            large_text: "Drafting",
                        },
                        buttons: [
                            {
                                label: "About DotaTracker", url: "https://github.com/fxckfxtxre/DotaTracker"
                            }
                        ]
                    }
                });
            }
        } else {
            discord.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: {
                    details: "In menu",
                    assets: {
                        large_image: "gamestate_action_menu",
                        large_text: "Menu",
                    },
                    buttons: [
                        {
                            label: "About DotaTracker", url: "https://github.com/fxckfxtxre/DotaTracker"
                        }
                    ]
                }
            });
        }
    } else {
        discord.request('SET_ACTIVITY', {
            pid: process.pid
        });
    }
};


server.events.on('newclient', async (client) => {
    discord.login({ clientId: "911559918484594729" });

    client.on('map:game_time', (data) => {
        updatePresence(client);
    });

    while (true) {
        if (!client.gamestate.hero) {
            isRunning("dota2.exe", (open) => {
                if (open) {
                    if (status.start == 0){
                        status.start = Date.now();
                    };

                    status.game = true;
                    updatePresence(client);
                } else {
                    status.start = 0;
                    status.game = false;
                    updatePresence(client);
                }
            })
        }

        await sleep(15000);
    }
});