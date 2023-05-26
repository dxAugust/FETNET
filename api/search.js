const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

router.get('/', function (request, response) {
    if (request.query.term) {
        console.log(request.query.term);

        response.send(`PENIS`);
        response.statusCode = 200;
        return;
    }
});

module.exports = router;