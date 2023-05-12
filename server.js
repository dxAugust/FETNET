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

/* ------------ */

if (serverConfig.web) {
    app.use(express.static(__dirname + '/web'), router);
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