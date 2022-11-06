// imports for fs
const fs = require('fs');
const path = require('path');
// imports for http
const http = require('http');
// imports for https
const https = require('https');

//return the contents of the sslcert folder
const sslcert = fs.readdirSync(path.join(__dirname, 'sslcert'));
console.log(sslcert);

var privateKey = fs.readFileSync(path.join(__dirname, 'sslcert', 'key.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, 'sslcert', 'cert.pem'), 'utf8');

var credentials = { key: privateKey, cert: certificate };
var express = require('express');
var app = express();

//... bunch of other express stuff here ...

//pass in your express app and credentials to create an https server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    server: httpsServer
});



wss.on('connection', function connection(ws) {
    console.log("Reply to handshake request. Ok lets switch to websocket")
    ws.on("open", () => console.log("Opened ws con!!!"))
    ws.on("close", () => console.log("CLOSED ws con!!!"))
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});