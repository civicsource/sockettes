import { Server } from "ws";

var server = new Server({
	port: 3789
});

server.on("connection", function connection(conn) {
	conn.on("message", msg => {
		console.log('received: %s', msg);
	});

	server.send("something");
});
