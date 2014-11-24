/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
   var style1 = { font: '65px Arial', fill: '#131313', align: 'center'}
      , style2 = { font: '18px Arial', fill: '#131313', align: 'center'}
      , style3 = { font: '15px Arial', fill: '#131313', align: 'center'}
      , text;

    this.game.stage.backgroundColor = '#ffffff';

    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'bags');
    this.sprite.angle = 115;
    this.game.add.tween(this.sprite).to({angle: 160}, 2000, Phaser.Easing.Linear.NONE, true, 0, 5000, true);
    this.sprite.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 260, 'Fed up with your boring job as a bank clerk you decide to rob the bank', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 280, 'and spend the rest of your days on a sunny island. You\'ve got the money ', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 300, 'and now you just need to escape without getting caught.', style2);
    text.anchor.setTo(0.5, 0.5);


    text = this.game.add.text(this.game.world.centerX, 380, 'Use Arrow keys or WASD keys to move.', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 400, 'Press Enter or Space key to open doors.', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 485, 'Click anywhere to start', style2);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(735, 580, 'Press \'N \'to toggle Sound on/off', style3);
    text = this.game.add.text(735, 600, 'Press \'M\' to toggle Music on/off', style3);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;
