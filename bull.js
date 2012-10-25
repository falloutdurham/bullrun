
var map = [];
var visitedMap = {};
var nodePath = [];
var bullingDistance = 8;
var io = require('socket.io-client')
var player = [];
var socket = io.connect('http://localhost:2048');
var playerId ;


socket.on('enterTheBull', function(){
  console.log("sending in the bull!");
  socket.emit('playerConnect', "bull", 2);


});

socket.emit('available');

// Once we have the ID, we start the main event loop - nothing
// fancy, really. Check to see if we're near the player, and
// if so, try to catch her, otherwise, pick a target and go there

socket.on('playerNewId', function(id, newMap, newPlayer) {
  
  console.log("ID is: " + id);
  map = newMap;
  
  player = newPlayer;
  playerId = id;

  
  setInterval(function(){

    var bullingCheck = nearPlayer();
    
    if(bullingCheck.withinBulling) {

      if(nodePath.length === 0)
        dMove(bullingCheck.target);  

        if(nodePath.length > 5) {
          nodePath = [];
          dMove(bullingCheck.target);  
      }  
    }
    
    if(nodePath.length === 0) 
      getNewTarget();                

    var newNode = nodePath.pop();

    if(newNode) {
      newDirection= newNode.direction;
      socket.emit('playerMove', playerId, [newDirection, 1]);
    }

    }, 1000);

});


function nearPlayer() {
  for(var i = 0; i< map.length; i++) {
    for (var j = 0; j < map[i].length; j++) {
     if(map[i][j].type && map[i][j].type === 1) {   
      var withinBulling = ( Math.floor(Math.sqrt(Math.pow(player.x-i,2)+Math.pow(player.y-j,2))) < bullingDistance)
      socket.emit('message', "Bull IS NEAR!!");

      return {withinBulling: withinBulling, target: {x: i, y: j}};
        
     }
    }
  }
  return {withinBulling: false, target: {x: 0, y: 0}};;
}

function getNewTarget() {
    console.log("selecting new target");
    targets = [{x: 6, y: 3}, {x: 12, y: 18}];
    dMove(targets[Math.floor(Math.random()*targets.length)]);
}


function randomMovement(){
  var pointsToCheck = [];
    if(player.x-1 >= 0 && map[player.x-1][player.y] !=1)
      pointsToCheck.push({x:player.x-1, y:player.y, direction: 0})
    if (player.x+1 < dMap[0].length && map[player.x+1][player.y] !=1)
      pointsToCheck.push({x:player.x+1, y:player.y, direction: 180})
    if (player.y-1 >= 0  && map[player.x][player.y-1] !=1)
      pointsToCheck.push({x:player.x, y:player.y-1, direction: 270})
    if (player.y+1 < dMap.length && map[player.x][player.y+1] !=1)
      pointsToCheck.push({x:player.x, y:player.y+1, direction: 90})

    console.log(pointsToCheck);

    var randomMove = Math.floor(Math.random() * pointsToCheck.length);
    
    return pointsToCheck[randomMove].direction;
}

// And now, another attempt at dijikstra.

function dMove(targetPoint) {

  var target = targetPoint;
  var openSet = {};
  var closedSet = {};
  var noSolution = false;
  var startPoint = {x: player.x, y: player.y, parent: null, g: 0, f: 0, h:0};


  var checkOpenSet = function(point) {
    var key = ""+point.x+":"+point.y;
     if(key in openSet) {
      
      return true;
     }
     else return false;
      
  }

  var checkClosedSet = function(point){
     var key = ""+point.x+":"+point.y;
     if(key in closedSet) {
     
      return true;
     }
     else return false;
      
  }

  var gScoreNeighbours = function(point) {

    if(point.x-1 >= 0 && map[point.x-1][point.y] !== 1) {
      
      var newPoint = {x:point.x-1, y:point.y, 
                    direction: 0, g:point.g+10,
                    h: 0, parent: point};
                    newPoint.h = calcDistance(newPoint);  
      newPoint.f = newPoint.h + newPoint.g

      if (checkOpenSet(newPoint)) {
        if(openSet[""+newPoint.x+":"+newPoint.y].g > newPoint.g) {
          openSet[""+newPoint.x+":"+newPoint.y].parent = point;
          openSet[""+newPoint.x+":"+newPoint.y].g = newPoint.g;
          openSet[""+newPoint.x+":"+newPoint.y].f = newPoint.g + newPoint.h;
        }
      }

      if(!checkOpenSet(newPoint) && !checkClosedSet(newPoint))
        openSet[""+newPoint.x+":"+newPoint.y] = newPoint;


      
    }
    if(point.x+1 < map.length && map[point.x+1][point.y] !== 1) {
      
      var newPoint ={x:point.x+1, y:point.y, direction: 180, g:point.g+10, h:0, f:0, parent: point}
      newPoint.h = calcDistance(newPoint);  
      newPoint.f = newPoint.h + newPoint.g
      if (checkOpenSet(newPoint)) {
        if(openSet[""+newPoint.x+":"+newPoint.y].g > newPoint.g) {
          openSet[""+newPoint.x+":"+newPoint.y].parent = point;
          openSet[""+newPoint.x+":"+newPoint.y].g = newPoint.g;
          openSet[""+newPoint.x+":"+newPoint.y].f = newPoint.g + newPoint.h;
        }
      }

      if(!checkOpenSet(newPoint) && !checkClosedSet(newPoint))
        openSet[""+newPoint.x+":"+newPoint.y] = newPoint;
    }
    if(point.y-1 >= 0 && map[point.x][point.y-1] !== 1) {
     
      var newPoint = {x:point.x, y:point.y-1, direction: 270, g:point.g+10, h:0,f:0, parent: point}
      newPoint.h = calcDistance(newPoint);
      newPoint.f = newPoint.h + newPoint.g  
      if (checkOpenSet(newPoint)) {
        if(openSet[""+newPoint.x+":"+newPoint.y].g > newPoint.g) {
          openSet[""+newPoint.x+":"+newPoint.y].parent = point;
          openSet[""+newPoint.x+":"+newPoint.y].g = newPoint.g;
          openSet[""+newPoint.x+":"+newPoint.y].f = newPoint.g + newPoint.h;
        }
      }

      if(!checkOpenSet(newPoint) && !checkClosedSet(newPoint))
        openSet[""+newPoint.x+":"+newPoint.y] = newPoint;
    }
    if(point.y+1 < map[0].length && map[point.x][point.y+1] !== 1) {
     
      var newPoint = {x:point.x, y:point.y+1, direction: 90, g:point.g+10, h:0, f:0 , parent: point}
      newPoint.h = calcDistance(newPoint);
      newPoint.f = newPoint.h + newPoint.g  
      if (checkOpenSet(newPoint)) {
        if(openSet[""+newPoint.x+":"+newPoint.y].g > newPoint.g) {
          openSet[""+newPoint.x+":"+newPoint.y].parent = point;
          openSet[""+newPoint.x+":"+newPoint.y].g = newPoint.g;
          openSet[""+newPoint.x+":"+newPoint.y].f = newPoint.g + newPoint.h;
        }
      }

      if(!checkOpenSet(newPoint) && !checkClosedSet(newPoint))
        openSet[""+newPoint.x+":"+newPoint.y] = newPoint;
    }

    
  }



  var calcDistance = function(point) {
    var horizontal = Math.pow((target.x - point.x),2);
    var vertical = Math.pow((target.y - point.y),2);

    var distance = Math.ceil(Math.sqrt(horizontal + vertical)) * 10;
   
    return distance;
  }

  var findLowestF = function(openSet) {
    var lowestF = 99999;
    var lowestPoint;
    for (var member in openSet){
    
      if(openSet.hasOwnProperty(member)) {
        if(!lowestF || openSet[member].f < lowestF)
          lowestF = openSet[member].f, lowestPoint = member
      }

    }

    return member;
  }

 
  closedSet[""+player.x+":"+player.y] = startPoint;

  gScoreNeighbours(startPoint);



  do {
    if(Object.keys(openSet).length === 0) {
      noSolution = true;
      break;
    }
      
      nextNode = findLowestF(openSet);
      console.log(nextNode)
      gScoreNeighbours(openSet[nextNode]);
      closedSet[nextNode] = openSet[nextNode];
      delete openSet[nextNode];
  } while (nextNode != ""+target.x+":"+target.y)

  if (noSolution) 
    return false;

  var pathStart = ""+target.x+":"+target.y;
  var nextPathNode = closedSet[pathStart];
  var endPoint;
  
  do {
      nodePath.push(nextPathNode);
      endPoint = nextPathNode;

    nextPathNode = nextPathNode.parent;
  } while(nextPathNode.parent !== null)

  console.log(endPoint);


  //gscoreMap(startPoint, null);
  //hfscoreMap(openSet);
  //nextMove = pathFind();
  //visitedMap[""+nextMove.x+":"+nextMove.y] = nextMove;
  //return nextMove.direction;

  //console.log(openSet)

  return endPoint.direction;
}

socket.on('moveResult' ,function(moveResult, newMap, playerStatus) {
    player=playerStatus;
    console.log("Location" + player.x + " " + player.y)
    map = newMap;
    if(!visitedMap) 
      visitedMap = newMap;



    
    console.log(moveResult);

  })

