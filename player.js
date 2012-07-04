
var io = require('socket.io-client'),
    redis = require('redis');

var torch = 300;

var r = redis.createClient();
var socket = io.connect('http://localhost:2048');
var playerId ;

socket.on('playerNewId', function(id) {
                console.log("ID is: " + id);
                playerId = id;
                r.set('torch', 255, function(){});
                setInterval(playerLoop, 200);
        });

socket.emit('playerConnect', "Player", 1);

function playerLoop() {
                  
  var move = r.lpop("playerMoves", function(err, reply) {
    if(reply)
      socket.emit('playerMove', playerId, JSON.parse(reply));
  });
  
  // Let the torch glow a bit first!

  torch = torch-1;
  if(torch < 255)
    r.set('torch', torch, function(){});


}


socket.on('moveResult', function(moveResult){
  
  console.log(moveResult);

  r.set('wall', !moveResult.moveStatus, function(){});


})
        



//setInterval(function(){



//  console.log('new loop');
//}, 1000);
