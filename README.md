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

