# Sockettes

> Smoothly choreograph your WebSocket connections

A WebSocket wrapper which will only allow one WebSocket connection per browser session (no matter how many tabs). All browser tabs will communicate through the WebSocket on the designated "master" tab.

If one tab tries to close a WebSocket while other tabs are still using it, the WebSocket will remain open. Only until all tabs call `close` will the WebSocket actually be closed no matter which tab actually is maintaining the WebSocket connection.

It uses the [crosstab library](https://github.com/tejacques/crosstab) under the covers for browser tab communication.

## Usage

```
npm install sockettes --save
```

### Hello, World Example

```js
import Sockette from "sockettes";

var socket = new Sockette("wss://myurl.example.com/");

socket.addListener("opened", () => {
	console.log("socket is opened");

	socket.send({
		hello: "world"
	}); //this will be JSON serialized and sent to the server
});

socket.addListener("closed", () => console.log("socket is closed"));

socket.addListener("message", msg => console.log(msg)); //JSON from the server is parsed

socket.open();
```

Run that example with multiple tabs open (and connected to a websocket server that will respond appropriately) and watch how only one tab actually maintains the websocket connection.

The `Sockette` class is an `EventEmitter` (specifically an [`EventEmitter3`](https://github.com/primus/eventemitter3)), so you can use any of `addListener`, `on`, `once`, `removeListener`, etc. on the `Sockette` instance.

### Auto-reconnecting WebSocket Example

```js
import Sockette from "sockettes";

var socket = new Sockette("wss://myurl.example.com/");

socket.addListener("opened", () => console.log("socket is opened"));

socket.addListener("closed", () => {
	console.log("socket is closed; reconnecting");
	socket.open();
});

socket.open();
setTimeout(() => socket.close(), 5000);
```

Only one browser tab will reconnect to the server after the connection is closed. All tabs, however, will log to the console as if each tab had its own connection.
