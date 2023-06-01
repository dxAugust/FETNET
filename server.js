const express = require('express'),
    bodyParser = require('body-parser');

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

const dataRoute = require("./api/data.js");
app.use(API_ROOT + '/data', dataRoute);

const postsRoute = require("./api/posts.js");
app.use(API_ROOT + '/posts', postsRoute);

const searchRoute = require("./api/search.js");
app.use('/search', searchRoute);
/* ------------ */

/* WEBSOCKET SERVER */
const { socketConnection } = require('./api/socket.js');
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

let httpsServer = null;
let httpServer = null;

if (serverConfig.https)
{
    let options = {
        pfx: fs.readFileSync(path.join(__dirname,'./cert/test_cert.pfx')),
        passphrase: 'login9226',
    };

    console.log(
        `${customConsole.BgGreen + customConsole.FgWhite} SSL ${customConsole.BgBlack + customConsole.FgGreen} SSL Certificate connected`);

    httpServer = http.createServer(app).listen(8081);
    httpsServer = https.createServer(options, app).listen(serverConfig.port);
    socketConnection(httpsServer);
} else {
    httpServer = http.createServer(app).listen(serverConfig.port);
    socketConnection(httpServer);
}

if (httpServer.listening)
{
    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}