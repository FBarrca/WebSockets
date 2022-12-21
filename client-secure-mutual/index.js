const fs = require('fs');
const WebSocket = require('ws');

// Read the client's private key and certificate from the filesystem
const clientKey = fs.readFileSync('client-key.pem');
const clientCert = fs.readFileSync('client-cert.pem');

// Connect to the WebSocket server using mutual authentication
const ws = new WebSocket('wss://localhost:8080', {
    key: clientKey,
    cert: clientCert,
    passphrase: 'Stemy',
    rejectUnauthorized: false // The server uses a self-signed certificate
});

// Handle incoming messages from the server
ws.on('message', function incoming(message) {
    console.log('received: %s', message);
});

// Handle errors
ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

// Handle connection open
ws.on('open', function open() {
    ws.send('hello server!');
});

// Send a message to the server every 5 seconds
setInterval(function timeout() {
    ws.send('Client message');
}, 5000);

// Handle connection close
ws.on('close', function close() {
    console.log('WebSocket closed');
});
