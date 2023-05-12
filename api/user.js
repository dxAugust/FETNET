const express = require('express');
const router = express.Router();

const crypto = require('crypto');

const { lookup } = require('geoip-lite');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

/*
    Error codes:

    1 - Account not found
    2 - Wrong password
    3 - Username is already busy
    4 - Not enough params
*/

router.get('/auth', function(request, response){
    let username = request.query.username;
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
                    banned_date: row.banned_date
				};
				errorObject[key].push(data);

				response.statusCode = 200;
				response.send(JSON.stringify(errorObject));

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
});

router.get('/fetch', function(request, response){
    if (request.query.username)
    {
        let username = request.query.username;
        let query = `SELECT * FROM users WHERE UPPER(username) LIKE UPPER('${username}')`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let errorObject = {};
                let key = 'data';
                errorObject[key] = [];
    
                let banStatus = row.banned_date;
                let data = {};

                if (banStatus)
                {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        countryCode: lookup(row.reg_ip).country,
                        status: row.status,
                        mood: row.mood
                    };
                } else {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        countryCode: lookup(row.reg_ip).country,
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
            }
        });
    } else if (request.query.id) {
        let id = request.query.id;
        let query = `SELECT * FROM users WHERE id='${id}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let errorObject = {};
                let key = 'data';
                errorObject[key] = [];

                let banStatus = row.banned_date;
                let data = {};

                if (banStatus)
                {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        countryCode: lookup(row.reg_ip).country,
                        status: row.status,
                        mood: row.mood
                    };
                } else {
                    data = {
                        id: row.id,
                        username: row.username,
                        reg_date: row.reg_date,
                        last_online: row.last_online,
                        partner: row.partner,
                        role: row.role,
                        countryCode: lookup(row.reg_ip).country,
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
            }
        });
    }
});

router.get('/info', function(request, response){
    if (request.query.accessToken)
    {
        let accessToken = request.query.accessToken;
        let query = `SELECT * FROM users WHERE accessToken='${accessToken}'`;

        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let errorObject = {};
                let key = 'data';
                errorObject[key] = [];
                
                let banStatus = row.banned_date;
                let data = {};

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
            }
        });
    }
});

router.post('/register', function(request, response){
    if (request.query.username && request.query.password && request.query.email)
    {
        let username = request.query.username;
        let query = `SELECT * FROM users WHERE UPPER(username) LIKE UPPER('${username}')`;

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
    
                response.statusCode = 200;
                response.send(JSON.stringify(errorObject));
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
                let date = ("0" + date_ob.getDate()).slice(-2);
                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();

                let hours = date_ob.getHours();
                let minutes = date_ob.getMinutes();
                let seconds = date_ob.getSeconds();
                let regDate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

                let accountQuery = 
                `INSERT INTO users VALUES (NULL, '${accessToken}', '${request.query.username}', '${request.query.email}', '${passMD5}', '${request.socket.remoteAddress.split(":")[3]}', '${regDate}', '${regDate}', '0', '0', '', '')`;

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
    
        response.statusCode = 200;
        response.send(JSON.stringify(errorObject));
    }
});

module.exports = router;