require('dotenv').config()

const Roll = require('./roll.js')
// const CoreSQL = require('./coreSQL.js')
const SQLite = require("better-sqlite3");
const sql = new SQLite("./scores.sqlite");

const { Client, Intents } = require('discord.js')



const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.once('ready', () => {
    console.log('BOT ON')
    
    client.tblExists = sql.prepare("SELECT COUNT(*) cnt FROM sqlite_master WHERE type = 'table' AND name = ?");

    if (client.tblExists.get('discord_user').cnt <= 0) {
        sql.prepare("CREATE TABLE discord_user (id INTEGER PRIMARY KEY, user_name TEXT)").run();
        sql.prepare("CREATE UNIQUE INDEX discord_user_pk ON discord_user (id)").run();
    } else if(client.tblExists.get('user_roll').cnt <= 0) {
        sql.prepare("CREATE TABLE user_roll (id INTEGER PRIMARY KEY, id_user INTEGER, value INTEGER, insert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(id_user) REFERENCES discord_user(id))").run();
        sql.prepare("CREATE UNIQUE INDEX user_roll_pk ON user_roll (id)").run();
        sql.prepare("CREATE INDEX user_roll_user_fk1 ON user_roll (id_user)").run();
    } else if(client.tblExists.get('character').cnt <= 0) {
        sql.prepare("CREATE TABLE character (id INTEGER PRIMARY KEY, name TEXT, class TEXT, sex TEXT, age TEXT, insert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)").run();
        sql.prepare("CREATE UNIQUE INDEX character_pk ON character (id)").run();
    } else if(client.tblExists.get('character_stat').cnt <= 0) {
        sql.prepare("CREATE TABLE character_stat (id INTEGER PRIMARY KEY, id_character INTEGER, ww INTEGER, us INTEGER, sw INTEGER,  insert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(id_character) REFERENCES character(id))").run();
        sql.prepare("CREATE UNIQUE INDEX character_stat_pk ON character_stat (id)").run();
        sql.prepare("CREATE UNIQUE INDEX character_stat_character_fk1 ON character_stat (id_character)").run();
    } else if(client.tblExists.get('user_character_map').cnt <= 0) {
        sql.prepare("CREATE TABLE user_character_map (id INTEGER PRIMARY KEY, id_user INTEGER, id_character INTEGER, FOREIGN KEY(id_user) REFERENCES discord_user(id), FOREIGN KEY(id_character) REFERENCES character(id))").run();
        sql.prepare("CREATE UNIQUE INDEX user_character_map_pk ON user_character_map (id)").run();
        sql.prepare("CREATE UNIQUE INDEX user_character_map_character_fk1 ON user_character_map (id_user)").run();
        sql.prepare("CREATE UNIQUE INDEX user_character_map_user_fk2 ON user_character_map (id_character)").run();
    }

    // And then we have two prepared statements to get and set the score data.
    client.setUser = sql.prepare("INSERT OR REPLACE INTO discord_user (user_name) VALUES (?)");
    client.getUser = sql.prepare("SELECT * FROM discord_user WHERE user_name = ?");

    client.setUserRoll = sql.prepare("INSERT INTO user_roll (id_user, value) VALUES (?, ?)");
    client.getUserRolls = sql.prepare("SELECT value FROM user_roll WHERE id_user = ?");
    client.delUserRolls = sql.prepare("DELETE FROM user_roll WHERE id_user = ?");
    client.calcUserRolls = sql.prepare("SELECT COUNT(*) cnt, SUM(value) sum, AVG(value) avg  FROM user_roll WHERE id_user = ? ");

    client.setCharacter = sql.prepare("INSERT INTO character (name, class, sex, age) VALUES (?, ?, ?, ?)");
    client.getCharacter = sql.prepare("SELECT * FROM character WHERE name = ?");

    client.setCharacter = sql.prepare("INSERT INTO character (name, class, sex, age) VALUES (?, ?, ?, ?)");
    client.getCharacter = sql.prepare("SELECT * FROM character WHERE name = ?");
    
});

client.on('messageCreate', async msg => {
    client.setUser.run(msg.author.username)


    if(msg.content.startsWith('!roll')) {
        var rollValue = new Roll().roll(msg.content)
        var User = client.getUser.get(msg.author.username)

        client.setUserRoll.run(User.id, rollValue)

        msg.reply(User.id + '. ' + User.user_name + ': '  + rollValue) 
    }else if(msg.content.startsWith('!getRolls')) {
        var User = client.getUser.get(msg.author.username)
        
        msg.reply(User.user_name + ' Rolls: ' + client.getUserRolls.all(User.id).map((row) =>  row.value).join(', '))
    }else if(msg.content.startsWith('!delRolls')) {
        var User = client.getUser.get(msg.author.username)
        client.delUserRolls.run(User.id)

        msg.reply(User.user_name + ' All History of Rolls is Deleted') 
    }else if(msg.content.startsWith('!cntRolls')) {
        var User = client.getUser.get(msg.author.username)

        msg.reply(User.user_name + ' Current History of Rolls is: ' + client.calcUserRolls.get(User.id).cnt) 
    }else if(msg.content.startsWith('!sumRolls')) {
        var User = client.getUser.get(msg.author.username)

        msg.reply(User.user_name + ' Current History of Rolls is: ' + client.calcUserRolls.get(User.id).sum) 
    }else if(msg.content.startsWith('!sumRolls')) {
        var User = client.getUser.get(msg.author.username)

        msg.reply(User.user_name + ' Current History of Rolls is: ' + client.calcUserRolls.get(User.id).avg) 
    }
})



client.login(process.env.DISCORD_WH_TOKEN)