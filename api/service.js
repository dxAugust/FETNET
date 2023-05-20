const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

/* Platform statistic data */
router.get('/stats', function (request, response) {
    let query = `SELECT last_online FROM users`;

    let responseObject = {
        online: 0,
        dayOnline: 0,
        monthlyOnline: 0,
        registered: 0,
    };

    db.all(query, function (err, rows) {
        rows.forEach(function (row) {  
            if (typeof row != "undefined") {
                responseObject.registered++;
    
                let timeNow = Date.now();
                let lastActivity = row.last_online;
                let difference = timeNow - lastActivity;
    
                let secondsBetween = difference / 1000;
                let secondsBetweenDates = Math.abs(secondsBetween);
    
                if (secondsBetweenDates < 300) {
                    responseObject.online++;
                } 
                
                if (secondsBetweenDates < 86400) {
                    responseObject.dayOnline++;
                }

                if (secondsBetween < 2592000)
                {
                    responseObject.monthlyOnline++;
                }
            }
        });
        response.statusCode = 200;
        response.send(JSON.stringify(responseObject)); 
    });
});

module.exports = router;