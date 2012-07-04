
var io = require('socket.io-client')

var socket = io.connect('http://localhost:2048');
var playerId ;
    socket.emit('playerConnect', "bull", "BULL");

        socket.on('playerNewId', function(id) {
                console.log("ID is: " + id);
                playerId = id;
        });

setInterval(function(){
  console.log('new loop');
}, 1000);
