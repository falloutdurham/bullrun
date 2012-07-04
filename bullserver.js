var app = require('express').createServer()
  , io = require('socket.io').listen(app),
    crypto = require('crypto'),
    GameObjects = require('./map.js');
    
var Map = GameObjects.Map;
var Player = GameObjects.Player;

var players = {};
var clients = {};

var debugMap = false;

//Map.init([[0,0,0], 
 //          [0,9,2],
  //         [0,1,9]]);

Map.init();

app.listen(2048);

app.get('/player', function(req, res) {
  res.sendfile(__dirname + '/player.html');
});

app.get('/client', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});


io.sockets.on('connection', function (socket) {

  // playerConnect - sent on player connect. Adds it to the Map and keeps a
  // record of it for later

	socket.on('playerConnect', function(username, type) {
		id = createUserId(socket, 'player', username);	
    newPlayer = new Player(username);
    
    newPlayer.type = type;
    
    newPlayer.id = id;
    isPlayerAdded = Map.addPlayer(newPlayer);
    players[id] = newPlayer;
    console.log(isPlayerAdded);
    if(isPlayerAdded)

    if(debugMap)
      console.log(Map.map);

		  socket.emit('playerNewId', id, Map.map);

	});

  // displayConnect - for the displays (e.g. the durhamplay.in website)

	socket.on('displayConnect', function(username){
		id = createUserId(socket, 'display', username);	
		socket.emit('displayNewId', id, Map.map);
	});

  // playerMove - what happens on a player move. This could result in death!

	socket.on('playerMove', function(id, move) {
		if(clients.hasOwnProperty(id)) {

    var moveResult = Map.move(players[id], move[0], move[1]);

    // depending on moveResult.contents, fire a new event to the clients
    // Events:
    // Move
    // Dead
    // Escape
    // Pickup

    socket.emit('moveResult', moveResult, Map.map); 



		console.log(id + " has moved: " + moveResult.moveStatus);
    if(debugMap)
      console.log(Map.map);
		//socket.broadcast.to('display').emit('displayUpdate', move, id, clients[id]);}
    socket.broadcast.to('display').emit('displayUpdate', Map.map);}
	});

	socket.on('disconnect', function() {
		console.log("Oh no, "+socket.username+" is leaving!");

    // Remove from lists and map

    Map.removePlayer(players[socket.playerId]);
    if(debugMap)
    console.log(Map.map);

		if(socket.room)
		  socket.leave(socket.room);

	});

});

function createUserId(socket, type, username) {

	newId = crypto.createHash('md5').update(""+(new Date()).getTime()).digest('hex');
  		socket.username = username;
      socket.playerId = newId;
                clients[newId] = username;
		socket.join(type);
		socket.room = type;
                console.log(username + " has connected!");
		return newId;

}
