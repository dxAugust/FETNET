const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

/* Platform statistic data */
router.get('/u/:username', function (request, response) {
    if (request.params.username) {
        const rootDir = path.join(__dirname, '..');
        response.sendFile("profile.html", { root: path.join(__dirname, '../web') });
    }
});

module.exports = router;