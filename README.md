# WebSockets

Learning about Websockets

## Background: Hisory

### HHTP 1.0

Client opens TCP connection to server.

Request/Response: Client sends a request to the server, the server responds with a response.

We need to open and close a connection for each request/response. WE ARE KILLING THE PERFORMANCE

### HTTP 1.1

We can keep the TCP connection open, and send multiple requests/responses over the same connection.

This is called a persistent connection.

This is a big improvement, but there are some applications where we need to send data to the client without the client asking for it. For example, a chat application.

### WebSockets

WebSockets is a protocol that allows us to send data from the server to the client without the client asking for it.

Some possible applications:

- Chat
- Live updates
- Multiplayer games
- Show client real-time data. (Download progress, etc)

How it works:

- Client opens a TCP connection to the server.
- WebSockets handshake: Client sends a request to the server, the server responds with a response. Client asks the server to upgrade the connection to a WebSocket connection. Server respods wether it can/ wants to upgrade the connection.
- **WebSockets connection**: Client and server can now send data to each other without the other asking for it.
  They convert into a binary protocol, which is more efficient than HTTP.
- Client and server can close the connection.

## WebSockets handshake

There are two versions ws:// and wss://. The difference is that wss:// over TLS.

The handshake is a HTTP request/response.
This is what happens:

### Client sends a request

- Client sends a HTTP request to the server.
  GET 1.1 UPGRADE (i want to upgrade the http 1.1 connection to a websocket connection)

```http
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The `Sec-WebSocket-Key` is a random string that the server will use to generate a response. The server will generate a response by concatenating the key with a magic string, and then hashing the result with SHA-1. The server will then base64 encode the result, and send it back to the client.
This is **just a ramdom string**. It is not a password, a key, or a secret. It is just a random string.

### Server responds with a response

Server responds with a HTTP response.

- HTTP/1.1 101 Switching Protocols (i am switching the protocol to websocket)

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

```

- HTTP/1.1 400 Bad Request (i can't upgrade the connection to websocket)

```http
HTTP/1.1 400 Bad Request
```

## WebSockets Server

To understand the basics of WebSockets, we are going to create a simple server using Node.js and the ws module.

```javascript
cconst http = require("http");
const WebSocketServer = require("websocket").server
let connection = null;

//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer((req, res) =>
    console.log("we have received a request"))

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
    "httpServer": httpserver
})


httpserver.listen(8080, () => console.log("My server is listening on port 8080"))


//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request => {

    connection = request.accept(null, request.origin)
    console.log("Reply to handshake request. Ok lets switch to websocket")
    connection.on("open", () => console.log("Opened ws con!!!"))
    connection.on("close", () => console.log("CLOSED ws con!!!"))
    connection.on("message", message => {

        console.log(`Received message ${message.utf8Data}`)
        connection.send(`got your message: ${message.utf8Data}`)
    })


    //use connection.send to send stuff to the client 
    // sendevery5seconds();


})
```

The `websocket.on('request'` is the most important part of the server. This is where we handle the connection requests.

- `request.accept(null, request.origin)` accepts the request. The first parameter is the protocols. We are not using protocols, so we pass null. The second parameter is the origin. We are not using it, so we pass request.origin.
  We are responding to the handshake request with a response that says we are going to upgrade the connection to a websocket connection.

## WebSockets Client

As a client, we are going to use the browser. We are going to use the browser's, just open the developer tools.

```javascript
let ws = new WebSocket("ws://localhost:8080"); // create the websocket connection

ws.onmessage = message => console.log(`Received msg from server ${message.data}`)
```

## WSS WebSockets Secure

The internet is sketchy and full of bad people. We need to encrypt our connection to make sure that no one is listening to our conversation.

Credits to this [guy](https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server), should go to heaven.

WSS is a secure version of WS. It uses TLS to encrypt the connection. Both the client and the server need to have a certificate. When a connection is established, the client and the server will exchange certificates to verify each other.
 
We want to have a **symmetric key**. Meaning it can be used to encrypt and decrypt. Therfore, we can use the same key on the client and the server to communicate bidirectionally.

We cant send this key over the internet, because it would defeat the whole purpose of encryption. 

The solution is to use **public key encription**. Now each client and server has a **public key** and a **private key**. The public key is shared with everyone, and the private key is kept secret. 

If you encrypt a message with the public key, only the private key can decrypt it. If you encrypt a message with the private key, only the public key can decrypt it.


### How the handshake works with public key encryption

To create a symetric key, we are going to use the **Diffie-Hellman key exchange**. This is a protocol that allows two parties to create a symmetric key without sending it over the internet.

- Client sends a request to the server. Hey i want to comunicate with you privately!!
- Server responds with a response. Ok, lets do it. **Here is my public key.** 

- Client takes the public key and encrypts the symmetric key with it. And sends it to the server. 

- Server decrypts the symmetric key with its private key. And now they both have the same symmetric key. Hooray!

Summary:

- **Public key**: This is the key that is shared with the other party. It is used to encrypt data.

- **Private key**: This is the key that is kept secret. It is used to decrypt data. 

This is called **Private key encryption**. The private key is used to decrypt data that was encrypted with the public key.

**There is still one problem.** How do we know that the public key we are receiving is the real public key of the server? How do we know that the server is not sending us a fake public key?

We need some sort of authority to verify the public key. This is where **certificates** come in.
## Certificates
 A certificate is a file that contains the public key of a server. It also contains some information about the server. The certificate is signed by a **certificate authority**.
 
  The certificate authority is a trusted third party that verifies the identity of the server. The certificate authority signs the certificate with its own private key. The certificate authority's public key is shared with everyone. The client can use the certificate authority's public key to verify the certificate. If the certificate is valid, then the client knows that the public key is the real public key of the server.

  ## How to create a certificate

  We are going to use the openssl library to create a certificate. 

  ```bash
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes
  ```
  - `-x509` - This is the type of certificate we are creating. We are creating a **self signed certificate**. This is a certificate that is signed by itself. This is not a good idea in production, but it is good enough for our purposes.
  - `-newkey rsa:2048` - This is the type of key we are creating. We are creating a 2048 bit RSA key.
  - `-keyout key.pem` - This is the name of the file that will contain the **private key.**

  - `-out cert.pem` - This is the name of the file that will contain the **certificate.**

  - `-days 100` - This is the number of days that the certificate will be valid for.

  - `-nodes` - This is a flag that tells openssl to not encrypt the private key. This is not a good idea in production, but it is good enough for our purposes.

## WSS Server

It is very similar to the WS server. The only difference is that we need to pass the certificate and the private key to the server. 

```javascript
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
```
## WSS Client

The client is very similar to the WS client. The only difference is that we need to pass the certificate to the client.

As the certificate we are using is self signed, we need to tell the client to not reject the certificate. 

```javascript
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
```