const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const path = require('path');
const fs = require('fs');

function addLinks(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" class="chat-message-link" href="' + url + '">' + url + '</a>';
    });
}

function addMessageToHistory(messageObject)
{
    fs.readFile(`${dialogsDir + 'murchalka_history.json'}`, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        obj = JSON.parse(data);
        obj.messages.push({
            id: messageObject.id, 
            text: addLinks(messageObject.message), 
            timestamp: Date.now()
        });
        json = JSON.stringify(obj);
        fs.writeFile(`${dialogsDir + 'murchalka_history.json'}`, json, 'utf8', () => {});
    }});
}

const dialogsDir = path.join(__dirname, '../data/dialogs/');

let io;
exports.socketConnection = (server) => {
    io = require('socket.io')(server);
    io.on('connection', (socket) => {
        socket.on('chat-message', (msg) => {
            let messageObject = JSON.parse(msg);
    
            if (messageObject.message.length > 0 && messageObject.message.length < 250)
            {
                let accessToken = messageObject.accessToken;
                let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;
    
                db.get(query, function(err, row) {
                    if (typeof row != "undefined")
                    {
                        let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

                        db.get(banQuery, function(err, banRow) {
                            if (typeof banRow != "undefined")
                            {
                                if (Date.now() > banRow.until)
                                {
                                    let responseObject = {
                                        id: row.id,
                                        username: row.username,
                                        text: addLinks(messageObject.message),
                                        timestamp: Date.now(),
                                    }
                
                                    if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(messageObject.message))
                                    {
                                        
                                    } else {
                                        io.emit("chat-message-emit", responseObject);
                                        addMessageToHistory({id: row.id, message: messageObject.message});
                                    }
                                }
                            } else {
                                let responseObject = {
                                    id: row.id,
                                    username: row.username,
                                    text: addLinks(messageObject.message),
                                    timestamp: Date.now(),
                                }
            
                                if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(messageObject.message))
                                {
                                    
                                } else {
                                    io.emit("chat-message-emit", responseObject);
                                    addMessageToHistory({id: row.id, message: messageObject.message});
                                }
                            }
                        });
                    }
                });
            }
        });
    });
};