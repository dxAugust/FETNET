const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const ejs = require('ejs');
const cookieParser = require('cookie-parser');

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
                    userData: dataUser
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