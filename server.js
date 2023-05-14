const express = require('express');
const router = express.Router();
const app = express();

let http = require('http');

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

    let fs = require('fs');
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
}

const httpServer = http.createServer(app).listen(serverConfig.port);

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
        customConsole.printColoredMessage(
            `[INFO] Connected user (${client.remoteAddress.split(":")[3] ? client.remoteAddress.split(":")[3] : "localhost"})`,
            customConsole.BgBlack,
            customConsole.FgGray
        );
    }
});