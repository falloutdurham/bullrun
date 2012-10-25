// Bullserver.js - handles communication between players, display clients, and
//                 the map.

var app = require('express').createServer()
  , io = require('socket.io').listen(app),
    crypto = require('crypto'),
    GameObjects = require('./map.js');
    
var Map = GameObjects.Map;
var Player = GameObjects.Player;

var players = {};
var clients = {};
var newGame = true;
var debugMap = false;

Map.init();

app.listen(2048);

app.get('/player', function(req, res) {
  res.sendfile(__dirname + '/player.html');
});

app.get('/client', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.get('/admin', function(req, res) {
  res.sendfile(__dirname + '/admin.html');
});

io.sockets.on('connection', function (socket) {

  // playerConnect - sent on player connect. Adds it to the Map and keeps a
  // record of it for later

	socket.on('playerConnect', function(username, type) {
    if(newGame) {
      Map.init();
      newGame = false;
    }

    socket.leave('potential');
		id = createUserId(socket, 'player', username);	
    newPlayer = new Player();
    newPlayer.name = username;
    
    newPlayer.type = type;

    if(type === Player.BULL) {
      io.sockets.in('display').emit('message', "The Bull has entered!");
    } else 
      io.sockets.in('display').emit('message', username+" has entered!");
      
    
    newPlayer.id = id;
    isPlayerAdded = Map.addPlayer(newPlayer);
    players[id] = newPlayer;
    console.log(isPlayerAdded);
   
    if(debugMap)
      console.log(Map.map);

		socket.emit('playerNewId', id, Map.map, newPlayer);
    io.sockets.in('display').emit('displayUpdate', Map.map);  
    io.sockets.in('display').emit('status', players);

	});

  // displayConnect - for the displays (e.g. the durhamplay.in website)

	socket.on('displayConnect', function(username){
		id = createUserId(socket, 'display', username);	
		socket.emit('displayNewId', id, Map.map);
	});

  // playerMove - what happens on a player move. This could result in death!

	socket.on('playerMove', function(id, move) {

		if(clients.hasOwnProperty(id)) {

    
      if(players[id] && players[id].dead) {

        socket.emit('dead');
        socket.leave(socket.room);
        socket.join('potential');
        delete players[id];
        delete clients[id];
        io.sockets.in('display').emit('displayUpdate', Map.map);

        return;
      }

    var moveResult = Map.move(players[id], move[0], move[1]);

    // Send the message back to the clients/displays if present

    if(moveResult.moveMessage) {
      io.sockets.in('display').emit('message', moveResult.moveMessage);
      message(moveResult.moveMessage, socket);
    }

    socket.emit('moveResult', moveResult, Map.map, players[id]); 

		console.log(id + " has moved: " + moveResult.moveStatus);

    io.sockets.in('display').emit('displayUpdate', Map.map);
    io.sockets.in('display').emit('status', players);

   }
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

  socket.on('startNewGame', function(playerName) {
    newGame = true;
    io.sockets.in('potential').emit('pleaseJoinGame', playerName);
  });

  socket.on('available', function() {
    socket.join('potential');
  });

  socket.on('sendInTheBull', function() {
    io.sockets.in('potential').emit('enterTheBull');
  });

  socket.on('torchDecrease', function(id) {
      if(clients.hasOwnProperty(id)) {
        players[id].torch -= 1; 
        socket.emit('getTorch', players[id].torch);

        if(players[id].torch < 0) {
          // DEAD!
          players[id].dead = true;
          Map.removePlayer(players[id]);
          io.sockets.in('display').emit('message', players[id].name + " is in the dark!");
        }
      }
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

function message(newMessage, socket) {
  socket.broadcast.to('display').emit('message', newMessage);
}
