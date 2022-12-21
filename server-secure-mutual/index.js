const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// Read the server's private key and self-signed certificate from the filesystem
const serverKey = fs.readFileSync('server-key.pem');
const serverCert = fs.readFileSync('server-cert.pem');


// Create an HTTPS server that uses mutual authentication
const server = https.createServer({
    key: serverKey,
    cert: serverCert,
    rejectUnauthorized: true // The server uses a self-signed certificate
});

// Create a WebSocket server by attaching it to the HTTPS server
const wss = new WebSocket.Server({ server });

// Handle incoming WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('Client connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    // Close
    ws.on('close', function close() {
        console.log('Client disconnected');
    });
    // Send message to client every 5 seconds
    setInterval(function timeout() {
        ws.send('Server message');
    }
        , 5000);
});

// Start the WebSocket server
server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});

