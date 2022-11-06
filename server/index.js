const http = require("http");
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

// function sendevery5seconds(){

// connection.send(`Message ${Math.random()}`);

// setTimeout(sendevery5seconds, 5000);

// }