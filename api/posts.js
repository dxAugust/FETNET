const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const postsDir = path.join(__dirname, '../data/posts/');

function getUserPosts(userid)
{
    if (fs.existsSync(postsDir + `users/posts_${userid}.json`)) {
        let data = fs.readFileSync(postsDir + `users/posts_${userid}.json`, 'utf8');
        return data;
    } else {
        return { "status": "Not Found" };
    }
}

router.get('/:userid', function (request, response) {
    let banQuery = `SELECT * FROM bans WHERE banned_id='${request.params.userid}'`;
    db.get(banQuery, function(err, banRow) {
        if (banRow != undefined)
        {
            if (Date.now() > banRow.until)
            {
                response.statusCode = 200;
                response.send(getUserPosts(request.params.userid));
                return;
            } else {
                response.statusCode = 423;
            }
        } else {
            response.statusCode = 200;
            response.send(getUserPosts(request.params.userid));
            return;
        }   
    });
});

module.exports = router;