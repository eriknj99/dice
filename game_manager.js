
var utils = require("./utils");
var log = require("./log")

class Session {
    constructor(id){
        this.id = id;
        this.last_communication = Date.now();
        this.color = "#c42e2eff";
        this.hot_numbers = [];
    }
}

class Roll{
    constructor(id, color){
        this.roller_id = id;
        this.roller_color = color;
        this.d1 = Math.floor(Math.random() * 6) + 1;
        this.d2 = Math.floor(Math.random() * 6) + 1;
        this.total = this.d1 + this.d2;
    }
}

let sessions = [];
let rolls = [];

module.exports = {
    get_session_index: function(session_id){
        for (let i = 0; i < sessions.length; i++) {
            if(session_id == sessions[i].id){
                return i;
            }
        }
        return -1;
    },
    new_session: function()
    {
        id = utils.makeid(32);
        s = new Session(id);
        sessions.push(s);

        log.info("New session created " + id);

        return id;
    },
    keep_alive: function(session_id)
    {
        let i = this.get_session_index(session_id);
        if(i != -1){
            sessions[i].last_communication = Date.now();
            return true;
        }

        return false;
    },
    new_roll: function(session_id)
    {
        let i = this.get_session_index(session_id);
        if(i != -1){
            rolls.push(new Roll(session_id, sessions[i].color));
        }
    },
    get_rolls: function()
    {
        return rolls;
    }, 
    new_game: function()
    {
        rolls = [];
    },
    unroll: function()
    {
        if(rolls.length != 0)
        {
            rolls.pop();
        }
    }


}


const TIMEOUT = 1000 * 10; // ms

async function manage_session_timeout() {
    while(true){
        let current_time = Date.now();

        for (let i = sessions.length - 1; i >= 0 ; i--) {
            let time_since_last = current_time - sessions[i].last_communication;
            if(time_since_last > TIMEOUT)
            {
                log.info(`Session ${sessions[i].id} ended.`);
                sessions.splice(i,1);
            }
        }

        await new Promise(r => setTimeout(r, 1000));
    }
}

manage_session_timeout();