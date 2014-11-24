/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    var style1 = { font: '18px Arial', fill: '#ffffff', align: 'center'};

    this.asset = this.add.sprite(this.game.width/2, this.game.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    var text = this.game.add.text(this.game.width/2, this.game.height/2 - 100, 'Loading "The Bank Job" ...', style1);
    text.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    //gfx
    this.load.image('room01', 'assets/bg.jpg');
    // this.load.image('tombstone', 'assets/tombstone.png');
    this.load.image('bags', 'assets/bags.png');
    this.load.spritesheet('bankkey', 'assets/key.png', 24, 45);
    this.load.spritesheet('door_north', 'assets/door_top.png', 165, 70);
    this.load.spritesheet('door_south', 'assets/door_bottom.png', 165, 70);
    this.load.spritesheet('door_west', 'assets/door_left.png', 104, 165);
    this.load.spritesheet('door_east', 'assets/door_right.png', 104, 165);
    this.load.spritesheet('protagonist', 'assets/protagonist.png', 66, 54);
    this.load.spritesheet('monster', 'assets/cop_to_top.png', 66, 54);
    this.load.spritesheet('plant', 'assets/plant.png', 65, 65);
    this.load.spritesheet('chair', 'assets/chair.png', 50, 50);
    // sfx
    this.load.audio('door1', ['assets/sfx/doorslam.ogg', 'assets/sfx/doorslam.m4a']);
    this.load.audio('door2', ['assets/sfx/doorslam02.ogg', 'assets/sfx/doorslam02.m4a']);
    this.load.audio('pickupkey', ['assets/sfx/pickupkey.ogg', 'assets/sfx/pickupkey.m4a']);
    this.load.audio('walk2', ['assets/sfx/walk02.ogg', 'assets/sfx/walk02.m4a']);
    this.load.audio('walk3', ['assets/sfx/walk03.ogg', 'assets/sfx/walk03.m4a']);
    this.load.audio('alarm1', ['assets/sfx/alarm01.ogg', 'assets/sfx/alarm01.m4a']);
    this.load.audio('alarm2', ['assets/sfx/alarm02.ogg', 'assets/sfx/alarm02.m4a']);
    this.load.audio('music', ['assets/sfx/thebankjob.ogg', 'assets/sfx/thebankjob.m4a']);
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;
