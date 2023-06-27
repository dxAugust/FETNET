const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

router.get('/', function (request, response) {
    if (request.query.term) {
        const rootDir = path.join(__dirname, '..');
        response.sendFile("search.html", { root: path.join(__dirname, '../web') });
    } else {
        const rootDir = path.join(__dirname, '..');
        response.sendFile("search.html", { root: path.join(__dirname, '../web') });
    }
});

module.exports = router;