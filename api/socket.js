const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const path = require('path');
const fs = require('fs');

function addLinks(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a target="_blank" class="chat-message-link" href="' + url + '">' + url + '</a>';
    });
}

let rules = [
    { expression: /&/g, replacement: '&amp;' }, // keep this rule at first position
    { expression: /</g, replacement: '&lt;' },
    { expression: />/g, replacement: '&gt;' },
    { expression: /"/g, replacement: '&quot;' },
    { expression: /'/g, replacement: '&#039;' } // or  &#39;  or  &#0039;
];
function escapeHtml(html) {
    var result = html;
    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];
        result = result.replace(rule.expression, rule.replacement);
    }
    return result;
}

function placeMentions(messageText) {
    let message = messageText;
    let messageWords = message.split(" ");

    for (let i = 0; i < messageWords.length; i++) {
        if (messageWords[i].startsWith("@") && messageWords[i].substring(1).length > 0) {
            messageWords[i] = '<a class="chat-message-user-mention" href="/u/' + messageWords[i].substring(1) + '">' + messageWords[i] + '</a>';
        }
    }

    message = messageWords.join(" ");
    return message;
}

function markDownMessage(message) {
    let finalMessage = escapeHtml(message);
    finalMessage = addLinks(finalMessage);
    finalMessage = placeMentions(finalMessage);

    return finalMessage;
}

function addMessageToHistory(messageObject) {
    fs.readFile(`${dialogsDir + 'murchalka_history.json'}`, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data);
            obj.messages.push({
                id: messageObject.id,
                text: messageObject.message,
                timestamp: Date.now()
            });
            json = JSON.stringify(obj);
            fs.writeFile(`${dialogsDir + 'murchalka_history.json'}`, json, 'utf8', () => { });
        }
    });
}

function sendMessage(messageObject) {
    let accessToken = messageObject.accessToken;
    let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

    db.get(query, function (err, row) {
        if (typeof row != "undefined") {
            let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

            db.get(banQuery, function (err, banRow) {
                if (typeof banRow != "undefined") {
                    if (Date.now() > banRow.until) {
                        let responseObject = {
                            id: row.id,
                            username: row.username,
                            text: markDownMessage(messageObject.message),
                            timestamp: Date.now(),
                        }

                        if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(messageObject.message)) {

                        } else {
                            if (messageObject.attachment) {
                                responseObject.text = responseObject.text + ` <img class="attachment-item-img" src="../../api/data/attachment/murchalka/${messageObject.attachment}">`;
                            }
                            io.emit("chat-message-emit", responseObject);
                            addMessageToHistory({ id: row.id, message: responseObject.text });
                        }
                    }
                } else {
                    let responseObject = {
                        id: row.id,
                        username: row.username,
                        text: markDownMessage(messageObject.message),
                        timestamp: Date.now(),
                    }

                    if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(messageObject.message)) {

                    } else {
                        if (messageObject.attachment) {
                            responseObject.text = responseObject.text + ` <img class="attachment-item-img" src="../../api/data/attachment/murchalka/${messageObject.attachment}">`;
                        }
                        io.emit("chat-message-emit", responseObject);
                        addMessageToHistory({ id: row.id, message: responseObject.text });
                    }
                }
            });
        }
    });
}

const dialogsDir = path.join(__dirname, '../data/dialogs/');

let io;
exports.socketConnection = (server) => {
    io = require('socket.io')(server);
    io.on('connection', (socket) => {
        socket.on('chat-message', (msg) => {
            let messageObject = JSON.parse(msg);

            if (messageObject.message.length > 0 && messageObject.message.trim() && messageObject.message.length < 250) {
                sendMessage(messageObject);
            } else if (messageObject.attachment) {
                sendMessage(messageObject);
            }
        });

        socket.on('chat-message:typing', (msg) => {
            let messageObject = JSON.parse(msg);

            if (messageObject.message.length > 0 && messageObject.message.trim() && messageObject.message.length < 250) {
                let accessToken = messageObject.accessToken;
                let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

                db.get(query, function (err, row) {
                    if (typeof row != "undefined") {
                        let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

                        db.get(banQuery, function (err, banRow) {
                            if (typeof banRow != "undefined") {
                                if (Date.now() > banRow.until) {

                                }
                            } else {

                            }
                        });
                    }
                });
            }
        });
    });
};