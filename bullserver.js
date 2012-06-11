var app = require('express').createServer()
  , io = require('socket.io').listen(app),
    crypto = require('crypto'),
    GameObjects = require('./map.js');
    
var Map = GameObjects.Map;
var Player = GameObjects.Player;

var players = {};
var clients = {};


Map.init([[0,0,0], 
           [0,9,2],
           [0,1,9]]);


app.listen(2048);

app.get('/player', function(req, res) {
  res.sendfile(__dirname + '/player.html');
});

app.get('/client', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});


io.sockets.on('connection', function (socket) {
	socket.on('playerConnect', function(username) {
		id = createUserId(socket, 'player', username);	
    newPlayer = new Player(username);
    newPlayer.id = id;
    isPlayerAdded = Map.addPlayer(newPlayer);
    players[id] = newPlayer;
    console.log(isPlayerAdded);
    if(isPlayerAdded)

      console.log(Map.map);

		  socket.emit('playerNewId', id);

	});

	socket.on('displayConnect', function(username){
		id = createUserId(socket, 'display', username);	
		socket.emit('displayNewId', id);
	});

	socket.on('playerMove', function(id, move) {
		if(clients.hasOwnProperty(id)) {

    var moveResult = Map.move(players[id], move[0], move[1]);

		console.log(id + " has moved: " + moveResult.moveStatus);
    console.log(Map.map);
		socket.broadcast.to('display').emit('update', move, id, clients[id]);}
	});

	socket.on('disconnect', function() {
		console.log("Oh no, "+socket.username+" is leaving!");
		if(socket.room)
		  socket.leave(socket.room);

	});

});

function createUserId(socket, type, username) {

	newId = crypto.createHash('md5').update(""+(new Date()).getTime()).digest('hex');
  		socket.username = username;
                clients[newId] = username;
		socket.join(type);
		socket.room = type;
                console.log(username + " has connected!");
		return newId;

}
