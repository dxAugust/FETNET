const express = require('express');
const fileUpload = require("express-fileupload");
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const dialogsDir = path.join(__dirname, '../data/dialogs/');
const attachmentDir = path.join(__dirname, '../data/attachment/');

function addLinks(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" class="chat-message-link" href="' + url + '">' + url + '</a>';
    });
}
router.use(fileUpload());
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
                        let banQuery = `SELECT * FROM bans WHERE banned_id='${jsonObject.messages[i].id}'`;

                        let responseObject = {
                            id: row.id,
                            username: row.username,
                            text: jsonObject.messages[i].text,
                            timestamp: jsonObject.messages[i].timestamp,
                        }

                        db.get(banQuery, function(err, banRow) {
                            if (typeof banRow != "undefined")
                            {
                                if (Date.now() > banRow.until)
                                {
                                    messageList.push(responseObject);
                                }
                            } else {
                                messageList.push(responseObject);
                            }

                            if (i === jsonObject.messages.length - 1) {
                                messageList.sort(function(a, b) {
                                    return a.timestamp - b.timestamp;
                                });
    
                                response.statusCode = 200;
                                response.send(messageList); 
                                return;
                            }
                        });
                    }
                });
            }
        } else {
            let members = jsonObject.access.split("|");
        }
    }
});

router.post('/attachment/:chatid', function (request, response) {
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        if (request.files && Object.keys(request.files).length !== 0) 
        {
            db.get(query, function(err, row) {
                if (typeof row != "undefined")
                {
                    let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;
                    db.get(banQuery, function(err, banRow) {
                        if (typeof banRow == "undefined")
                        {
                            let attachFile = fs.readFileSync(attachmentDir + `${request.params.chatid}/attachments_data.json`, 'utf8');
                            let attachData = JSON.parse(attachFile);
                            attachData.attachments_count++;

                            const uploadedFile = request.files.attachment;
                            if (uploadedFile)
                            {
                                if (uploadedFile.size < 8388608)
                                {
                                    const uploadedFileExtension = uploadedFile.mimetype.split("/")[1];
                                    let uploadPath = "";

                                    let extension = "";

                                    if (uploadedFileExtension === "png" 
                                    || uploadedFileExtension === "jpeg" 
                                    || uploadedFileExtension === "webp")
                                    {
                                        uploadPath = attachmentDir + `${request.params.chatid}/` + attachData.attachments_count + ".jpg";
                                    } else if (uploadedFileExtension === "gif") {
                                        uploadPath = attachmentDir + `${request.params.chatid}/` + attachData.attachments_count + ".gif";
                                    }

                                    try {
                                        uploadedFile.mv(uploadPath, function (err) {
                                            if (err) {
                                                response.statusCode = 503;
                                                response.send({ status: "WRONG" });
                                                return;
                                            } else {
                                                response.statusCode = 200;
                                                response.send({ status: "OK", attachmentid: attachData.attachments_count});
                                                return;
                                            }
                                        });
                                    } catch {
        
                                    }
                                }
                            }

                            let finalAttachData = JSON.stringify(attachData);
                            fs.writeFile(attachmentDir + `${request.params.chatid}/attachments_data.json`, finalAttachData, 'utf8', () => {});
                        } 
                    });
                }
            });
        }
    }
});

router.get('/attachment/:chatid/:attachmentid', function (request, response) {
    const rootDir = path.join(__dirname, '..');

    if (fs.existsSync(rootDir + "/data/attachment/" + request.params.chatid + "/" + request.params.attachmentid + ".jpg")) {
        response.sendFile(rootDir + "/data/attachment/" + request.params.chatid + "/" + request.params.attachmentid + ".jpg");
    } else if (fs.existsSync(rootDir + "/data/attachment/" + request.params.chatid + "/" + request.params.attachmentid + ".gif")) {
        response.sendFile(rootDir + "/data/attachment/" + request.params.chatid + "/" + request.params.attachmentid + ".gif");
    } else {
        response.send({ "status": "Not Found" });
    }
});

module.exports = router;