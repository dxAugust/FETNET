const express = require('express');
const fileUpload = require("express-fileupload");
const router = express.Router();

const path = require('path');
const fs = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

router.post('/ban/:userid', function (request, response) {
    
});

module.exports = router;