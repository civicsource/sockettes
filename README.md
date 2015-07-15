# Sockettes

> Smoothly choreograph your WebSocket connections

A WebSocket wrapper which will only allow one WebSocket connection per browser session (no matter how many tabs). All browser tabs will communicate through the WebSocket on the designated "master" tab.

It uses the [crosstab library](https://github.com/tejacques/crosstab) under the covers for browser tab communication.

## Usage

```
npm install sockettes --save
```

```js
import Sockette from "sockettes";

var socket = new Sockette("wss://myurl.example.com/");

socket.addListener("opened", () => console.log("socket is opened"));
socket.addListener("closed", () => console.log("socket is closed"));
socket.addListener("message", msg => console.log("socket received message: " + msg));

socket.open();
socket.send({
	hello: "world"
}); //this will be JSON serialized and sent to the server

setTimeout(() => socket.close(), 5000);
```

Run that example with multiple tabs open (and connected to a websocket server that will respond appropriately) and watch how only one tab actually maintains the websocket connection.
