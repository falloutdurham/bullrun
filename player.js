
var io = require('socket.io-client'),
    redis = require('redis');

var torch = 300;

var r = redis.createClient();
var socket = io.connect('http://localhost:2048');
var playerId ;


socket.on('playerNewId', function(id) {
                playing = true;
                console.log("ID is: " + id);
                playerId = id;
                r.set('torch', 255, function(){});
                torch = 300;
                setInterval(playerLoop, 200);
        });



socket.on('pleaseJoinGame', function(playerName){
  socket.emit('playerConnect', playerName, 1);  
});


socket.on('dead', function(){
  playing = false;
});

socket.emit('available');

function playerLoop() {
  if(playing) {
                  
  var move = r.lpop("playerMoves", function(err, reply) {
    if(reply)
      socket.emit('playerMove', playerId, JSON.parse(reply));
  });
  
  // Let the torch glow a bit first!
  socket.emit('torchDecrease', playerId);

}
}


socket.on('getTorch', function(newTorch){
    torch = newTorch;
   if(torch < 255)
    r.set('torch', torch, function(){});

})

socket.on('moveResult', function(moveResult){
  
  console.log(moveResult);

  r.set('wall', !moveResult.moveStatus, function(){});


})
        



//setInterval(function(){



//  console.log('new loop');
//}, 1000);
