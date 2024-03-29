// map.js

// mapping code for Bull Run - fairly simple, tbh.

// Map symbols:
//  0     - Space
//  1     - Wall
//  2-8   - Er, possible items. 2 is probably a torch
//  8 - EXIT!
//  9     - Spawn point

// Scores:
//
//  100 per square
//  1000 per PBR
//  5000 getting to the exit



function Player(id) {

  this.x = 0,
  this.y = 0,
  this.heading = 0,
  this.standingOn = 0,
  this.type = "", 
  this.id = id,
  this.score = 0;
  this.name = "Player 1";
  this.dead = false;
  this.torch = 1500;
 
  this.getId = function () {
    return this.id;
  };


Player.PLAYER = 1;
Player.BULL = 2;

}



var Map = {

  map: [],

  // Initialize the map with a 2D - this will hopefully be filled in by an
  // AJAX call during server start up

  init: function(map) {

    this.map = map || 
    [
    [9,1,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,9],
    [0,0,1,0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,1,1],
    [0,0,1,0,0,0,0,1,0,1,1,1,0,0,0,0,1,0,1,0],
    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,2,0,0,0],
    [1,1,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,1,0,0,0,0,2,0,0,0,1,0,0,1],
    [0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0],
    [1,1,1,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,2,0,0,1,2,0,0,1,1,0,2,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,8,0,0,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,2,1,1,1,1,0,0,0,0,0,0,0,2],
    [1,0,0,0,0,0,0,0,1,2,0,1,1,1,1,1,1,1,0,1],
    [1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,2,0,0,0,0,1,0,1,0,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1],
    [0,0,1,0,0,0,1,0,1,0,1,0,1,1,1,0,1,0,0,0],
    [0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0],
    [9,1,1,0,1,0,0,0,0,2,0,0,0,0,0,0,1,1,1,9]
    ];
    this.createShadowMask();

  },

  // Helper function that converts the heading angle into a co-ord movement in
  // the map

  convertHeading: function(heading) {

    var movementDirection = [0,0];

    switch(heading) {
      case 0:
        movementDirection = [-1,0];
        break;
      case 45:
        movementDirection = [-1,1];
        break;
      case 90:
        movementDirection = [0,1];
        break;
      case 135:
        movementDirection = [1,1];
        break;
      case 180:
        movementDirection = [1,0];
        break;
      case 225:
        movementDirection = [1,-1];
        break;
      case 270:
        movementDirection = [0,-1];
        break;
      case 315:
        movementDirection = [-1,-1];
        break;

      }
      return movementDirection;
  }

  ,

  // the big move function (may need to be refactored, to be honest). Deals with all
  // the movement conditions - walls, boundaries, items, and DEATH BY BULL.


  move: function(player, heading, speed) {
    

    // attempt to move 

    var movementDirection = this.convertHeading(heading);

    player.heading = heading;

    if (speed === 0)
      return {moveStatus: true, contents: player.standingOn};

    if (player.x+movementDirection[0] < 0 || player.x+movementDirection[0] >= this.map[0].length ) {
      return {moveStatus: false, contents: "boundary"};
    }

    if (player.y+movementDirection[1] < 0 || player.y+movementDirection[1] >= this.map.length ) {
      return {moveStatus: false, contents: "boundary"};
    }

    // Wall!

    if (this.map[player.x+movementDirection[0]][player.y+movementDirection[1]] === 1)  {
      return {moveStatus: false, contents: "wall"};
    }

    // Right, we can move. We should try to make sure that we don't overwrite 
   
    this.map[player.x][player.y] = player.standingOn;

    player.x = player.x+movementDirection[0];
    player.y = player.y+movementDirection[1]; 

    player.standingOn = this.map[player.x][player.y];

    // Now, we're going to handle the death and item pickup conditions.


    // Score increase for moving

    player.score += 100;

    var squareContents = player.standingOn;

    if(player.type === Player.PLAYER && player.standingOn.type === Player.BULL) {
      player.dead =true;
      Map.removePlayer(player);
      return {moveStatus: true, contents: "Dead", moveMessage: player.name + " has been squished!"}
    }
    if(player.type === Player.BULL && player.standingOn.type === Player.PLAYER) {
      moveMessage = squareContents.name + " has been squished!";
      squareContents.dead = true;
      Map.removePlayer(squareContents);
      squareContents = "Killed " + player.standingOn.id;
      player.standingOn = 0;
    }

    // If the player is now standing on something, we should pick it up. Unless 
    // we're a bull!

    if(player.type === Player.PLAYER && (squareContents !== 0 || 9 ))
      player.standingOn = 0;

    var moveMessage;

    if(player.type === Player.PLAYER && squareContents === 2) {
      player.score += 1000;
      moveMessage = player.name + " picked up a PBR!"
    }

    this.map[player.x][player.y] = player;

    if(squareContents === 8) {
      player.score += 5000;
      moveMessage = player.name + " escaped the maze!"
      //Okay, this isn't exactly right, but it does end the game...
      player.dead = true;
      this.map[player.x][player.y]= 8;
    }

    
    this.createShadowMap(player);
    return {moveStatus: true, contents: squareContents, moveMessage: moveMessage};

  },

  // Get a json rep of the map

  getMap: function() {
    return JSON.stringify(this.map);
  },


  // Adds a player to the map. Scans through for unused '9' entry points on
  // the map, picking one at random and replacing it with the player id. 
  //
  //
  // Returns true on adding player, false on failure

  addPlayer: function(player) {

    if(!player.type)
      player.type = Player.PLAYER;

    var entryPoints =[];

    for(var i = 0; i < this.map.length; i++) {
      for(var j = 0; j < this.map[i].length; j++) {
        if(this.map[i][j] === 9) {
          entryPoints.push([i,j]);
        }
      }
    }

    if(entryPoints.length > 0) {
      var newSpawnPoint = entryPoints[Math.floor(Math.random()*entryPoints.length)]; 
      //var newSpawnPoint = [0,0]; 
      this.map[newSpawnPoint[0]][newSpawnPoint[1]] = player;

      player.x = newSpawnPoint[0];
      player.y = newSpawnPoint[1];
      player.standingOn = 9;
      return true;

    }
    return false;
  },

  removePlayer: function(player) {

    if(!player)
      return;

    this.map[player.x][player.y] = player.standingOn;
  },

  test: function() {
    var testPlayer = new Player("derek");
    var bull = new Player("BULL");
    bull.type = Player.BULL;


    console.log(testPlayer.getId());
    console.log(testPlayer.x);

    Map.map = [[0,1,0], 
               [0,9,2],
               [0,1,9]];


    Map.addPlayer(testPlayer);
    Map.addPlayer(bull);

    console.log(Map.map);

    console.log(Map.move(bull, 270,0));
    console.log(Map.map);

    console.log(Map.move(bull, 0,0));
    console.log(Map.map);

    console.log(Map.move(bull, 270,0));
    console.log(Map.map);

  },

  // But what if we constructed a shadow map that could be applied as a mask to
  // the regular map and then returned a map that could be sent to the player?
  // i.e. NO CHEATING! :D

  createShadowMap: function(player) {

    for(var i=0; i < this.shadowMap.length; i++) {
      for(var j=0; j < this.shadowMap[0].length; j++) {
        if(this.shadowMap[i][j]) {
          this.shadowMap[i][j] = this.map[i][j];}
        else
          this.shadowMap[i][j] = 0;
      }
    }    
    console.log(this.shadowMap);
  },

  createShadowMask: function() {
    var shadowMapLength = this.map[0].length;
    var shadowMapHeight = this.map.length;

    this.shadowMap = new Array();

    for(var i=0; i < shadowMapHeight; i++) {
      this.shadowMap[i] = new Array();
      for(var j=0; j < shadowMapHeight; j++) {
        this.shadowMap[i][j] = 1;
      }

    }
  }

};


exports.Map = Map;
exports.Player = Player;



