/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

var _ = require('lodash')
  , _globals = require('./globals');

function getOffset(size, mysize) {
  return -(size / 2 - (size - mysize));
}

function enablSpritePhysics(game, sprite, bbox, immovable, worldBounds) {
  game.physics.arcade.enable(sprite);
  sprite.body.immovable = immovable;
  sprite.body.collideWorldBounds = typeof worldBounds !== 'undefined' ? worldBounds : false;
  if (bbox) {
    sprite.body.setSize(bbox[0], bbox[1], bbox[2], bbox[3]); // mind the anchor
  } else {
    // console.log('default', sprite.width, sprite.height);
    sprite.body.setSize(sprite.width, sprite.height);
  }
}

function randomPos(game, xOffset, yOffset, cx, cy) {
  var mcx = cx || game.width / 2
    , mcy = cy || game.height / 2;
  return {
    x: mcx + ((Math.random() * xOffset) * game.math.randomSign()),
    y: mcy + ((Math.random() * yOffset) * game.math.randomSign())
  };
}

function Gamefactory(game) {
  this.game = game;
  this.roomGroup = this.game.add.group();
  this.actorGroup = this.game.add.group();

  var font = { font: '22px Arial', fill: '#2A2A2A' };
  this.msg = game.add.text(game.width / 2 - (100 / 2 * 1.5), game.height / 2 - 50, '', font);
  this.msg.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
}

Gamefactory.prototype = {

  init: function() {
    // init physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.setBounds(145, 140, 670, 425);
  },

  addAudio: function() {
    var sfx = {};
    sfx.door1 = this.game.add.sound('door1');
    sfx.door2 = this.game.add.sound('door2');
    sfx.pickupkey = this.game.add.sound('pickupkey');
    sfx.walk2 = this.game.add.sound('walk2');
    sfx.walk3 = this.game.add.sound('walk3');
    sfx.alarm1 = this.game.add.sound('alarm1');
    sfx.alarm2 = this.game.add.sound('alarm2');
    sfx.music = this.game.add.sound('music');
    return sfx;
  },

  addText: function(text, cb) {
    this.msg.alpha = 1;
    this.msg.setText(text);
    var tween = this.game.add.tween(this.msg).to( { alpha: 0 }, _globals.TEXT_DELAY,
      Phaser.Easing.Quartic.In, true, 0, 0, false);
    if (cb) {
      tween.onComplete.add(cb);
    }
  },

  addPlayer: function(x, y) {
    var animSpeed = _globals.PLAYER_WALK_ANIM_SPEED;
    var player = this.game.add.sprite(x, y, 'protagonist');
    player.animations.add('walk', [ 0, 1, 2, 1 ], animSpeed, true);
    player.anchor.set(0.5, 0.5);

    enablSpritePhysics(this.game, player, [50, 6, 8, 26], false, true);
    // enablSpritePhysics(this.game, player, [60, 6, getOffset(66, 60), getOffset(54, 6)], false, true);
    this.actorGroup.add(player);
    return player;
  },

  addMonster: function(x, y) {
    var animSpeed = _globals.PLAYER_WALK_ANIM_SPEED;
    var monster = this.game.add.sprite(x, y, 'monster');
    monster.animations.add('walk', [ 0, 1, 2, 1 ], animSpeed, true);
    monster.anchor.set(0.5);

    enablSpritePhysics(this.game, monster, [40, 11, 4, 26], false, true);
    this.actorGroup.add(monster);
    return monster;
  },

  addMonsters: function(monsters) {
    _.forEach(monsters, function(monster) {
      var pos = randomPos(this.game, 75, 75);
      var sprite = this.addMonster(pos.x, pos.y);
      sprite.exists = false;
      monster.obj = sprite;
    }, this);

    return monsters;
  },

  addRoom: function(maze, roomIdx, monsters, cbFadein) {
    var self = this
      , pos
      , obj = {}
      , room = maze.rooms[roomIdx]
      , sprite;

    obj.doors = [];
    obj.artifacts = [];

    this.roomGroup.add(this.game.add.sprite(0, 0, 'room01'));

    // doors
    _.forEach(room.scheme.doors, function(door) {
      var dobj, bbox;
      switch(door) {
        case _globals.DN:
          dobj = self.game.add.sprite(480, 74, 'door_north', 0);
          bbox = [160, 4, 2, 66];
        break;
        case _globals.DS:
          dobj = self.game.add.sprite(480, 565, 'door_south', 0);
          bbox = [160, 4, 2, 0];
        break;
        case _globals.DW:
          dobj = self.game.add.sprite(105, 320, 'door_west', 0);
          bbox = [4, 165, 40, 0];
        break;
        case _globals.DE:
          dobj = self.game.add.sprite(855, 320, 'door_east', 0);
          bbox = [4, 165, -40, 0];
        break;
        default:
          throw 'check your head boy!';
        break;
      }

      dobj.aim = door;
      dobj.anchor.set(0.5, 0.5);
      enablSpritePhysics(self.game, dobj, bbox, true);
      obj.doors.push(dobj);

      // defaults
      dobj.isOpen = false;
      dobj.isRed = false;
      if (room.scheme.redDoor === door) {
        dobj.tint = 0xFF0F0F;
        dobj.isRed = true;
      }

      self.roomGroup.add(dobj);
    });

    // monster currently in this room are now visible
    _.forEach(monsters, function(monster) {
      if (monster.roomIdx === room.idx) {
        monster.obj.exists = true;
        var pos = randomPos(this.game, 35, 35);
        monster.obj.x = pos.x;
        monster.obj.y = pos.y;
      } else if (monster.erratic) {
        // chance to spawn a cop
        if (this.game.math.chanceRoll(maze.spawnChance)) {
          _globals.debug(maze.spawnChance + '% chance enemy spawned');

          var pos = randomPos(this.game, 35, 35);
          monster.obj.x = pos.x;
          monster.obj.y = pos.y;
          monster.obj.exists = true;
          monster.type = this.game.math.getRandom([_globals.MONSTER01, _globals.MONSTER02]);

          maze.spawnChance = _globals.SPAWN_COP_CHANCE; // reset to 25% again
        } else {
          maze.spawnChance += _globals.SPAWN_COP_CHANCE;
        }
      }
    }, this);

    // key placement
    if (room.scheme.hasKey) {
      pos = randomPos(this.game, 200, 200);
      obj.key = this.addKey(pos.x, pos.y);
    }

    // artifacts
    sprite = this.addArtefact(room.scheme.art1);
    if (sprite)
      obj.artifacts.push(sprite);

    sprite = this.addArtefact(room.scheme.art2);
    if (sprite)
      obj.artifacts.push(sprite);

    if (roomIdx === maze.playerPos) {
      var sprite = this.addBags();
      obj.artifacts.push(sprite);
    }

    if (typeof cbFadein !== 'undefined') {
      this.roomGroup.alpha = 0.125;
      var tween = this.game.add.tween(this.roomGroup).to( { alpha: 1 }, _globals.ROOM_ENTER_DELAY,
        Phaser.Easing.Linear.None, true, 0, 0, false);
      tween.onComplete.add(cbFadein);
    }

    room.obj = obj;
    return room;
  },

  addArtefact: function(type) {
    var sprite;
    switch(type) {
      case _globals.PLANT01:
        sprite = this.game.add.sprite(755, 105, 'plant', 0);
      break;
      case _globals.PLANT02:
        sprite = this.game.add.sprite(155, 105, 'plant', 1);
      break;
      case _globals.CHAIR01:
        sprite = this.game.add.sprite(155, 105, 'chair', 0);
      break;
      case _globals.CHAIR02:
        sprite = this.game.add.sprite(755, 105, 'chair', 1);
      break;
      case _globals.CHAIR03:
        sprite = this.game.add.sprite(150, 505, 'chair', 2);
      break;
      case _globals.CHAIR04:
        sprite = this.game.add.sprite(785, 500, 'chair', 3);
      break;
    }
    if (sprite) {
      this.roomGroup.add(sprite);
      enablSpritePhysics(this.game, sprite, null, true);
      // enablSpritePhysics(this.game, sprite, [50, 50, 0, 0], true);
    }
    return sprite;
  },

  addBags: function(x, y) {
    var sprite = this.game.add.sprite(110, _globals.SCREEN_HEIGHT - 220, 'bags');
    enablSpritePhysics(this.game, sprite, [141, 141, 0, 20], true);
    this.roomGroup.add(sprite);
    return sprite;
  },

  addTombstone: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'tombstone');
    sprite.anchor.set(0.5);
    this.actorGroup.add(sprite);
    return sprite;
  },

  addKey: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'bankkey');
    sprite.animations.add('twinkle', [ 0, 1, 2 ], 3, true);
    sprite.play('twinkle');
    sprite.anchor.set(0.5);
    enablSpritePhysics(this.game, sprite, [24, 35, 0, 10], true);
    this.roomGroup.add(sprite);
    return sprite;
  },

  destroyRoom: function(room, monsters) {
    this.roomGroup.destroy(true, true);

    _.forEach(monsters, function(monster) {
      monster.obj.exists = false;
    }, this);

  },

  destroyAll: function() {
    this.roomGroup.destroy(true, false);
    this.actorGroup.destroy(true, false);
  },

  fadeoutAll: function(fadeSpeed, cb) {
    this.game.add.tween(this.actorGroup).to( { alpha: 0 }, fadeSpeed,
      Phaser.Easing.Linear.None, true, 0, 0, false);
    var tween = this.game.add.tween(this.roomGroup).to( { alpha: 0 }, fadeSpeed,
      Phaser.Easing.Linear.None, true, 0, 0, false);
    tween.onComplete.add(cb);
  },

  generateRoomsGrid: function(w, h) {
    var x, y, idx, size = w * h
      , maze = []
      , playerRoom = w / 2 + (h / 2) * w;

    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {

        idx = x + y * w;

        // new room
        var room = {
          scheme: {
            doors: [],
            hasKey: false
          }
        };

        room.idx = idx;

        // doors
        if (x > 0 && x < w - 1) {
          room.scheme.doors.push(_globals.DW);
          room.scheme.doors.push(_globals.DE);
        } else if (x === 0) {
          room.scheme.doors.push(_globals.DE);
        } else if (x === w - 1) {
          room.scheme.doors.push(_globals.DW);
        }

        if (y > 0 && y < h - 1) {
          room.scheme.doors.push(_globals.DN);
          room.scheme.doors.push(_globals.DS);
        } else if (y === 0) {
          room.scheme.doors.push(_globals.DS);
        } else if (y === h - 1) {
          room.scheme.doors.push(_globals.DN);
        }

        maze[idx] = room;
      }
    }

    maze[size - 2].scheme.hasKey = true;
    maze[size - 1].scheme.doors.push(_globals.DE);
    maze[size - 1].scheme.redDoor = _globals.DE;

    return {
      playerPos: playerRoom,
      endRoom: 14,
      keyRoom: 15,
      rooms: maze,
      spawnChance: _globals.SPAWN_COP_CHANCE
    };
  },
  /**
   * Generate a random maze of rooms given width & height
   *
   * @param  {integer} w Maze width
   * @param  {integer} h Maze height
   * @return {Object}   [description]
   */
  generateMaze: function(w, h) {
    var x, y
      , size = w * h
      , maze = []
      , allDoors = [_globals.DN, _globals.DS, _globals.DW, _globals.DE]
      , playerRoom = w / 2 + (h / 2) * w
      , artefacts01 = [_globals.PLANT01, 0, _globals.CHAIR01, _globals.PLANT02, _globals.CHAIR02]
      , artefacts02 = [_globals.CHAIR03, 0, _globals.CHAIR04];

    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        var i = x + y * w;


        // new empty room
        var room = {
          scheme: {
            doors: [],
            hasKey: false,
            art1: this.game.math.getRandom(artefacts01),
            art2: this.game.math.getRandom(artefacts02),
          }
        };
        room.idx = i;
        room.x = x;
        room.y = y;
        maze[i] = room;
      }
    }

    var findNeighbours = function(index) {
      var neighbours = []
        , mod = index % w
        , x = maze[index].x
        , y = maze[index].y;

      if (x - 1 >= 0 && maze[index - 1].scheme.doors.length === 0) {
        neighbours.push({idx: index - 1, door: _globals.DW}); //west
      }
      if (x + 1 < w && maze[index + 1].scheme.doors.length === 0) {
        neighbours.push({idx: index + 1, door: _globals.DE}); //east
      }
      if (y - 1 >= 0 && maze[index - w].scheme.doors.length === 0) {
        neighbours.push({idx: index - w, door: _globals.DN}); //north
      }
      if (y + 1 < h && maze[index + w].scheme.doors.length === 0) {
        neighbours.push({idx: index + w, door: _globals.DS}); //south
      }
      // if (mod !== 0 && index - 1 > 0 && maze[index - 1].scheme.doors.length === 0) {
      //   neighbours.push({idx: index - 1, door: _globals.DW}); //west
      // }
      // if (mod !== w - 1 && index + 1 < size && maze[index + 1].scheme.doors.length === 0) {
      //   neighbours.push({idx: index + 1, door: _globals.DE}); //east
      // }
      // if (index - w > 0 && maze[index - w].scheme.doors.length === 0) {
      //   neighbours.push({idx: index - w, door: _globals.DN}); //north
      // }
      // if (index + w < size && maze[index + w].scheme.doors.length === 0) {
      //   neighbours.push({idx: index + w, door: _globals.DS}); //south
      // }
      return neighbours;
    };

    var mirrorDoor = function(door) {
      switch(door) {
        case _globals.DN: return _globals.DS;
        case _globals.DS: return _globals.DN;
        case _globals.DW: return _globals.DE;
        case _globals.DE: return _globals.DW;
      }
      throw 'No doors avail. dude!';
    };

    var putRedDoor = function(cell) {
        var result = _.difference(allDoors, maze[cell].scheme.doors);
        var redDoor = this.game.math.getRandom(result);
        maze[cell].scheme.doors.push(redDoor)
        maze[cell].scheme.redDoor = redDoor;
        return cell;
    }.bind(this);

    // create maze paths
    var cellStack = []
      , currentCell = playerRoom
      , cellEnd = -1
      , cellKey = -1
      , numVisited = 1
      , neighbours
      , n;

    while (numVisited < size) {
      neighbours = findNeighbours(currentCell);
      if (neighbours.length > 0) {
        n = this.game.math.getRandom(neighbours);
        // knock walls
        maze[currentCell].scheme.doors.push(n.door);
        maze[n.idx].scheme.doors.push(mirrorDoor(n.door));
        // console.log('puttin doors in cells: %d=%d / %d=%d', currentCell, n.door, n.idx, mirrorDoor(n.door));
        // mark as visited
        cellStack.push(currentCell);
        currentCell = n.idx;
        numVisited++;
      } else {
        if (cellEnd === -1) {
          // put the door here
          cellEnd = putRedDoor(currentCell);
          _globals.debug('exit at: ' + currentCell);
        }
        currentCell = cellStack.pop();
      }
    }

    if (cellEnd === -1) {
      _globals.debug('exit at end path: ' + currentCell);
      cellEnd = putRedDoor(currentCell);
    }

    // put key in a room with only 1 entrance
    for (i = maze.length - 1; i >= 0; i--) {
      var scheme = maze[i].scheme;
      if (scheme.doors.length === 1 && i !== playerRoom && i !== cellEnd) {
        scheme.hasKey = true;
        _globals.debug('key at: ' + i);
        cellKey = i;
        break;
      }
    }

    if (cellKey === -1) {
      // put key at random, if all fails
      console.error("Something messed while generating end points! :( Sorry, pls restart!");
      while (cellKey === -1) {
        n = this.game.math.getRandom(maze);
        if (n.idx !== playerRoom && n.idx !== cellEnd) {
          cellKey = n.idx;
          n.scheme.hasKey = true;
          _globals.debug('key at somepath: ' + cellKey);
          break;
        }
      }
    }

    // maze[currentCell].scheme.hasKey = true;
    // console.log('key is at: ', currentCell);
    // cellKey = currentCell;

    // numVisited = 0;
    // currentCell = 0;
    // cellStack.length = 0;
    // var doors, pool = [];

    // while (numVisited < size) {
    //   console.log('visiting: ', currentCell);
    //   doors = maze[currentCell].scheme.doors;
    //   pool[currentCell] = pool[currentCell] || {};
    //   pool[currentCell].visited = pool[currentCell].visited || [];

    //   if (pool[currentCell].visited.length < doors.length) {

    //     if (doors.length - pool[currentCell].visited.length === 1 && maze[currentCell].scheme.redDoor) {
    //       pool[currentCell].visited.push(maze[currentCell].scheme.redDoor);
    //       continue;
    //     }

    //     n = this.game.math.getRandom(doors);
    //     // console.log(pool[currentCell].visited, n);
    //     while (_.contains(pool[currentCell].visited, n)) {
    //       n = this.game.math.getRandom(doors);
    //     }
    //     pool[currentCell].visited.push(n);
    //     // console.log('visited: %d %d', currentCell, n, doors);

    //     cellStack.push(currentCell);
    //     switch(n) {
    //       case _globals.DN: currentCell -= w; break;
    //       case _globals.DS: currentCell += w; break;
    //       case _globals.DW: currentCell -= 1; break;
    //       case _globals.DE: currentCell += 1; break;
    //     }
    //     pool[currentCell] = pool[currentCell] || {};
    //     pool[currentCell].visited = pool[currentCell].visited || [];
    //     pool[currentCell].visited.push(mirrorDoor(n));
    //     numVisited++;
    //   } else {
    //     console.log('dead end at: ' + currentCell);
    //     if (currentCell === 0) {
    //       break;
    //     }
    //     currentCell = cellStack.pop();
    //     if (!currentCell) {
    //       break;
    //     }
    //     // console.log('popped: ', currentCell);
    //   }
    // }

    return {
      playerPos: playerRoom,
      endRoom: cellEnd,
      keyRoom: cellKey,
      rooms: maze,
      spawnChance: _globals.SPAWN_COP_CHANCE
    };
  },

  generateMonsters: function(maze) {
    var monsters = [];

    monsters.push({roomIdx: maze.endRoom, type: _globals.MONSTER01});
    monsters.push({roomIdx: maze.keyRoom, type: _globals.MONSTER01});

    if (this.game.math.chanceRoll(50)) {
      monsters.push({roomIdx: maze.keyRoom, type: _globals.MONSTER02});
    } else {
      monsters.push({roomIdx: maze.endRoom, type: _globals.MONSTER02});
    }

    // put key in a room with 3 doors
    for (var i = maze.rooms.length - 1; i >= 0; i--) {
      var scheme = maze.rooms[i].scheme;
      if (scheme.doors.length >= 3) { //&& i !== maze.endRoom) {
        monsters.push({roomIdx: i, type: _globals.MONSTER01});
        _globals.debug('ghost at 3 doors room: ' + i);
      }
    }

    // monster that has 30% change to appear in next room
    monsters.push({roomIdx: -1, type: _globals.MONSTER02, erratic: true});

    _.each(monsters, function(monster) {
      monster.trackTime = 0;
    });

    return monsters;
  },

  updateDepths: function(monsters) {
    if (monsters.length > 0) {
      this.actorGroup.sort('y');
    }
  }

};

/**
 * Exports
 */

module.exports = Gamefactory;
