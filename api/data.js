const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const dialogsDir = path.join(__dirname, '../data/dialogs/');

function addLinks(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" class="chat-message-link" href="' + url + '">' + url + '</a>';
    });
}

router.get('/dialogs/:dialogid', function (request, response) {
    if (request.params.dialogid)
    {
        let data = fs.readFileSync(dialogsDir + `${request.params.dialogid}_history.json`, 'utf8');
        let jsonObject = JSON.parse(data);

        let messageList = [];

        if (jsonObject.access === "everyone") {
            for (let i = 0; i < jsonObject.messages.length; i++) {
                let query = `SELECT * FROM users WHERE id='${jsonObject.messages[i].id}'`;
                db.get(query, function(err, row) {
                    if (typeof row != "undefined")
                    {
                        let responseObject = {
                            id: row.id,
                            username: row.username,
                            text: jsonObject.messages[i].text,
                            timestamp: jsonObject.messages[i].timestamp,
                        }
    
                        messageList.push(responseObject);

                        if (i === jsonObject.messages.length - 1) {
                            messageList.sort(function(a, b) {
                                return a.timestamp - b.timestamp;
                            });

                            response.statusCode = 200;
                            response.send(messageList); 
                            return;
                        }
                    }
                });
            }
        } else {
            let members = jsonObject.access.split("|");
        }
    }
});

module.exports = router;