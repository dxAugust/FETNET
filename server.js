const express = require('express');
const router = express.Router();
const app = express();

let http = require('http');
let https = require('https');

let path = require('path');

let fs = require('fs');

const serverConfig = require("./config.js");
const customConsole = require("./utils/console.js");

/* API ROUTES */
const API_ROOT = "/api";

const userRoute = require("./api/user.js");
app.use(API_ROOT + '/user', userRoute);

const serviceRoute = require("./api/service.js");
app.use(API_ROOT + '/service', serviceRoute);
/* ------------ */

if (serverConfig.web) {
    const profilesRoute = require("./api/u.js");
    app.use('/', profilesRoute);

    let publicdir = __dirname + '/web';

    app.use(function(req, res, next) {
    if (req.path.indexOf('.') === -1) {
        let file = publicdir + req.path + '.html';
        fs.exists(file, function(exists) {
        if (exists)
            req.url += '.html';
        next();
        });
    }
    else
        next();
    });
    app.use(express.static(publicdir), router);

    app.get('*', function(request, response){
        response.statusCode = 404;
        response.sendFile("404.html", { root: path.join(__dirname, '/web') });
    });
}

let httpServer = null;

if (serverConfig.https)
{
    let options = {};

    if (fs.existsSync(path.join(__dirname,'./cert/key.pem')) 
        || fs.existsSync(path.join(__dirname,'./cert/cert.pem')))
    {
        options = {
            key: fs.readFileSync(path.join(__dirname,'./cert/key.pem')),
            cert: fs.readFileSync(path.join(__dirname,'./cert/cert.pem'))
        }

        console.log(
            `${customConsole.BgGreen + customConsole.FgWhite} SSL ${customConsole.BgBlack + customConsole.FgGreen} SSL Certificate connected`);
    } else {
        console.log(
        `${customConsole.BgRed + customConsole.FgWhite} SSL ${customConsole.BgBlack + customConsole.FgRed} SSL Certificate not found`);
    }
    

    httpServer = https.createServer(options, app).listen(serverConfig.port);
} else {
    httpServer = http.createServer(app).listen(serverConfig.port);
}

if (httpServer.listening)
{
    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}

httpServer.on('connection', function (client) {
    if (serverConfig.debugMode)
    {
        console.log(
            `${customConsole.BgBlue + customConsole.FgWhite} SERVER ${customConsole.BgBlack + customConsole.FgBlue} Connected user (${client.remoteAddress.split(":")[3] ? client.remoteAddress.split(":")[3] : "localhost"})`
        );
    }
});