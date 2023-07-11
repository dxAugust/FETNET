const express = require('express');
const router = express.Router(),
    bodyParser = require('body-parser');

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

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
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

router.post('/', function (request, response) {
    let getQuery = `SELECT * FROM users WHERE accessToken='${request.headers.authorization}'`;
    db.get(getQuery, function(err, row) {
        if (typeof row != "undefined")
        {
            let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;
            db.get(banQuery, function(err, banRow) {
                if (banRow != undefined)
                {
                    if (Date.now() > banRow.until)
                    {
                        if (fs.existsSync(postsDir + `users/posts_${row.id}.json`)) {
                            let data = fs.readFileSync(postsDir + `users/posts_${row.id}.json`, 'utf8');
                            let postData = JSON.parse(data);

                            postData.posts.push({
                                privacy: `${request.body.privacy}`,
                                post_body: `${request.body.postbody}`,
                                views: [],
                                timestamp: Date.now(),
                            });

                            fs.writeFileSync(postsDir + `users/posts_${row.id}.json`, JSON.stringify(postData));
                            response.statusCode = 200;
                            response.send(JSON.stringify({ redirectUser: row.username }));
                            return;
                        } else {
                            fs.closeSync(fs.openSync(postsDir + `users/posts_${row.id}.json`, 'w'));

                            let blankData = {
                                posts: [
                                    {
                                        privacy: `${request.body.privacy}`,
                                        post_body: `${request.body.postbody}`,
                                        views: [],
                                        timestamp: Date.now(),
                                    }
                                ],
                            };
                            fs.writeFileSync(postsDir + `users/posts_${row.id}.json`, JSON.stringify(blankData));
                            response.statusCode = 200;
                            response.send(JSON.stringify({ redirectUser: row.username }));
                            return;
                        }
                    } else {
                        response.statusCode = 423;
                        response.send();
                        return;
                    }
                } else {
                    if (fs.existsSync(postsDir + `users/posts_${row.id}.json`)) {
                        let data = fs.readFileSync(postsDir + `users/posts_${row.id}.json`, 'utf8');
                        let postData = JSON.parse(data);

                        postData.posts.push({
                            privacy: `${request.body.privacy}`,
                            post_body: `${request.body.postbody}`,
                            views: [],
                            timestamp: Date.now(),
                        });

                        fs.writeFileSync(postsDir + `users/posts_${row.id}.json`, JSON.stringify(postData));
                        response.statusCode = 200;
                        response.send(JSON.stringify({ redirectUser: row.username }));
                        return;
                    } else {
                        fs.closeSync(fs.openSync(postsDir + `users/posts_${row.id}.json`, 'w'));

                        let blankData = {
                            posts: [
                                {
                                    privacy: `${request.body.privacy}`,
                                    post_body: `${request.body.postbody}`,
                                    views: [],
                                    timestamp: Date.now(),
                                }
                            ],
                        };
                        fs.writeFileSync(postsDir + `users/posts_${row.id}.json`, JSON.stringify(blankData));
                        response.statusCode = 200;
                        response.send(JSON.stringify({ redirectUser: row.username }));
                        return;
                    }
                }   
            });
        } else {
            response.statusCode = 404;
            response.send();
            return;
        }
    });
});

router.get('/view/:userid/:post_id', function (request, response) {
    
});

module.exports = router;