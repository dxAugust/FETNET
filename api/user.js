const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
    bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

const crypto = require('crypto');

const { lookup } = require('geoip-lite');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

/*
    Error codes:

    1 - Account not found (HTTP: 404)
    2 - Wrong password (HTTP: 401)
    3 - Username is already busy (HTTP: 401)
    4 - Not enough params (HTTP: 404)

    5 - Account was banned (HTTP: 410)
*/

router.get('/auth', function(request, response){
    let username = request.query.username.trim();
    let passMD5 = crypto.createHash('md5').update(request.query.password).digest('hex');

    let query = `SELECT * FROM users WHERE username='${username}'`;

    db.get(query, function(err, row) {
        if (typeof row != "undefined")
        {
            if (row.password == passMD5)
	    	{
				let errorObject = {};
				let key = 'data';
				errorObject[key] = [];

				let data = {
					id: row.id,
                    accessToken: row.accessToken,
					username: row.username,
					email: row.email,
					reg_ip: row.reg_ip,
                    reg_date: row.reg_date,
                    partner: row.partner,
                    role: row.role,
                    status: row.status,
                    mood: row.mood,
				};
				errorObject[key].push(data);

				response.statusCode = 200;
				response.send(JSON.stringify(errorObject));
                return;
	    	} else {
	    		let errorObject = {};
				let key = 'errorData';
				errorObject[key] = []; 

				let data = {
					code: '2'
				};
				errorObject[key].push(data);

				response.statusCode = 401;
				response.send(JSON.stringify(errorObject));
                return;
	    	}
        } else {
            let errorObject = {};
			let key = 'errorData';
			errorObject[key] = []; 

			let data = {
				code: '1'
			};
			errorObject[key].push(data);

			response.statusCode = 404;
			response.send(JSON.stringify(errorObject));
            return;
        }
    });
});

router.get('/fetch', function(request, response){
    if (request.query.username)
    {
        let username = request.query.username;
        let query = `SELECT * FROM users WHERE UPPER(username) LIKE UPPER('${username}')`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

                db.get(banQuery, function(err, banRow) {
                    let userObject = {};
                    let key = 'data';
                    userObject[key] = [];
            
                    let data = {};

                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        partner: row.partner,
                        countryCode: lookup(row.reg_ip).country,
                        mood: row.mood,
                        admin: row.admin,
                    };

                    let timeNow = Date.now();
                    let lastActivity = row.last_online;
                    let difference = timeNow - lastActivity;
        
                    let secondsBetween = difference / 1000;
                    let secondsBetweenDates = Math.abs(secondsBetween);
        
                    if (secondsBetweenDates < 300) {
                        data.online = "online";
                    } else {
                        data.online = lastActivity;
                    }

                    userObject[key].push(data);

                    if (typeof banRow != "undefined")
                    {
                        if (Date.now() > banRow.until)
                        {
                            let timeDiff = Date.now() - banRow.until;
                            let days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 

                            let banData = {
                                lastBanDays: days,
                            };
                            userObject[key].push(banData);

                            response.statusCode = 200;
                            response.send(JSON.stringify(userObject));
                            return;
                        } else {
                            response.statusCode = 423;
                            response.send();
                            return;
                        }
                    } else {
                        response.statusCode = 200;
                        response.send(JSON.stringify(userObject));
                        return;
                    }
                });
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    } else if (request.query.id) {
        let id = request.query.id;
        let query = `SELECT * FROM users WHERE id='${id}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let banQuery = `SELECT * FROM bans WHERE banned_id='${row.id}'`;

                db.get(banQuery, function(err, banRow) {
                    let userObject = {};
                    let key = 'data';
                    userObject[key] = [];
            
                    let data = {};

                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        partner: row.partner,
                        role: row.role,
                        countryCode: lookup(row.reg_ip).country,
                        status: row.status,
                        mood: row.mood,
                    };

                    let timeNow = Date.now();
                    let lastActivity = row.last_online;
                    let difference = timeNow - lastActivity;
        
                    let secondsBetween = difference / 1000;
                    let secondsBetweenDates = Math.abs(secondsBetween);
        
                    if (secondsBetweenDates < 300) {
                        data.online = "online";
                    } else {
                        data.online = lastActivity;
                    }

                    userObject[key].push(data);

                    if (typeof banRow != "undefined")
                    {
                        if (Date.now() > banRow.until)
                        {
                            let timeDiff = Date.now() - banRow.until;
                            let days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 

                            let banData = {
                                lastBanDays: days
                            };
                            userObject['banData'].push(banData);

                            response.statusCode = 200;
                            response.send(JSON.stringify(userObject));
                            return;
                        } else {
                            response.statusCode = 423;
                            response.send();
                            return;
                        }
                    } else {
                        response.statusCode = 200;
                        response.send(JSON.stringify(userObject));
                        return;
                    }
                });
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.get('/access', function(request, response){
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let errorObject = {};
                let key = 'data';
                errorObject[key] = [];
                
                let banStatus = row.banned_date;
                let data = {};

                let updateQuery = 
                `UPDATE users SET last_online='${Date.now()}' WHERE id=${row.id}`;

                db.run(updateQuery);

                if (banStatus)
                {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        status: row.status,
                        mood: row.mood,
                    };
                } else {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        status: row.status,
                        mood: row.mood,
                        banned_date: row.banned_date
                    };
                }
                errorObject[key].push(data);
    
                response.statusCode = 200;
                response.send(JSON.stringify(errorObject));
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.post('/register', function(request, response){
    if (request.query.username && request.query.password && request.query.email)
    {
        let username = request.query.username.trim();
        let query = `SELECT * FROM users WHERE UPPER(username) LIKE UPPER('${username}')`;

        if (username.length < 3)
        {
            response.statusCode = 503;
            response.send(JSON.stringify({ status: "Username should be more 3 symbols"}));
            return;
        }

        if (!(/^[A-Za-z0-9]*$/.test(username))) 
        {
            response.statusCode = 503;
            response.send(JSON.stringify({ status: "Only latin symbols in username"}));
            return;
        }

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '3'
                };
                errorObject[key].push(data);
    
                response.statusCode = 401;
                response.send(JSON.stringify(errorObject));
                return;
            } else {
                let accessToken = '';

                let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			    let charactersLength = characters.length;
			    for (let i = 0; i < 33; i++) 
			    {
			      	accessToken += characters.charAt(Math.floor(Math.random() * charactersLength));
			    }

                let passMD5 = crypto.createHash('md5').update(request.query.password).digest('hex');

                let date_ob = new Date();

                let accountQuery = 
                `INSERT INTO users VALUES (NULL, '${accessToken}', '${request.query.username}', '${request.query.email}', '${passMD5}', '${request.socket.remoteAddress.split(":")[3]}', '${date_ob.getTime()}', '${date_ob.getTime()}', '0', '', '0')`;

                db.run(accountQuery);

                var successObject = {};
				var key = 'execData';
				successObject[key] = []; 

				var data = {
					accessToken: `${accessToken}`
				};
				successObject[key].push(data);

                response.statusCode = 200;
				response.send(JSON.stringify(successObject));
                return;
            }
        });
    } else {
        let errorObject = {};
        let key = 'errorData';
        errorObject[key] = []; 
    
        let data = {
            code: '4'
        };
        errorObject[key].push(data);
    
        response.statusCode = 404;
        response.send(JSON.stringify(errorObject));
        return;
    }
});

/* User data */
router.get('/avatar/:userid', function (request, response) {
    const rootDir = path.join(__dirname, '..');

    if (fs.existsSync(rootDir + "/profiles/avatars/" + request.params.userid + ".png")) {
        response.sendFile(rootDir + "/profiles/avatars/" + request.params.userid + ".png");
    } else if (fs.existsSync(rootDir + "/profiles/avatars/" + request.params.userid + ".gif")) {
        response.sendFile(rootDir + "/profiles/avatars/" + request.params.userid + ".gif");
    } else {
        response.sendFile(rootDir + "/profiles/avatars/noname.png");
    }
});

/* User profile updates */
router.use(fileUpload());
router.post('/avatar/load/', function (request, response) {
    if (request.headers.authorization)
    {
        if (request.files && Object.keys(request.files).length !== 0) 
        {
            const uploadedFile = request.files.avatar;
            if (uploadedFile)
            {
                if (uploadedFile.size < 5242880)
                {
                    const rootDir = path.join(__dirname, '..');

                    let accessToken = request.headers.authorization;
                    let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

                    db.get(query, function(err, row) {
                        if (typeof row != "undefined")
                        {
                            const uploadedFileExtension = uploadedFile.mimetype.split("/")[1];

                            let uploadPath = "";

                            if (uploadedFileExtension === "png" 
                            || uploadedFileExtension === "jpeg" 
                            || uploadedFileExtension === "webp")
                            {
                                uploadPath = rootDir
                                    + "/profiles/avatars/" + row.id + ".png";
                            } else if (uploadedFileExtension === "gif") {
                                if (row.partner >= 1)
                                {
                                    uploadPath = rootDir
                                        + "/profiles/avatars/" + row.id + ".gif";
                                } else {
                                    response.statusCode = 409;
                                    response.send({ status: "Not enough POWER!!" });
                                    return;
                                }
                            } else {
                                response.statusCode = 418;
                                response.send({ status: "Wrong file extension" });
                                return;
                            }

                            const pngProfilePic = rootDir
                            + "/profiles/avatars/" + row.id + ".png";
                            const gifProfilePic = rootDir
                            + "/profiles/avatars/" + row.id + ".gif";
                
                            if (fs.existsSync(pngProfilePic)) {
                                fs.unlink(pngProfilePic, () => {});
                            } else if (fs.existsSync(gifProfilePic)) {
                                fs.unlink(gifProfilePic, () => {});
                            }
                            
                            try {
                                uploadedFile.mv(uploadPath, function (err) {
                                    if (err) {
                                        response.statusCode = 503;
                                        response.send({ status: "WRONG" });
                                        return;
                                    } else {
                                        response.statusCode = 200;
                                        response.send({ status: "OK" });
                                        return;
                                    }
                                });
                            } catch {

                            }
                        } else {
                            let errorObject = {};
                            let key = 'errorData';
                            errorObject[key] = []; 
                
                            let data = {
                                code: '1'
                            };
                            errorObject[key].push(data);
                
                            response.statusCode = 404;
                            response.send(JSON.stringify(errorObject));
                        }
                    });
                } else {
                    response.statusCode = 503;
                    response.send({ status: "File is too large" });
                    return;
                }
            }
        }
    }
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/update/', function (request, response) {
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                if (request.body.mood)
                {
                    if (request.body.mood.length <= 100)
                    {
                        let updateQuery = 
                        `UPDATE users SET mood='${request.body.mood}', last_online='${Date.now()}' WHERE id=${row.id}`;
                        db.run(updateQuery);
                    } else {
                        response.statusCode = 413;
                        response.send({ status: "Too long mood" });
                        return;
                    }
                }

                response.statusCode = 200;
                response.send({ status: "OK" });

                return;
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.post('/subscribe/', function (request, response) {
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let subQuery = `SELECT * FROM subscriptions WHERE sub_id='${row.id}' AND belongs_id='${request.body.subid}'`;

                db.get(subQuery, function(err, subRow) {
                    if (typeof subRow != "undefined")
                    {
                        response.statusCode = 501;
                        response.send({ status: "Already subbed" });
                        return; 
                    } else {
                        if (request.body.subid)
                        {
                            if (request.body.subid != row.id)
                            {
                                let belongQuery = `SELECT * FROM users WHERE id='${request.body.subid}'`;

                                db.get(belongQuery, function(err, belongRow) {
                                    if (typeof belongRow != "undefined")
                                    {
                                        let subsQuery = 
                                        `INSERT INTO subscriptions VALUES (NULL, '${row.id}', '${request.body.subid}', '${Date.now()}')`;
                                        db.run(subsQuery);

                                        response.statusCode = 200;
                                        response.send({ status: "Successfully subbed" });
                                        return; 
                                    } else {
                                        response.statusCode = 503;
                                        response.send({ status: "Account does not exist" });
                                        return; 
                                    }
                                });
                            } else {
                                response.statusCode = 503;
                                response.send({ status: "Can't subscribe to yourself" });
                                return; 
                            }
                        }
                    }
                });
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.post('/unsubscribe/', function (request, response) {
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let subQuery = `SELECT * FROM subscriptions WHERE sub_id='${row.id}' AND belongs_id='${request.body.subid}'`;

                db.get(subQuery, function(err, subRow) {
                    if (typeof subRow != "undefined")
                    {
                        let deleteQuery = `DELETE FROM subscriptions WHERE sub_id='${row.id}' AND belongs_id='${request.body.subid}'`;
                        db.run(deleteQuery);

                        response.statusCode = 200;
                        response.send({ status: "Successfully unsubscribed" });
                        return; 
                    } else {
                        response.statusCode = 503;
                        response.send({ status: "This is user is not subbed" });
                        return;
                    }
                });
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.post('/checksub/', function (request, response) {
    if (request.headers.authorization)
    {
        let accessToken = request.headers.authorization;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let subQuery = `SELECT * FROM subscriptions WHERE sub_id='${row.id}' AND belongs_id='${request.body.subid}'`;

                db.get(subQuery, function(err, subRow) {
                    if (typeof subRow != "undefined")
                    {
                        response.statusCode = 200;
                        response.send({ status: "Already subbed" });
                        return; 
                    } else {
                        response.statusCode = 503;
                        response.send({ status: "Not subbed" });
                        return; 
                    }
                });
            } else {
                let errorObject = {};
                let key = 'errorData';
                errorObject[key] = []; 
    
                let data = {
                    code: '1'
                };
                errorObject[key].push(data);
    
                response.statusCode = 404;
                response.send(JSON.stringify(errorObject));
                return;
            }
        });
    }
});

router.get('/sublist/:userid', function (request, response) {
    let subQuery = `SELECT * FROM subscriptions WHERE belongs_id='${request.params.userid}'`;

    db.serialize(function() {
        db.all(subQuery, function(err, subRows) {
            if (typeof subRows != "undefined")
            {
                let subData = {};
                let key = 'subdata';
                subData[key] = []; 

                let subList = [];
                subRows.forEach(subObj => {
                    subList.push(subObj.sub_id);
                });
                    
                let data = {
                    subcount: subRows.length,
                    sublist: subList
                };
                subData[key].push(data);

                response.statusCode = 200;
                response.send(JSON.stringify(subData));
                return;
            }
        });           
    });
});

router.get('/search/:username', function (request, response) {
    
});

module.exports = router;