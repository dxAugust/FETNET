const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const dialogsDir = path.join(__dirname, '../data/');

router.get('/', function (request, response) {
    
});

module.exports = router;