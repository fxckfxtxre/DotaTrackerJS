const d2gsi = require('dota2-gsi');
const exec = require('child_process').exec;

const server = new d2gsi({"port": 5505});

let status = {
    "game": true,
}

//src - https://stackoverflow.com/questions/38033127
const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
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
}

function updatePresence(client){
    if (status.game){
        if (client.gamestate.player.kills >= 0){
            if (client.gamestate.hero.name){
                let data = {
                    "kills": client.gamestate.player.kills,
                    "deaths": client.gamestate.player.deaths,
                    "assists": client.gamestate.player.assists,
                    "level": client.gamestate.hero.level,
                    "hero": client.gamestate.hero.name
                };

                console.log(data);
            }else{
                console.log("!hero")
            }
        }else{
            console.log("menu");
        }
    }else{
        console.log("!game")
    }
}

server.events.on('newclient', async (client) => {
    client.on('map:game_time', (data) => {
        updatePresence(client);
    });

    while (true){
        if (!client.gamestate.map){
            isRunning("dota2.exe", (open) => {
                if (open){
                    status.game = true;
                    updatePresence(client);
                }else{
                    status.game = false;
                    updatePresence(client);
                }
            })
        }
        //console.log(status);
        await sleep(1000);
    }

    
});