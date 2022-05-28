#!/usr/bin/node

const HTTP = require("http");
const WEBSOCKET = require("websocket").server;
const PORT = 1657;

console.clear();
console.log("PONG BATTLE ROYALE...Starting Server...");

let http_server = HTTP.createServer((req, res) => {
  res.end();
});

http_server.listen(PORT);

let conn1;
let conn2;

//Spectators Setup
let spectators = [];
let started = false;
let currentSpectator = 3;

const WEBSOCKET_SERVER = new WEBSOCKET({
  httpServer: http_server,
});

WEBSOCKET_SERVER.on("request", (req) => {
	if (conn1 == undefined) {
		conn1 = req.accept(null, req.origin);
	
		conn1.send('{"player_num":1}');
	
		console.log("Player 1 Connected");
	
		conn1.on("message", (msg) => {
			conn2.send(msg.utf8Data);
			console.log("Player1", msg);
			spectators.forEach(function(element,index,array){
				element.send(msg.utf8Data);
			});
		});
	} else if (conn2 == undefined) {
		conn2 = req.accept(null, req.origin);

		conn2.send('{"player_num":2}');
		console.log("Player 2 Connected");

		conn2.on("message", (msg) => {
			conn1.send(msg.utf8Data);
			spectators.forEach(function(element,index,array){
				element.send(msg.utf8Data);
			});
			console.log("Player2", msg);
		});
		
		setTimeout(() => {
			let msg = '{"start":true}';
			conn1.send(msg);
			conn2.send(msg);
			started = true
			spectators.forEach(function(element,index,array){
				element.send(msg);
			});
		}, 5000);
	} else {
		let conn_n = req.accept(null,req.origin);
		conn_n.send('{"player_num":'+currentSpectator+'}');
		if(started){
		conn_n.send('{"start":true}');
		}
		console.log("Spectator " + currentSpectator + " connected");
		currentSpectator++;
		spectators.push(conn_n);
	}
});
