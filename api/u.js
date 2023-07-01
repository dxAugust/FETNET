const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const postsDir = path.join(__dirname, '../data/posts/');

router.use(cookieParser());
router.get('/u/:username', function (request, response) {
    if (request.params.username) {
        let username = request.params.username;
        let query = `SELECT * FROM users WHERE UPPER(username) LIKE UPPER('${username}')`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

                let dataUser = {
                    id: row.id,
                    username: row.username,
                    mood: row.mood,
                    sub_until: row.sub_until,
                    name_color: row.name_color,
                    last_online: row.last_online,
                };

                let pageData = {
                    userData: dataUser,
                    postData: []
                }

                if (fs.existsSync(postsDir + `users/posts_${row.id}.json`)) {
                    let data = fs.readFileSync(postsDir + `users/posts_${row.id}.json`, 'utf8');
                    pageData.postData = JSON.parse(data);
                } else {
                    fs.closeSync(fs.openSync(postsDir + `users/posts_${row.id}.json`, 'w'));

                    let blankData = {
                        posts: [],
                    };
                    fs.writeFileSync(postsDir + `users/posts_${row.id}.json`, JSON.stringify(blankData));
                }

                db.get(banQuery, function(err, banRow) {
                    if (typeof banRow != "undefined")
                    {
                        if (Date.now() > banRow.until)
                        {
                            let timeDiff = Date.now() - banRow.until;
                            let days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
                            pageData.banData = {
                                lastBanDays: days
                            };
                            response.render(path.join(__dirname, '../web/account/profilepages/profile.ejs'), pageData);
                        } else {
                            response.render(path.join(__dirname, '../web/account/profilepages/profileBan.ejs'));
                        }
                    } else {
                        response.render(path.join(__dirname, '../web/account/profilepages/profile.ejs'), pageData);
                    }
                });
                
            } else {
                response.render(path.join(__dirname, '../web/account/profilepages/profileNotExist.ejs'));
            }
        });
    }
});

router.get('/uid/:userid', function (request, response) {
    if (request.params.userid) {
        let query = `SELECT * FROM users WHERE id='${request.params.userid}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let dataUser = {
                    id: row.id,
                    username: row.username,
                    mood: row.mood,
                    sub_until: row.sub_until,
                    name_color: row.name_color,
                    last_online: row.last_online,
                };

                let pageData = {
                    userData: dataUser
                }

                response.render(path.join(__dirname, '../web/account/profile.ejs'), pageData);
            } else {

            }
        });
    }
});

module.exports = router;