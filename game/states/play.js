/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

var _ = require('lodash')
  , _globals = require('../globals')
  , Gamefactory = require('../gamefactory');

function Play() {
}

Play.prototype = {
  create: function() {

    this.game.stage.backgroundColor = '#ffffff';

    this.gamecx = this.game.width / 2;
    this.gamecy = this.game.height / 2;

    this.gamefactory = new Gamefactory(this.game);
    this.gamefactory.init();

    // add  game objects
    this.sfx = this.gamefactory.addAudio();

    this.maze = this.gamefactory.generateMaze(_globals.ROOMS_X, _globals.ROOMS_Y);
    // this.maze = this.gamefactory.generateRoomsGrid(_globals.ROOMS_X, _globals.ROOMS_Y);
    this.monsters = this.gamefactory.addMonsters(this.gamefactory.generateMonsters(this.maze));

    this.player = this.gamefactory.addPlayer(this.gamecx, this.gamecy);
    this.player.lastOpenTime = 0;
    this.player.lastWalkSndTime = 0;
    this.player.lastAlarmTime = 0;
    this.player.musicKeyTime = 0;

    this.enterRoom(this.maze.playerPos, this.gamecx, this.gamecy, true);

    // defaults
    this.stopUpdate = false;
    this.player.hasKey = false;
    this.soundOn = true;

    // input
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // add fps counter
    var font = { font: '12px Arial', fill: '#1A1A1A' };
    this.game.time.advancedTiming = true;

    this.texts = {};
    if (_globals.enableDebug) {
      this.texts.fps = this.game.add.text(this.game.width - 70, 5, 'fps:', font);
      this.texts.pos = this.game.add.text(this.game.width - 70, 16, 'pos:', font);
      this.texts.end = this.game.add.text(this.game.width - 70, 26, 'end:', font);
      this.texts.key = this.game.add.text(this.game.width - 70, 36, 'key:', font);
    }

    this.gamefactory.addText('Find the Red door.', function() {
      this.gamefactory.addText('Beware of the cops!');
    }.bind(this));

    // music
    this.playMusic(true);
  },

  update: function(game) {

    if (this.stopUpdate) {
      return;
    }

    var player = this.player
      , room = player.room
      , self = this
      , distance
      , sprite;

    // draw fps
    if (_globals.enableDebug) {
      this.texts.fps.setText('fps: ' + game.time.fps);
      this.texts.pos.setText('room: ' + player.room.idx);
      this.texts.end.setText('end: ' + this.maze.endRoom);
      this.texts.key.setText('key: ' + this.maze.keyRoom);
    }

    // player movement
    var move = 0;
    player.body.velocity.setTo(0, 0);
    if (this.cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
      player.body.velocity.y = -_globals.PLAYER_SPEED;
      move += 1;
    } else if (this.cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
      player.body.velocity.y =  _globals.PLAYER_SPEED;
      move += 2;
    } else if (this.cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
      player.body.velocity.x = -_globals.PLAYER_SPEED;
      move += 10;
    } else if (this.cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
      player.body.velocity.x = _globals.PLAYER_SPEED;
      move += 20;
    }

    if (move === 1) {
      player.angle = 0;
    } else if (move === 2) {
      player.angle = 180;
    } else if (move > 0 && move < 20) {
      player.angle = -90;
    } else if (move >= 20) {
      player.angle = 90;
    } else {
      player.animations.stop();
    }

    // other options
    if (game.input.keyboard.isDown(Phaser.Keyboard.M) && player.musicKeyTime < game.time.now) {
      player.musicKeyTime = game.time.now + 500;
      this.toggleMusic();
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.N) && player.musicKeyTime < game.time.now) {
      player.musicKeyTime = game.time.now + 500;
      this.soundOn = !this.soundOn;
    }

    // monsters movement
    _.each(this.monsters, function(monster) {
      sprite = monster.obj;
      if (sprite.exists && (monster.roomIdx === player.room.idx || monster.erratic)) {
        if (monster.type === _globals.MONSTER01) {
          if (sprite.x < player.x - 10) {
            sprite.body.velocity.x = _globals.MONSTER_SPEED;
          } else if (sprite.x > player.x + 10) {
            sprite.body.velocity.x = -_globals.MONSTER_SPEED;
          }
          if (sprite.y < player.y - 10) {
            sprite.body.velocity.y = _globals.MONSTER_SPEED;
          } else if (sprite.y > player.y + 10) {
            sprite.body.velocity.y = -_globals.MONSTER_SPEED;
          }
        } else if (monster.type === _globals.MONSTER02 && monster.trackTime < game.time.now) {
          monster.trackTime = game.time.now + _globals.MONSTER_ACC_DELAY;
          sprite.body.velocity.setTo(0, 0);
          game.physics.arcade.accelerateToObject(sprite, player, _globals.MONSTER_ACC,
            _globals.MONSTER_MAXSPEED, _globals.MONSTER_MAXSPEED);
        }
        sprite.angle = game.math.wrapAngle(90 + game.math.radToDeg(
          game.physics.arcade.angleBetween(sprite, player), false));
        sprite.play('walk');
      }
    }, this);

    // open/close door
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
      this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
      if (game.time.now > player.lastOpenTime) {
        player.lastOpenTime = game.time.now + 550;

        _.each(player.room.obj.doors, function(door) {
          distance = game.math.distance(player.x, player.y, door.x, door.y);
          // _globals.debug('door dist: ' + distance);
          if (distance < 85) {
            if (door.isRed && !player.hasKey) {
              this.gamefactory.addText('The door is locked!');
            } else {
              door.isOpen = !door.isOpen;
              door.frame = door.isOpen ? 2 : 0;
              this.playSound(['door1', 'door2']);
            }

            return;
          }
        }, this);

      }
    }

    // collisions
    if (move > 0) {

      if (game.time.now > this.player.lastWalkSndTime) {
        this.player.lastWalkSndTime = game.time.now + 250;
        this.player.play('walk');
        this.playSound(['walk2', 'walk3']);
      }

      // room enter?
      _.each(player.room.obj.doors, function(door) {
        // if (door.isOpen) {
          // console.log('door open col');
          game.physics.arcade.collide(player, door, self.onDoorCollision, null, self);
        // }
      });
      _.each(player.room.obj.artifacts, function(obj) {
        game.physics.arcade.collide(player, obj);
      });

      if (room.scheme.hasKey && room.obj.key) {
        game.physics.arcade.collide(player, room.obj.key, self.onKeyCollision, null, self);
      }
    }

    if (!this.isRoomEmpty) {

      if (game.time.now > this.player.lastAlarmTime) {
        this.player.lastAlarmTime = game.time.now + 1000;
        this.playSound(['alarm1', 'alarm2']);
      }

      // update depth in case there are more actors
      this.gamefactory.updateDepths(this.monsters);

      // monster hit test
      _.each(this.monsters, function(monster) {
        game.physics.arcade.collide(player, monster.obj, self.onMonsterCollision, null, self);
      });
    }

  },

  enterRoom: function(roomIndex, px, py, isFirstRoom) {
    var room = this.player.room;
    if (room) {
      this.gamefactory.destroyRoom(room, this.monsters);
    }
    this.player.x = px,
    this.player.y = py;
    this.player.body.velocity.setTo(0, 0);
    this.player.animations.stop();

    var cb;
    // if (!_globals.enableDebug) {
      this.stopUpdate = true;
      cb = function() {
        this.stopUpdate = false;
      }.bind(this);
    // }

    this.player.room = this.gamefactory.addRoom(this.maze, roomIndex, this.monsters, cb);
    this.isRoomEmpty = _.every(this.monsters, function(monster) {
      return !monster.obj.exists;
    });

    // no monsters in first room
    if (!this.isRoomEmpty && isFirstRoom) {
      _.each(this.monsters, function(monster) { monster.obj.exists = false; });
      this.isRoomEmpty = true;
    }

    //TODO: play monster sound, if monster > 0
  },

  onKeyCollision: function(obj1, obj2) {
    var player = obj1.key === 'protagonist' ? obj1 : obj2
      , key = obj1.key === 'protagonist' ? obj2 : obj1;

    // TODO: play sound
    player.hasKey = true;
    key.exists = false;
    this.playSound('pickupkey');
    // key should no longer appear in room
    this.maze.rooms[this.maze.keyRoom].scheme.hasKey = false;
    this.gamefactory.addText('You found a key!');
  },

  onMonsterCollision: function(obj1, obj2) {
    var player = obj1.key === 'protagonist' ? obj1 : obj2
      , monster = obj1.key === 'protagonist' ? obj2 : obj1;

    _globals.debug('Monster hit');

    //TODO: die sprite and play sound

    this.stopUpdate = true;

    monster.body.velocity.setTo(0);
    player.body.velocity.setTo(0);
    player.alpha = 0.5;
    // this.gamefactory.addTombstone(player.x, player.y);

    this.playMusic(null, true); // fadeout music
    var endGame = function() {
      this.playMusic(false); // stop music
      this.gamefactory.destroyAll();
      this.game.state.start('gameover');
    }.bind(this);

    this.gamefactory.fadeoutAll(_globals.GAMEEND_FADE_DELAY, endGame);
  },

  onDoorCollision: function(obj1, obj2) {
    var player = obj1.key === 'protagonist' ? obj1 : obj2
      , door = obj1.key === 'protagonist' ? obj2 : obj1;

    if (!door.isOpen)
      return;

    if (door.isRed) {
      if (player.hasKey) {
        // WINNER
        this.stopUpdate = true;
        this.player.animations.stop();

        this.playMusic(null, true); // fadeout music
        var endGame = function() {
          this.playMusic(false); // stop music
          this.gamefactory.destroyAll();
          this.game.state.start('gamewin');
        }.bind(this);

        this.gamefactory.fadeoutAll(_globals.GAMEEND_FADE_DELAY, endGame);
        return;
      } else {
        // door cannot be opened in the 1st place, so we shouldn' get here.
        throw 'You shouldnt get here! :(';
      }
    }

    var idx = this.player.room.idx
      , newIdx
      , px, py;

    switch(door.aim) {
      case _globals.DN:
        newIdx = idx - _globals.ROOMS_X;
        px = door.x; py = 565 - 37;
      break;
      case _globals.DS:
        newIdx = idx + _globals.ROOMS_X;
        px = door.x; py = 100 + 37;
      break;
      case _globals.DW:
        newIdx = idx - 1;
        px = 855 - 75; py = door.y;
      break;
      case _globals.DE:
        newIdx = idx + 1;
        px = 105 + 68; py = door.y;
      break;
      default:
        throw 'u got it wrong kid!';
      break;
    }

    this.enterRoom(newIdx, px, py);
  },

  playSound: function(sound) {
    if (!this.soundOn)
      return;

    var snd;
    if (Object.prototype.toString.call(sound) === '[object Array]') {
      snd = this.game.math.getRandom(sound);
    } else {
      snd = sound;
    }
    this.sfx[snd].play();
  },

  playMusic: function(play, fade) {
    if (_globals.enableDebug)
      return;

    if (play === false) {
      this.sfx.music.stop();
    } else if (play === true) {
      this.sfx.music.volume = 0.5;
      this.sfx.music.loop = true;
      this.sfx.music.play();
    } else if (fade === true) {
      this.sfx.music.fadeOut(1000);
    }
  },

  toggleMusic: function() {
    if (this.sfx.music.isPlaying) {
      this.playMusic(false);
    } else {
      this.playMusic(true);
    }
  }

};

module.exports = Play;
