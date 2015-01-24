/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(960, 640, Phaser.AUTO, 'thebankjob');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameintro', require('./states/gameintro'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('gamewin', require('./states/gamewin'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
