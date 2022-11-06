const WebSocket = require('ws');


// in order to handle self-signed certificates we need to turn off the validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const url = 'wss://localhost:8443';
const ws = new WebSocket(url);
console.log(`Connecting to server: ${url}`);

ws.on('open', function open() {
    ws.send('hello from client');
});

ws.on('message', function incoming(data) {
    console.log(data.toString());

    ws.close(); // Done
    console.log("Connection closed");
});

ws.addEventListener('error', (err) => console.log(err.message));