const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

function addLinks(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" class="chat-message-link" href="' + url + '">' + url + '</a>';
    })
}

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

                        let responseObject = {
                            id: row.id,
                            username: row.username,
                            text: addLinks(messageObject.message),
                        }
    
                        if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(messageObject.message))
                        {
                            
                        } else {
                            io.emit("chat-message-emit", responseObject);
                        }
                    } else {
                        
                    }
                });
            }
        });
    });
};